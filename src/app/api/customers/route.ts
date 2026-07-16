import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET: Fetch all customers (restricted to admins)
export async function GET() {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Filter out admin accounts
    const customers = await Customer.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch customers" }, { status: 500 });
  }
}

// POST: Admin creates a new B2B customer account
export async function POST(request: Request) {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, company, address, city, state, pinCode, phone, gstin } = body;

    if (!name || !email || !password || !address || !city || !state || !pinCode || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 400 });
    }

    // Determine sequential customer ID
    const customersList = await Customer.find({}, { _id: 1 });
    let maxNum = 0;
    for (const c of customersList) {
      const match = c._id.match(/^FSW-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const customerId = `FSW-${String(maxNum + 1).padStart(4, "0")}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "C";

    const newCustomer = await Customer.create({
      _id: customerId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "customer",
      company: company || "",
      address,
      city,
      state,
      pinCode,
      phone,
      initials,
      gstin: gstin || ""
    });

    const customerObj = newCustomer.toObject();
    delete customerObj.password;

    return NextResponse.json(customerObj, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create customer" }, { status: 500 });
  }
}

// PUT: Admin updates customer details
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { _id, name, email, password, company, address, city, state, pinCode, phone, gstin } = body;

    if (!_id) {
      return NextResponse.json({ message: "Customer ID is required" }, { status: 400 });
    }

    const customer = await Customer.findById(_id);
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    if (email && email.toLowerCase() !== customer.email) {
      const existing = await Customer.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ message: "Email is already in use" }, { status: 400 });
      }
      customer.email = email.toLowerCase();
    }

    if (name !== undefined) {
      customer.name = name;
      customer.initials = name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "C";
    }

    if (password) {
      customer.password = await bcrypt.hash(password, 10);
    }

    if (company !== undefined) customer.company = company;
    if (address !== undefined) customer.address = address;
    if (city !== undefined) customer.city = city;
    if (state !== undefined) customer.state = state;
    if (pinCode !== undefined) customer.pinCode = pinCode;
    if (phone !== undefined) customer.phone = phone;
    if (gstin !== undefined) customer.gstin = gstin;

    await customer.save();

    const customerObj = customer.toObject();
    delete customerObj.password;

    return NextResponse.json(customerObj);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update customer" }, { status: 500 });
  }
}

// DELETE: Admin deletes a customer permanently
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Customer ID is required" }, { status: 400 });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    await Customer.findByIdAndDelete(id);

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete customer" }, { status: 500 });
  }
}
