import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidHttpUrl } from "@/lib/setup-status";
import { createServerSupabase, createServiceSupabase, getEffectiveUser, mockDb } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, errorResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  pages: z.array(z.unknown()).optional(),
  status: z.enum(["draft", "processing", "ready", "failed"]).optional()
});

async function getUser() {
  if (!isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  return getEffectiveUser();
}

function validateId(id: string): boolean {
  return UUID_RE.test(id);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`project-get:${ip}`, 30, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!validateId(id)) {
      return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
    }

    const supabase = createServiceSupabase();
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).eq("user_id", user.id).single();
      if (error) throw error;
      return NextResponse.json({ project: data });
    } catch (err) {
      console.warn("Supabase GET project failed, falling back to mockDb:", err);
      const project = mockDb.mockProjects[id];
      if (!project || project.user_id !== user.id) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ project });
    }
  } catch (error) {
    return errorResponse(error, "project-get");
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`project-patch:${ip}`, 30, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!validateId(id)) {
      return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
    }

    const body = updateSchema.parse(await request.json());
    const supabase = createServiceSupabase();

    let updatedData: any = null;
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      updatedData = data;
    } catch (err) {
      console.warn("Supabase PATCH project failed, updating in mockDb:", err);
      const existing = mockDb.mockProjects[id];
      if (!existing || existing.user_id !== user.id) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      updatedData = {
        ...existing,
        ...body,
        updated_at: new Date().toISOString()
      };
    }

    // Sync to mockDb
    mockDb.mockProjects[id] = updatedData;
    return NextResponse.json({ project: updatedData });
  } catch (error) {
    return errorResponse(error, "project-patch");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`project-delete:${ip}`, 30, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!validateId(id)) {
      return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
    }

    const supabase = createServiceSupabase();
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase DELETE project failed, deleting from mockDb:", err);
    }

    delete mockDb.mockProjects[id];
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "project-delete");
  }
}
