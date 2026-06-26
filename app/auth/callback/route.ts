import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorParams = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (errorParams) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(errorDescription || errorParams)}`, request.url));
  }

  if (code) {
    try {
      const supabase = await createServerSupabase();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url));
      }
    } catch (e: any) {
      console.error("Auth callback exception:", e);
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(e.message)}`, request.url));
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
