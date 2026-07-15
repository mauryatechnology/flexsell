import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import HsnRecord from "@/models/HsnRecord";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const updatedRecord = await HsnRecord.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return NextResponse.json({ message: "HSN record not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update HSN record" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const deletedRecord = await HsnRecord.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return NextResponse.json({ message: "HSN record not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "HSN record deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete HSN record" }, { status: 500 });
  }
}
