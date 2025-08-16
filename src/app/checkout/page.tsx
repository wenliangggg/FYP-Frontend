"use client"; // ✅ make the whole page client-side

export const dynamic = "force-dynamic"; // disables static prerendering
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return <CheckoutClient />;
}
