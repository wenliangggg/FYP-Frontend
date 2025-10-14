"use client";

import { useEffect, useState } from "react";
import { getAuth, applyActionCode, checkActionCode } from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const oobCode = searchParams!.get("oobCode");


    if (!oobCode) {
      setError("Invalid verification link.");
      setMessage("");
      return;
    }

    checkActionCode(auth, oobCode)
      .then(() => applyActionCode(auth, oobCode))
      .then(() => {
        setMessage("Your email has been successfully verified!");
        setTimeout(() => router.push("/login"), 3000);
      })
      .catch(() => {
        setError("Failed to verify email. The link may be expired or invalid.");
        setMessage("");
      });
  }, [searchParams, router]);

  return (
    <section className="bg-white py-20 px-6 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-pink-50 rounded-xl shadow-md border border-pink-200">
        <h1 className="text-3xl font-bold text-pink-600 mb-4">Email Verification</h1>
        {message && <p className="text-gray-700">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </section>
  );
}
