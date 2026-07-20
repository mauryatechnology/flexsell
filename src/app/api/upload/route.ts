import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Rate limit uploads to prevent storage quota exhaustion
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
      await rateLimit(ip);
    } catch {
      return NextResponse.json({ message: "Too many upload requests. Please try again later." }, { status: 429 });
    }

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

    // Validate file type — only allow image formats
    const ALLOWED_TYPES = [
      "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
      "image/jpg", "image/avif"
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "File type not allowed. Only images (JPEG, PNG, WebP, GIF, SVG, AVIF) are accepted." },
        { status: 400 }
      );
    }

    // Validate file size — max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "File too large. Maximum allowed size is 5MB." },
        { status: 400 }
      );
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
