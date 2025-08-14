'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmailVerified(currentUser.emailVerified);
      } else {
        setUser(null);
        setEmailVerified(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-pink-500">KidFlix</div>
      <div className="space-x-6 flex items-center">
        <Link href="/" className="text-gray-700 hover:text-pink-500">Home</Link>
        <Link href="/about" className="text-gray-700 hover:text-pink-500">About</Link>
        <Link href="/contact" className="text-gray-700 hover:text-pink-500">Contact</Link>

        {user && emailVerified && (
          <Link href="/review" className="text-gray-700 hover:text-pink-500">Reviews</Link>
        )}

        {!user ? (
          <>
            <Link href="/login" className="text-gray-700 hover:text-pink-500">Login</Link>
            <Link href="/register" className="text-gray-700 hover:text-pink-500">Register</Link>
          </>
        ) : (
          <>
            {emailVerified ? (
              <>
                <span className="text-gray-600 text-sm">Hi, {user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="text-red-500 text-sm">
                Please verify your email.
              </span>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
