'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams?.get("plan") ?? "Unknown Plan";
  const [selectedMethod, setSelectedMethod] = useState<string>("Credit/Debit Card"); // default
  const [processing, setProcessing] = useState(false);

  // Credit card details
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const isCardValid = () => {
    return (
      cardName.trim() !== "" &&
      cardNumber.trim().length >= 12 &&
      expiry.trim() !== "" &&
      cvv.trim().length >= 3
    );
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method first.");
      return;
    }

    if (selectedMethod === "Credit/Debit Card" && !isCardValid()) {
      alert("Please fill in all required card details correctly.");
      return;
    }

    setProcessing(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to complete the payment.");
        setProcessing(false);
        return;
      }

      // Update Firestore user document with chosen plan
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        plan: plan,
        paymentMethod: selectedMethod,
        updatedAt: new Date(),
      });

      alert(`Payment for ${plan} via ${selectedMethod} successful! 🎉`);
      router.push("/");
    } catch (error) {
      console.error("Payment sync error:", error);
      alert("Something went wrong while processing payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="bg-white py-20 px-6 text-gray-500">
      <div className="max-w-5xl mx-auto rounded-2xl shadow-lg border border-gray-200 flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-1/3 bg-gray-50 border-r p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-6">Payment Options</h2>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedMethod("Credit/Debit Card")}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                  selectedMethod === "Credit/Debit Card"
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                💳 Credit / Debit Card
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMethod("PayNow QR Code")}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                  selectedMethod === "PayNow QR Code"
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                📷 PayNow QR Code
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8 text-center">
          <h1 className="text-2xl font-bold text-pink-600 mb-6">
            Checkout – {plan}
          </h1>

          {selectedMethod === "Credit/Debit Card" && (
            <div className="space-y-4 text-left">
              <label className="block">
                <span className="text-gray-700">Cardholder Name</span>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                  required
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Card Number</span>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                  required
                />
              </label>
              <div className="flex gap-4">
                <label className="block w-1/2">
                  <span className="text-gray-700">Expiry Date</span>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    required
                  />
                </label>
                <label className="block w-1/2">
                  <span className="text-gray-700">CVV</span>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    required
                  />
                </label>
              </div>
            </div>
          )}

          {selectedMethod === "PayNow QR Code" && (
            <div className="flex flex-col items-center">
              <p className="text-gray-700 mb-4">Scan this QR Code to pay:</p>
              <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-gray-100">
                {/* Replace with real QR Code image */}
                <img
                  src="/paynow-qr.png"
                  alt="PayNow QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <div className="mt-8">
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className={`px-6 py-3 rounded-lg font-bold shadow-lg ${
                processing
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {processing ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
