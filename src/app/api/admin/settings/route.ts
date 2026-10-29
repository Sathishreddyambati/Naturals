import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getHomepageSettings, setHomepageSettings } from "@/lib/data/settings";
import { z } from "zod";

const schema = z.object({
  heroHeadline: z.string().min(3).max(200),
  heroSubheadline: z.string().min(3).max(400),
  heroBadge: z.string().min(2).max(120),
  announcementBar: z.string().min(2).max(200),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const settings = await getHomepageSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  await setHomepageSettings(parsed.data);
  return NextResponse.json({ ok: true });
}
