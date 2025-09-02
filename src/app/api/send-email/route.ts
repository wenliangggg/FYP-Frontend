import { NextResponse } from "next/server";
import { Resend } from "resend";

// Reads from .env.local
//const resend = new Resend(process.env.RESEND_API_KEY);

const resend = new Resend('re_LAc2SdxK_FghA1hDYzWwGx7kSjNEWyXbL');

export async function POST(req: Request) {
  try {
    const { email, plan, method } = await req.json();

    await resend.emails.send({
      from: "Pay@resend.dev", // must be verified in Resend
      to: email,
      subject: `Payment Confirmation – ${plan}`,
      html: `
        <h2>Thank you for your payment!</h2>
        <p><strong>Plan:</strong> ${plan}</p>
        <p><strong>Payment Method:</strong> ${method}</p>
        <p>Your subscription has been updated successfully.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
