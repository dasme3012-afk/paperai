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
import sharp from "sharp";

// ─── Diagram Cropping & Watermark Parsing ─────────────────────────────────────

const DIAGRAM_REGEX = /<!--DIAGRAM:(\{[^}]+\})-->/g;
const WATERMARK_REGEX = /<!--WATERMARK:(true|false)-->/;

async function processDiagramMarkers(
  html: string,
  sourceBuffer: Buffer,
  mimeType: string,
  userId: string,
  projectId: string,
  pageId: string,
  supabase: ReturnType<typeof createServiceSupabase>
): Promise<{ html: string; hasWatermark: boolean }> {
  // 1. Extract watermark flag
  const watermarkMatch = html.match(WATERMARK_REGEX);
  const hasWatermark = watermarkMatch ? watermarkMatch[1] === "true" : false;
  // Remove the watermark marker from HTML
  let processedHtml = html.replace(WATERMARK_REGEX, "").trim();

  // 2. Extract diagram markers
  const diagramMatches = [...processedHtml.matchAll(DIAGRAM_REGEX)];
  if (!diagramMatches.length) {
    return { html: processedHtml, hasWatermark };
  }

  // Get source image dimensions
  let imgWidth: number, imgHeight: number;
  try {
    const metadata = await sharp(sourceBuffer).metadata();
    imgWidth = metadata.width || 1800;
    imgHeight = metadata.height || 2400;
  } catch {
    imgWidth = 1800;
    imgHeight = 2400;
  }

  // 3. Process each diagram marker: crop → upload → replace
  for (let i = 0; i < diagramMatches.length; i++) {
    const match = diagramMatches[i];
    const fullMarker = match[0];
    let desc = "Diagram";

    try {
      const coords = JSON.parse(match[1]);
      desc = coords.desc || "Diagram";

      // Convert percentages to pixels with small padding
      const pad = 2; // 2% padding
      const top = Math.max(0, Math.floor(((coords.top || 0) - pad) / 100 * imgHeight));
      const left = Math.max(0, Math.floor(((coords.left || 0) - pad) / 100 * imgWidth));
      const width = Math.min(imgWidth - left, Math.ceil(((coords.width || 20) + pad * 2) / 100 * imgWidth));
      const height = Math.min(imgHeight - top, Math.ceil(((coords.height || 20) + pad * 2) / 100 * imgHeight));

      if (width < 20 || height < 20) throw new Error("Crop region too small");

      // Crop with sharp
      const croppedBuffer = await sharp(sourceBuffer)
        .extract({ left, top, width, height })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload cropped diagram to Supabase
      const diagramPath = `${userId}/${projectId}/diagram-${pageId}-${i}.jpg`;
      let diagramUrl = "";

      try {
        const upload = await supabase.storage.from("paper-sources").upload(diagramPath, croppedBuffer, {
          contentType: "image/jpeg",
          upsert: true
        });
        if (upload.error) throw upload.error;
        const { data: publicUrl } = supabase.storage.from("paper-sources").getPublicUrl(diagramPath);
        diagramUrl = publicUrl.publicUrl;
      } catch {
        // Fallback: embed as data URI
        diagramUrl = `data:image/jpeg;base64,${croppedBuffer.toString("base64")}`;
      }

      // Replace marker with figure element
      const figureHtml = `<figure style="text-align:center;margin:16px auto;max-width:90%;"><img src="${diagramUrl}" alt="${desc}" style="max-width:100%;border:1px solid #e5e7eb;border-radius:4px;display:block;margin:0 auto;" /><figcaption style="font-size:0.8em;color:#888;margin-top:6px;font-style:italic;">${desc}</figcaption></figure>`;
      processedHtml = processedHtml.replace(fullMarker, figureHtml);

    } catch (err) {
      // Fallback: replace marker with text description
      log.warn(`Diagram cropping failed for diagram ${i}`, { error: String(err) });
      const fallbackHtml = `<div style="text-align:center;margin:16px auto;padding:24px;border:2px dashed #d1d5db;border-radius:8px;color:#6b7280;font-style:italic;">📊 ${desc}</div>`;
      processedHtml = processedHtml.replace(fullMarker, fallbackHtml);
    }
  }

  return { html: processedHtml, hasWatermark };
}

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

    // Check Subscription and Quota
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    const isFree = !sub || sub.plan_id === "free" || sub.status !== "active";

    if (isFree) {
      const { data: recentProjects } = await supabase
        .from("projects")
        .select("pages")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      let pagesUsedIn24h = 0;
      for (const p of recentProjects || []) {
        pagesUsedIn24h += Array.isArray(p.pages) ? p.pages.length : 0;
      }

      if (pagesUsedIn24h + files.length > 5) {
        const remaining = Math.max(0, 5 - pagesUsedIn24h);
        return NextResponse.json({ 
          error: `Free limit reached. You can only generate 5 pages per 24 hours. You have ${remaining} page(s) left today.` 
        }, { status: 403 });
      }
    }

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
            status: "processing",
            pages: Array.from({ length: files.length }).map((_, i) => ({ id: `dummy-${i}` }))
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
              let hasWatermark = false;
              try {
                if (normalized.sourceType === "image") {
                  ({ ocrText, html } = await extractAndFormatPage(normalized.buffer, normalized.mimeType, language, publicUrlStr));
                  // Process diagram markers (crop + upload) and parse watermark flag
                  const processed = await processDiagramMarkers(html, normalized.buffer, normalized.mimeType, user.id, projectId, pageId, supabase);
                  html = processed.html;
                  hasWatermark = processed.hasWatermark;
                } else {
                  ocrText = "PDF page";
                  html = `<p>PDF page ${index + 1} uploaded.</p>`;
                }
              } catch (err) {
                captureException(err, { context: "ocr", fileName: file.name, pageIndex: index });
                const errMsg = err instanceof Error ? err.message : String(err);
                log.error("OCR processing failed", {
                  fileName: file.name,
                  pageIndex: index,
                  error: errMsg
                });
                throw new Error(`OCR failed for ${file.name}: ${errMsg}`);
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
                hasWatermark,
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
