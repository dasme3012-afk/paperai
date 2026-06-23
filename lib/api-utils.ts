/**
 * Shared API utilities for consistent error handling and responses.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { log } from "./logger";

/**
 * Extract client IP from request headers (works on Vercel and local dev).
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Convert any error into a user-safe error message.
 * Logs the full error server-side, returns a sanitized message to the client.
 */
export function safeError(
  error: unknown,
  context?: string
): { message: string; status: number } {
  // Zod validation errors → 400
  if (error instanceof ZodError) {
    const issues = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { message: `Invalid input: ${issues}`, status: 400 };
  }

  // Known error messages that are safe to expose
  if (error instanceof Error) {
    const safePatterns = [
      "Unauthorized",
      "Upload at least one",
      "Supabase is not configured",
      "exceeds",
      "Invalid file type",
      "File too large",
      "Rate limit exceeded",
      "not found",
      "No AI API key configured",
    ];

    if (safePatterns.some((p) => error.message.includes(p))) {
      return { message: error.message, status: 400 };
    }

    // Log the full error but don't expose it
    log.error(`API Error${context ? ` [${context}]` : ""}`, {
      message: error.message,
      stack: error.stack,
    });
  } else {
    log.error(`API Error${context ? ` [${context}]` : ""}`, { error });
  }

  return { message: "An internal error occurred. Please try again later.", status: 500 };
}

/**
 * Standard JSON error response.
 */
export function errorResponse(error: unknown, context?: string): NextResponse {
  const { message, status } = safeError(error, context);
  return NextResponse.json({ error: message }, { status });
}

/**
 * Validate file upload on the server side.
 */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
]);

const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".ps1", ".msi", ".dll", ".com",
  ".js", ".jsx", ".ts", ".tsx", ".php", ".py", ".rb", ".pl",
  ".vbs", ".wsf", ".scr", ".pif", ".hta", ".cpl",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `${file.name} exceeds the 10 MB limit.` };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `${file.name}: Only JPG, PNG, and PDF files are allowed.` };
  }

  // Check for dangerous extensions
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return { valid: false, error: `${file.name}: This file type is not allowed.` };
  }

  return { valid: true };
}

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
