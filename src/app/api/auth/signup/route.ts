import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signupSchema } from "@/lib/validation";
import { hashPassword, setSessionCookie, CUSTOMER_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, email, phone, password } = parsed.data;

  const [existing] = await db.select().from(customers).where(eq(customers.email, email));
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(customers)
    .values({ name, email, phone, passwordHash })
    .returning();

  await setSessionCookie(CUSTOMER_COOKIE, {
    sub: String(created.id),
    role: "customer",
    email: created.email,
    name: created.name,
  });

  return NextResponse.json({ id: created.id, name: created.name, email: created.email });
}
