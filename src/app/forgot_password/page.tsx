'use client';

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send reset email. Please check your email address.");
    }
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Forgot Password</h1>
        <p className="text-gray-700 mb-6">
          Enter your email to reset your password.
        </p>

        <form
          onSubmit={handlePasswordReset}
          className="bg-white p-6 rounded-xl shadow-md text-left space-y-4 border border-gray-200"
        >
          {message && (
            <div className="bg-green-100 text-green-700 p-2 rounded text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-pink-600 text-white font-semibold w-full py-2 rounded-md hover:bg-pink-700 transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Remembered your password?{" "}
          <a
            href="/login"
            className="text-pink-600 font-semibold hover:underline"
          >
            Back to Login
          </a>
          .
        </p>
      </div>
    </section>
  );
}
