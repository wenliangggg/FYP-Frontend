// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, plan, method } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
    }

    // Gmail SMTP configuration (App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,          // your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD,  // your 16-digit App Password
      },
    });

    // Send mail
    await transporter.sendMail({
      from: `"Your App" <${process.env.GMAIL_USER}>`, // must match your Gmail user
      to: email,
      subject: "Payment Confirmation",
      text: `Your payment for ${plan} via ${method} was successful.`,
      html: `
        <h2>✅ Payment Successful</h2>
        <p><strong>Plan:</strong> ${plan}</p>
        <p><strong>Method:</strong> ${method}</p>
        <p>Thanks for subscribing 🚀</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mail send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
