/**
 * Structured JSON logger for production observability.
 * Works with Vercel's built-in log drain and any JSON-based log aggregator.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };

  switch (level) {
    case "error":
      console.error(JSON.stringify(entry));
      break;
    case "warn":
      console.warn(JSON.stringify(entry));
      break;
    default:
      console.log(JSON.stringify(entry));
  }
}

export const log = {
  info: (message: string, data?: Record<string, unknown>) => emit("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) => emit("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) => emit("error", message, data),

  /** Log an API request with timing */
  request(method: string, path: string, status: number, durationMs: number, extra?: Record<string, unknown>) {
    emit("info", `${method} ${path} ${status} ${durationMs}ms`, {
      method,
      path,
      status,
      durationMs,
      ...extra,
    });
  },
};
