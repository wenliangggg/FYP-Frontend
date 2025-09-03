import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend('re_BvJ1BHo9_Ny5kpnYAFbsHfUwCdYbze9ro');

export async function POST(req: Request) {
  try {
    const { email, oldPlan } = await req.json();

    await resend.emails.send({
      from: "Cancel_Plan@resend.dev", // must match a verified domain in Resend
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
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel email error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
