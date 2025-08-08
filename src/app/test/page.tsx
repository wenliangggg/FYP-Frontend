"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCredential.user);
      alert("Login successful!");
    } catch (error: any) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Login</h1>
        <p className="text-gray-700 mb-6">Welcome back! Log in to continue exploring.</p>
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md border space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-400"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-400"
              placeholder="********"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-pink-600 text-white w-full py-2 rounded-md hover:bg-pink-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </section>
  );
}
