'use client';

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  fullName: string;
  email: string;
  role?: string;
}

interface ReviewData {
  uid: string;
  userName: string;
  message: string;
  showOnHome?: boolean; // new field for homepage display toggle
}

interface ContactData {
  uid: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}


export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "reviews" | "contacts">("users");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const usersList: UserData[] = snapshot.docs.map((doc) => ({
      ...(doc.data() as UserData),
      uid: doc.id,
    }));
    setUsers(usersList);
  };

  const fetchReviews = async () => {
    const reviewsRef = collection(db, "reviews");
    const snapshot = await getDocs(reviewsRef);
    const reviewsList: ReviewData[] = snapshot.docs.map((doc) => ({
      ...(doc.data() as ReviewData),
      uid: doc.id,
    }));
    setReviews(reviewsList);
  };

  const fetchContacts = async () => {
    const contactsRef = collection(db, "contacts");
    const snapshot = await getDocs(contactsRef);
    const contactsList: ContactData[] = snapshot.docs.map((doc) => ({
      ...(doc.data() as ContactData),
      uid: doc.id,
    }));
    setContacts(contactsList);
  };

  const handleToggleShowOnHome = async (id: string, current: boolean) => {
    const reviewRef = doc(db, "reviews", id);
    await updateDoc(reviewRef, { showOnHome: !current });
    fetchReviews();
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          await fetchUsers();
          await fetchReviews();
          await fetchContacts();
        } else {
          setError("You do not have permission to view this page.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to check user role.");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [currentUser]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <main className="bg-white min-h-screen p-6 flex">
      {/* Sidebar Tabs */}
      <aside className="w-64 mr-8 border-r border-gray-200 text-gray-800">
        <ul className="space-y-2">
          <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === "users" ? "bg-pink-100 font-semibold" : "hover:bg-gray-100"}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </li>
          <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === "reviews" ? "bg-pink-100 font-semibold" : "hover:bg-gray-100"}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </li>
          <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === "contacts" ? "bg-pink-100 font-semibold" : "hover:bg-gray-100"}`}
            onClick={() => setActiveTab("contacts")}
          >
            Comments
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <section className="flex-1">
        {activeTab === "users" && (
          <section>
            <h1 className="text-3xl font-bold text-pink-600 mb-6">Admin Dashboard - Users</h1>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-gray-600">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="border px-4 py-2 text-left text-gray-800">#</th>
                    <th className="border px-4 py-2 text-left text-gray-800">Full Name</th>
                    <th className="border px-4 py-2 text-left text-gray-800">Email</th>
                    <th className="border px-4 py-2 text-left text-gray-800">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">{user.fullName}</td>
                      <td className="border px-4 py-2">{user.email}</td>
                      <td className="border px-4 py-2">{user.role || "user"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "reviews" && (
          <section>
            <h2 className="text-3xl font-bold text-pink-600 mb-6">Manage Reviews</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-gray-600">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Message</th>
                    <th className="border px-4 py-2">Show on Home</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.uid} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{r.userName}</td>
                      <td className="border px-4 py-2">{r.message}</td>
                      <td className="border px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!r.showOnHome}
                          onChange={() => handleToggleShowOnHome(r.uid, !!r.showOnHome)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <section>
            <h2 className="text-3xl font-bold text-pink-600 mb-6">Contact Comments</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-gray-600">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Email</th>
                    <th className="border px-4 py-2">Message</th>
                    <th className="border px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.uid} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{c.name}</td>
                      <td className="border px-4 py-2">{c.email}</td>
                      <td className="border px-4 py-2">{c.message}</td>
                      <td className="border px-4 py-2">
                        {c.createdAt?.toDate?.() ? c.createdAt.toDate().toLocaleString() : c.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </section>
    </main>
  );
}
