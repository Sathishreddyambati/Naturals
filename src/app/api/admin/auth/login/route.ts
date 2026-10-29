import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, setSessionCookie, ADMIN_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const [admin] = await db.select().from(admins).where(eq(admins.email, email));
  if (!admin) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  await setSessionCookie(ADMIN_COOKIE, {
    sub: String(admin.id),
    role: "admin",
    email: admin.email,
    name: admin.name,
  });
  return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email });
}
