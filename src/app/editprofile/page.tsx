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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">("profile");

  // Profile
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState("Free Plans");
  const [avatar, setAvatar] = useState<string>("");

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Preferences
  const [ageRange, setAgeRange] = useState("");
  const [interests, setInterests] = useState("");
  const [readingLevel, setReadingLevel] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();
  const storage = getStorage();

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
          setPlan(data.plan || "Free Plans");
          setAvatar(data.avatar || "");
          setAgeRange(data.ageRange || "");
          setInterests(data.interests || "");
          setReadingLevel(data.readingLevel || "");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", user.uid), { avatar: downloadURL });
      await updateProfile(user, { photoURL: downloadURL });
      setAvatar(downloadURL);

      alert("Avatar updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  };

  // Update profile info
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), { fullName });
      await updateProfile(user, { displayName: fullName });
      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update profile");
    }
  };

  // Change password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (!currentPassword || !newPassword) {
        alert("Please fill in both fields.");
        return;
      }
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      alert("Password updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update password");
    }
  };

  // Save Preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        ageRange,
        interests,
        readingLevel,
      });
      alert("Preferences updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to save preferences");
    }
  };

// Cancel plan
const handleCancelPlan = async () => {
  if (!user) return;
  if (!confirm("Are you sure you want to cancel your subscription?")) return;

  setCancelLoading(true);
  try {
    const oldPlan = plan; // keep the current plan before changing it

    await updateDoc(doc(db, "users", user.uid), { plan: "Free Plans" });
    setPlan("Free Plans");

    await fetch("/api/cancel-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        oldPlan, // send the previous plan
        plan: "Free Plans",
        method: "Subscription Cancellation",
      }),
    });

    alert("Your subscription has been cancelled.");
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
      <div className="max-w-4xl mx-auto flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-48 border-r pr-4">
          <button
            className={`block w-full text-left py-2 px-3 rounded-md mb-2 font-semibold ${
              activeTab === "profile" ? "bg-pink-100 text-pink-600" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`block w-full text-left py-2 px-3 rounded-md mb-2 font-semibold ${
              activeTab === "security" ? "bg-pink-100 text-pink-600" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
          <button
            className={`block w-full text-left py-2 px-3 rounded-md font-semibold ${
              activeTab === "preferences" ? "bg-pink-100 text-pink-600" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-pink-600 mb-6">Edit Profile</h1>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form
              onSubmit={handleUpdateProfile}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <img
                  src={avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover border mb-3"
                />
                <label className="cursor-pointer text-pink-600 hover:underline">
                  {uploading ? "Uploading..." : "Change Avatar"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 mb-6 rounded-md"
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
                  value={user?.email || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 mb-6 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Plan */}
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm font-medium text-gray-800">Current Plan</p>
                <p className="text-lg font-semibold text-pink-600">{plan}</p>
                {plan !== "Free Plans" && (
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

              <button
                type="submit"
                className="w-full py-2 rounded-md font-semibold bg-pink-600 text-white hover:bg-pink-700 transition"
              >
                Save Changes
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form
              onSubmit={handleUpdatePassword}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4"
            >
              {/* Current Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Current Password
                </label>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border text-gray-700 mb-6 border-gray-300 rounded-md"
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
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 mb-6 rounded-md"
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
                Change Password
              </button>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <form
              onSubmit={handleSavePreferences}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4"
            >
              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Age Range
                </label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 mb-6"
                >
                  <option value="">Select Age Range</option>
                  <option value="1-3">1–3</option>
                  <option value="4-6">4–6</option>
                  <option value="7-10">7–10</option>
                  <option value="11-12">11-12</option>
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Interests
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 mb-6"
                  placeholder="e.g. Fantasy, Science, History"
                />
              </div>

              {/* Reading Level */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Reading Level
                </label>
                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 mb-6"
                >
                  <option value="">Select Reading Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-md font-semibold bg-pink-600 text-white hover:bg-pink-700 transition"
              >
                Save Preferences
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
