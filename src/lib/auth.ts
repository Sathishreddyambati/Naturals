import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const encoder = new TextEncoder();

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }
  return encoder.encode(secret);
}

export type SessionPayload = {
  sub: string;
  role: "admin" | "customer";
  email: string;
  name: string;
};

export async function signSession(payload: SessionPayload, expiresIn = "7d") {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub === "string" &&
      (payload.role === "admin" || payload.role === "customer") &&
      typeof payload.email === "string"
    ) {
      return {
        sub: payload.sub,
        role: payload.role,
        email: payload.email,
        name: typeof payload.name === "string" ? payload.name : "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE = "indira_admin_session";
export const CUSTOMER_COOKIE = "indira_customer_session";

export async function setSessionCookie(
  cookieName: string,
  payload: SessionPayload,
) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(cookieName: string) {
  const store = await cookies();
  store.delete(cookieName);
}

export async function getSession(cookieName: string): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getAdminSession() {
  const session = await getSession(ADMIN_COOKIE);
  if (session?.role !== "admin") return null;
  return session;
}

export async function getCustomerSession() {
  const session = await getSession(CUSTOMER_COOKIE);
  if (session?.role !== "customer") return null;
  return session;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
