import { NextResponse } from "next/server";
import { extractAndFormatPage } from "@/lib/ai-format";
import { fileExt, normalizeUpload } from "@/lib/files";
import { isValidHttpUrl } from "@/lib/setup-status";
import { createServiceSupabase, getEffectiveUser, mockDb } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, validateUploadedFile, errorResponse } from "@/lib/api-utils";
import { log } from "@/lib/logger";
import { trackOcr, captureException } from "@/lib/monitoring";
import type { PaperPage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`process:${ip}`, 10, 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    if (!isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase is not configured. Add environment variables before processing uploads." }, { status: 503 });
    }

    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const files = form.getAll("files").filter((item): item is File => item instanceof File);
    const title = String(form.get("title") || "Untitled question paper");
    const language = String(form.get("language") || "auto");

    if (!files.length) {
      return NextResponse.json({ error: "Upload at least one image or PDF." }, { status: 400 });
    }

    for (const file of files) {
      const validation = validateUploadedFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const supabase = createServiceSupabase();
    const projectId = crypto.randomUUID();

    // STREAM RESPONSE
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          try {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (e) {}
        };

        send({ status: "Preparing database...", progress: 10 });

        try {
          await supabase.from("projects").insert({
            id: projectId,
            user_id: user.id,
            title,
            language,
            status: "processing"
          });
        } catch (err) {
          console.warn("Supabase project insert failed, falling back to mockDb:", err);
        }

        let completed = 0;
        send({ status: "Extracting text from images...", progress: 15 });

        try {
          const pages: PaperPage[] = await Promise.all(
            files.map(async (file, index) => {
              const normalized = await normalizeUpload(file);
              const pageId = crypto.randomUUID();
              const path = `${user.id}/${projectId}/${pageId}.${fileExt(normalized.mimeType)}`;

              let publicUrlStr = "";
              try {
                const upload = await supabase.storage.from("paper-sources").upload(path, normalized.previewBuffer, {
                  contentType: normalized.mimeType,
                  upsert: true
                });
                if (upload.error) throw upload.error;
                const { data: publicUrl } = supabase.storage.from("paper-sources").getPublicUrl(path);
                publicUrlStr = publicUrl.publicUrl;
              } catch (err) {
                publicUrlStr = `data:${normalized.mimeType};base64,${normalized.previewBuffer.toString("base64")}`;
              }

              let ocrText = "";
              let html = "";
              try {
                if (normalized.sourceType === "image") {
                  ({ ocrText, html } = await extractAndFormatPage(normalized.buffer, normalized.mimeType, language));
                } else {
                  ocrText = "PDF page";
                  html = `<p>PDF page ${index + 1} uploaded.</p>`;
                }
              } catch (err) {
                captureException(err, { context: "ocr", fileName: file.name, pageIndex: index });
                ocrText = `[OCR failed for ${file.name}]`;
                html = `<h2>Page ${index + 1}</h2><p>OCR processing failed. Please try re-uploading this page.</p>`;
              }

              completed++;
              send({ 
                status: `Processed page ${completed}/${files.length}`, 
                progress: 15 + Math.round((80 * completed) / files.length) 
              });

              return {
                id: pageId,
                pageNumber: index + 1,
                sourceUrl: publicUrlStr,
                sourceType: normalized.sourceType,
                ocrText,
                html,
                diagrams: (html.match(/\[DIAGRAM HERE\]/g) ?? []).map((_, diagramIndex) => ({
                  id: crypto.randomUUID(),
                  placeholder: `[DIAGRAM HERE ${diagramIndex + 1}]`,
                  pageNumber: index + 1
                }))
              };
            })
          );

          const projectData = {
            id: projectId,
            user_id: user.id,
            title,
            language,
            pages,
            status: "ready" as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          try {
            await supabase
              .from("projects")
              .update({ pages, status: "ready", updated_at: new Date().toISOString() })
              .eq("id", projectId)
              .eq("user_id", user.id);
          } catch (err) {}

          mockDb.mockProjects[projectId] = projectData;

          const durationMs = Date.now() - startTime;
          trackOcr({ provider: process.env.OCR_PROVIDER ?? "openai", fileCount: files.length, success: true, durationMs });
          log.request("POST", "/api/process", 200, durationMs, { fileCount: files.length, userId: user.id });

          send({ status: "Done!", progress: 100, projectId, pages });
          controller.close();
        } catch (error: any) {
          captureException(error, { context: "process_route_stream" });
          send({ error: error.message || "Failed to process files" });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    return errorResponse(error, "process");
  }
}
