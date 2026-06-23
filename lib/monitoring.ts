/**
 * Lightweight monitoring utilities for tracking errors and events.
 *
 * If NEXT_PUBLIC_SENTRY_DSN is set, this can be upgraded to use @sentry/nextjs.
 * For now, it outputs structured JSON logs compatible with Vercel's log drain.
 */

import { log } from "./logger";

/**
 * Capture an exception with optional context.
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  log.error("Exception captured", {
    errorMessage: message,
    stack,
    ...context,
  });
}

/**
 * Track a named event with structured data.
 */
export function trackEvent(
  name: string,
  data?: Record<string, unknown>
) {
  log.info(`Event: ${name}`, {
    event: name,
    ...data,
  });
}

/**
 * Track OCR processing metrics.
 */
export function trackOcr(params: {
  provider: string;
  fileCount: number;
  success: boolean;
  durationMs: number;
  error?: string;
}) {
  trackEvent("ocr_process", {
    provider: params.provider,
    fileCount: params.fileCount,
    success: params.success,
    durationMs: params.durationMs,
    ...(params.error ? { error: params.error } : {}),
  });
}

/**
 * Track export/download metrics.
 */
export function trackExport(params: {
  type: "pdf" | "docx";
  success: boolean;
  durationMs: number;
  error?: string;
}) {
  trackEvent("export", {
    exportType: params.type,
    success: params.success,
    durationMs: params.durationMs,
    ...(params.error ? { error: params.error } : {}),
  });
}
