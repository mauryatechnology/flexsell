import { NextResponse } from "next/server";
import { removeTokenCookie } from "@/lib/auth";

export async function POST() {
  try {
    await removeTokenCookie();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Logout failed" }, { status: 500 });
  }
}
