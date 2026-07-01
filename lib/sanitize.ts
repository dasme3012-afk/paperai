/**
 * Lightweight HTML sanitizer to prevent XSS from AI-generated content.
 * Strips dangerous tags, event handlers, and javascript: URLs.
 */

// Tags that should be completely removed (including content)
const DANGEROUS_TAGS = /&lt;(script|iframe|object|embed|form|input|textarea|button|link|meta|style|base|applet)\b[^>]*>[\s\S]*?&lt;\/\1>|&lt;(script|iframe|object|embed|form|input|textarea|button|link|meta|style|base|applet)\b[^>]*\/?\s*>/gi;

// Simplified version working with actual < > characters
const STRIP_TAGS_RE = /<(script|iframe|object|embed|form|input|textarea|button|link|meta|base|applet)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const STRIP_SELF_CLOSING_RE = /<(script|iframe|object|embed|form|input|textarea|button|link|meta|base|applet)\b[^>]*\/?>/gi;

// Event handler attributes (on*)
const EVENT_HANDLERS_RE = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

// javascript: and vbscript: URLs in href/src/action attributes (allow https: and data: for images in src)
const DANGEROUS_URLS_RE = /\s+(href|action)\s*=\s*(?:"(?:javascript|data|vbscript):[^"]*"|'(?:javascript|data|vbscript):[^']*')/gi;
const DANGEROUS_SRC_RE = /\s+src\s*=\s*(?:"(?:javascript|vbscript):[^"]*"|'(?:javascript|vbscript):[^']*')/gi;

// style attributes with expression() or url() pointing to javascript:
const DANGEROUS_STYLES_RE = /\s+style\s*=\s*"[^"]*(?:expression|javascript|vbscript)\s*\([^"]*"/gi;

export function sanitizeHtml(html: string): string {
  if (!html) return html;

  let sanitized = html;

  // Remove dangerous tags and their content
  sanitized = sanitized.replace(STRIP_TAGS_RE, "");
  sanitized = sanitized.replace(STRIP_SELF_CLOSING_RE, "");

  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(EVENT_HANDLERS_RE, "");

  // Remove javascript:/data:/vbscript: URLs from href/action
  sanitized = sanitized.replace(DANGEROUS_URLS_RE, "");

  // Remove javascript:/vbscript: URLs from src (allow https: and data: for images)
  sanitized = sanitized.replace(DANGEROUS_SRC_RE, "");

  // Remove dangerous style expressions
  sanitized = sanitized.replace(DANGEROUS_STYLES_RE, "");

  return sanitized;
}
