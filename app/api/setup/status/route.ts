import { NextResponse } from "next/server";
import { getSetupStatus } from "@/lib/setup-status";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getSetupStatus());
}
