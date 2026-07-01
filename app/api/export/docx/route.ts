import { NextResponse } from "next/server";
import { z } from "zod";
import { htmlToDocxBuffer } from "@/lib/docx";
import { sanitizeHtml } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, errorResponse } from "@/lib/api-utils";
import { log } from "@/lib/logger";
import { trackExport, captureException } from "@/lib/monitoring";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(1).max(500),
  html: z.string().min(1).max(512_000), // 500KB max HTML input
  pageSize: z.string().optional(),
  pageOrientation: z.string().optional(),
});

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Rate limiting: 20 requests/minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`export-docx:${ip}`, 20, 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const input = schema.parse(await request.json());

    // Sanitize HTML before processing
    const sanitizedHtml = sanitizeHtml(input.html);
    const buffer = await htmlToDocxBuffer(sanitizedHtml, input.title, input.pageSize, input.pageOrientation);

    const durationMs = Date.now() - startTime;
    trackExport({ type: "docx", success: true, durationMs });
    log.request("POST", "/api/export/docx", 200, durationMs);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${input.title.replace(/[^\w.-]+/g, "_")}.docx"`
      }
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    captureException(error, { context: "export_docx" });
    trackExport({ type: "docx", success: false, durationMs, error: error instanceof Error ? error.message : "Unknown" });
    return errorResponse(error, "export-docx");
  }
}
