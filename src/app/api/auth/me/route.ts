import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ customer: null });
  return NextResponse.json({ customer: { id: session.sub, name: session.name, email: session.email } });
}
