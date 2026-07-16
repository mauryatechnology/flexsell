import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";
const TOKEN_EXPIRY = "7d"; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}

export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export async function getActiveCustomerServer() {
  try {
    const token = await getTokenFromCookie();
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const dbConnect = (await import("@/lib/dbConnect")).default;
    await dbConnect();
    const CustomerModel = (await import("@/models/Customer")).default;
    const customer = await CustomerModel.findById(payload.userId).select("-password").lean();
    if (!customer) return null;
    return JSON.parse(JSON.stringify(customer));
  } catch (error) {
    console.error("Error in getActiveCustomerServer:", error);
    return null;
  }
}
