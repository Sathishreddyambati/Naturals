import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, setSessionCookie, CUSTOMER_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const [customer] = await db.select().from(customers).where(eq(customers.email, email));
  if (!customer) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const valid = await verifyPassword(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  await setSessionCookie(CUSTOMER_COOKIE, {
    sub: String(customer.id),
    role: "customer",
    email: customer.email,
    name: customer.name,
  });
  return NextResponse.json({ id: customer.id, name: customer.name, email: customer.email });
}
