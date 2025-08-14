"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Ensure db is exported in firebase config
import { doc, setDoc } from "firebase/firestore";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      // 1️⃣ Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2️⃣ Update profile with full name
      await updateProfile(user, { displayName: fullName });

      // 3️⃣ Send email verification
      await sendEmailVerification(user);

      // 4️⃣ Save user to Firestore with role
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: user.email,
        role: "user", // ✅ default role
        createdAt: new Date(),
        emailVerified: user.emailVerified,
      });

      alert(
        "Registration successful! Please check your email to verify your account."
      );

      // 5️⃣ Sign out so they must verify before login
      await auth.signOut();

      // 6️⃣ Redirect to login
      router.push("/login");
    } catch (error: any) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value !== password) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Register</h1>
        <p className="text-gray-700 mb-6">
          Create a free KidFlix account to get personalized content for your
          kids.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md text-left space-y-4 border border-gray-200"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 ${
                passwordError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="********"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon size={20} />
              ) : (
                <EyeIcon size={20} />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 ${
                passwordError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="********"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? (
                <EyeOffIcon size={20} />
              ) : (
                <EyeIcon size={20} />
              )}
            </button>
          </div>

          {/* Error Message */}
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}

          <button
            type="submit"
            disabled={!!passwordError}
            className={`w-full py-2 rounded-md font-semibold transition ${
              passwordError
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-pink-600 text-white hover:bg-pink-700"
            }`}
          >
            Create Account
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-pink-600 font-semibold hover:underline"
          >
            Log in
          </a>
          .
        </p>
      </div>
    </section>
  );
}
