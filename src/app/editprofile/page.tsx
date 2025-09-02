'use client';

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState("Free Plan");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  const router = useRouter();

  // Load user info
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || "");
          setPlan(data.plan || "Free Plan");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Update fullName in Firestore & auth profile
      await updateDoc(doc(db, "users", user.uid), { fullName });
      await updateProfile(user, { displayName: fullName });

      // Update password if provided
      if (newPassword) {
        if (!currentPassword) {
          alert("Enter current password to change password.");
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        alert("Password updated successfully!");
      }

      alert("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update profile");
    }
  };

  // Cancel subscription
  const handleCancelPlan = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    setCancelLoading(true);
    try {
      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), { plan: "Free Plan" });
      setPlan("Free Plan");

      // Send cancellation email
      await fetch("/api/cancel-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          plan: "Free Plan",
          method: "Subscription Cancellation",
        }),
      });

      alert("Your subscription has been cancelled. You are now on the Free Plan.");
    } catch (err: any) {
      console.error("Cancel plan error:", err);
      alert("Failed to cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <p className="text-center py-20">Loading...</p>;

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Edit Profile</h1>

        <form
          onSubmit={handleUpdateProfile}
          className="bg-white p-6 rounded-xl shadow-md text-left space-y-4 border border-gray-200"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Current Plan */}
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm font-medium text-gray-800">Current Plan</p>
            <p className="text-lg font-semibold text-pink-600">{plan}</p>
            {plan !== "Free Plan" && (
              <button
                type="button"
                onClick={handleCancelPlan}
                disabled={cancelLoading}
                className="mt-3 w-full py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelLoading ? "Cancelling..." : "Cancel Subscription"}
              </button>
            )}
          </div>

          {/* Current Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-800 mb-1">Current Password</label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
              placeholder="********"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-800 mb-1">New Password</label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
              placeholder="********"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md font-semibold bg-pink-600 text-white hover:bg-pink-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </section>
  );
}
