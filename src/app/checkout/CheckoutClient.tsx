'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams?.get("plan") ?? "Unknown Plan";
  const [processing, setProcessing] = useState(false);

  const handlePaymentRedirect = () => {
    setProcessing(true);
    setTimeout(() => {
      router.push(`/payment?plan=${encodeURIComponent(plan)}`);
    }, 1000);
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">Checkout</h1>
        <p className="text-lg text-gray-700 mb-4">
          You selected: <span className="font-semibold text-pink-600">{plan}</span>
        </p>
        <p className="text-gray-600 mb-8">Confirm your subscription to continue.</p>

        <button
          onClick={handlePaymentRedirect}
          disabled={processing}
          className={`px-6 py-3 rounded-lg font-bold shadow-lg ${
            processing
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {processing ? "Redirecting..." : `Proceed to Payment`}
        </button>
      </div>
    </section>
  );
}
