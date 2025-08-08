'use client';

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // npm install lucide-react

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // redirect after login
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Login</h1>
        <p className="text-gray-700 mb-6">
          Welcome back! Log in to continue exploring.
        </p>

        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-xl shadow-md text-left space-y-4 border border-gray-200"
        >
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

          <div className="relative">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
              placeholder="********"
              required
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <button
            type="submit"
            className="bg-pink-600 text-white font-semibold w-full py-2 rounded-md hover:bg-pink-700 transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-pink-600 font-semibold hover:underline"
          >
            Register here
          </a>
          .
        </p>
      </div>
    </section>
  );
}
