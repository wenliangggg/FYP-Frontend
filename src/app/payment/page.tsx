"use client";
export const dynamic = "force-dynamic"; // disables static pre-rendering

import PaymentClient from "./PaymentClient";

export default function PaymentPage() {
  return <PaymentClient />;
}
