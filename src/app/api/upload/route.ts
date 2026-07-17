import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Generate a clean safe filename prefixing with timestamp to avoid name collisions
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    // Upload to Vercel Blob using the environment token
    const blob = await put(safeName, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: unknown) {
    console.error("Vercel Blob upload failed:", error);
    return NextResponse.json(
      { message: (error as any).message || "Failed to upload file to Vercel Blob" },
      { status: 500 }
    );
  }
}
