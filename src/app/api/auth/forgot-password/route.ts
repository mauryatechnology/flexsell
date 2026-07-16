import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });

    // Success response for security (prevents user enumeration)
    const successResponse = {
      message: "If that email is registered, we have sent a password reset link."
    };

    if (!customer) {
      return NextResponse.json(successResponse);
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    customer.resetPasswordToken = token;
    customer.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await customer.save();

    // Clean password/credentials of any surrounding quotes from env
    const smtpPass = process.env.SMTP_PASS?.replace(/"/g, "");

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: smtpPass,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"FlexSell Wholesale Support" <${process.env.SMTP_USER}>`,
      to: customer.email,
      subject: "Reset your FlexSell Wholesale Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">FlexSell Wholesale B2B</h2>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p>Hello ${customer.name},</p>
          <p>We received a request to reset your password for your FlexSell Wholesale customer account (ID: <strong>${customer._id}</strong>).</p>
          <p>Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
          <p style="word-break: break-all; color: #555555; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 13px;">${resetUrl}</p>
          <p style="margin-top: 30px;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            FlexSell Wholesale © 2026. All rights reserved.
          </p>
        </div>
      `,
    };

    // Always log the reset link in development mode for easy testing
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      console.log("\n=======================================================");
      console.log("DEVELOPMENT RESET LINK FOR EMAIL:", customer.email);
      console.log(resetUrl);
      console.log("=======================================================\n");
    }

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError: any) {
      console.error("Nodemailer failed to send email:", mailError.message);
      // In development mode, allow a success response so testing continues using the console log
      if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
        return NextResponse.json({
          message: "A password reset link was generated. Email failed to send, but the link has been logged to your terminal console for testing."
        });
      }
      throw mailError; // Rethrow to catch block for production 500 error
    }

    return NextResponse.json(successResponse);
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: error.message || "Failed to process forgot password" }, { status: 500 });
  }
}
