import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isValidHttpUrl } from "@/lib/setup-status";

/**
 * Next.js middleware — handles security headers, CSRF, and Supabase session refresh.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ── Security Headers ──
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");

  // ── CSRF Protection for mutating API routes ──
  if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // Allow requests without origin (e.g., server-to-server, curl in dev)
    // In production, require origin to match host
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "CSRF validation failed." },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid origin header." },
          { status: 403 }
        );
      }
    }
  }

  // ── CORS for API routes ──
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const allowedOrigin = appUrl || request.headers.get("origin") || "*";

    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  // ── Supabase Session Refresh ──
  if (
    isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );
      await supabase.auth.getSession();
    } catch {
      // Silently continue if Supabase session refresh fails
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/api/:path*",
    "/privacy",
    "/terms",
    "/contact",
    "/about",
    "/",
  ],
};
