import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, oldPlan } = await req.json();

    // Gmail transporter with App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,           // your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD,   // your 16-char App Password
      },
    });

    // Define email options
    const mailOptions = {
      from: `"My App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Subscription Canceled",
      html: `
        <h2>Your subscription has been canceled.</h2>
        <p>You were previously on: <strong>${oldPlan}</strong></p>
        <p>You are now on: <strong>Free Plan</strong></p>
        <hr />
        <p style="font-size:12px; color:gray;">
          If this was a mistake, you can resubscribe anytime at 
          <a href="http://localhost:3000/plans">Manage Plans</a>.
        </p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel email error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
