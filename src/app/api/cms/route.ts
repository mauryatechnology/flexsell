import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CmsContent from "@/models/CmsContent";

export async function GET() {
  try {
    await dbConnect();
    const contents = await CmsContent.find();
    
    // Map list of CMS documents into a key-value structure
    const config: Record<string, any> = {};
    contents.forEach(item => {
      config[item.key] = item.value;
    });

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch CMS content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ message: "CMS key is required" }, { status: 400 });
    }

    const updated = await CmsContent.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update CMS content" }, { status: 500 });
  }
}
