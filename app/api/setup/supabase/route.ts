import { NextResponse } from "next/server";
import { isValidHttpUrl } from "@/lib/setup-status";

export const runtime = "nodejs";

type CheckResult = {
  ok: boolean;
  message: string;
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isValidHttpUrl(supabaseUrl) || !serviceRoleKey) {
    return NextResponse.json({
      ready: false,
      projects: { ok: false, message: "Supabase URL or service role key is missing." },
      downloads: { ok: false, message: "Supabase URL or service role key is missing." },
      bucket: { ok: false, message: "Supabase URL or service role key is missing." }
    });
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`
  };

  const [projects, downloads, bucket] = await Promise.all([
    checkUrl(`${supabaseUrl}/rest/v1/projects?select=id&limit=1`, headers, "projects table"),
    checkUrl(`${supabaseUrl}/rest/v1/download_history?select=id&limit=1`, headers, "download_history table"),
    checkUrl(`${supabaseUrl}/storage/v1/bucket/paper-sources`, headers, "paper-sources bucket")
  ]);

  return NextResponse.json({
    ready: projects.ok && downloads.ok && bucket.ok,
    projects,
    downloads,
    bucket
  });
}

async function checkUrl(url: string, headers: Record<string, string>, label: string): Promise<CheckResult> {
  try {
    const response = await fetch(url, { headers, cache: "no-store" });
    if (response.ok) {
      return { ok: true, message: `${label} found.` };
    }

    const body = await response.text();
    return { ok: false, message: body || `${label} check failed with HTTP ${response.status}.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : `${label} check failed.` };
  }
}
