'use client'; // Required if you're using `usePathname()` or interactivity

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between">
      <div className="text-xl font-bold text-pink-500">KidFlix</div>
      <div className="space-x-6">
        <Link href="/" className="text-gray-700 hover:text-pink-500">Home</Link>
        <Link href="/about" className="text-gray-700 hover:text-pink-500">About</Link>
        <Link href="/contact" className="text-gray-700 hover:text-pink-500">Contact</Link>
        <Link href="/login" className="text-gray-700 hover:text-pink-500">Login</Link>
        <Link href="/register" className="text-gray-700 hover:text-pink-500">Register</Link>
      </div>
    </nav>
  );
}
