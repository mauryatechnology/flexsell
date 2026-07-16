import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";
import bcrypt from "bcryptjs";
import { signToken, setTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ message: "Identifier and password are required" }, { status: 400 });
    }

    const trimmedIdentifier = identifier.trim();

    // Query by email OR _id (e.g. FSW-0001)
    const customer = await Customer.findOne({
      $or: [
        { email: trimmedIdentifier.toLowerCase() },
        { _id: trimmedIdentifier.toUpperCase() }
      ]
    });

    if (!customer) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Google-only users might not have a password set
    if (!customer.password) {
      return NextResponse.json({ message: "This account logs in via Google. Please use Google Sign-In." }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Sign token
    const token = signToken({
      userId: customer._id,
      email: customer.email,
      role: customer.role || "customer",
    });

    await setTokenCookie(token);

    const customerObj = customer.toObject();
    delete customerObj.password;

    return NextResponse.json({
      message: "Logged in successfully",
      customer: customerObj,
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ message: error.message || "Login failed" }, { status: 500 });
  }
}
