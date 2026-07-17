import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { generateNextId } from "@/lib/idGenerator";
import { requireAuth } from "@/lib/authGuard";
import { productSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const skip = (pageNum - 1) * limitNum;

      const [products, total] = await Promise.all([
        Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Product.countDocuments({})
      ]);

      return NextResponse.json({
        products,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    }

    // Retrieve products sorted by newest first
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error: unknown) {
    return NextResponse.json({ message: (error as any).message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth("admin");
    if (auth.error) return auth.error;

    await dbConnect();
    const body = await request.json();
    
    const validatedData = productSchema.parse(body);

    // Generate a product ID if not provided
    if (!validatedData._id) {
      validatedData._id = await generateNextId("product");
    }
    
    const newProduct = await Product.create(validatedData);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ message: (error as any).message || "Failed to create product" }, { status: 500 });
  }
}
