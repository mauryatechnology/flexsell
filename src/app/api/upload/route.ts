import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
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
  } catch (error: any) {
    console.error("Vercel Blob upload failed:", error);
    return NextResponse.json(
      { message: error.message || "Failed to upload file to Vercel Blob" },
      { status: 500 }
    );
  }
}
