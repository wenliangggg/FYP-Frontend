'use client';

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  fullName: string;
  email: string;
  role?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const usersList: UserData[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as UserData),
      }));
      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          fetchUsers();
        } else {
          setError("You do not have permission to view this page.");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to check user role.");
        setLoading(false);
      }
    };

    checkAdmin();
  }, [currentUser]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <main className="bg-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-pink-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">#</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Full Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.uid} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-gray-800">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">{user.fullName}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">{user.role || "user"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
