import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
  const sql = await readFile(schemaPath, "utf8");
  return new NextResponse(sql, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
