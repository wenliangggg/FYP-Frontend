'use client';

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, } from "recharts";
import { MdSubscriptions } from "react-icons/md";

interface UserData {
  uid: string;
  fullName: string;
  email: string;
  role?: string;
  plan?: string;
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

interface PlanData {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface PlanSummary {
  plan: string;
  count: number;
}

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "reviews" | "contacts" | "plans" | "subscriptions">("users");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanData, setEditingPlanData] = useState<Partial<PlanData>>({});
  const [planSummary, setPlanSummary] = useState<PlanSummary[]>([]);
  const [newPlan, setNewPlan] = useState({ name: "", price: 0, description: "", features: "" });

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

    // Count users by plan for subscriptions
    const counts: Record<string, number> = {};
    usersList.forEach((user) => {
      if (user.plan) {
        counts[user.plan] = (counts[user.plan] || 0) + 1;
      }
    });
    setPlanSummary(
      Object.entries(counts).map(([plan, count]) => ({
        plan,
        count,
      }))
    );
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

  const fetchPlans = async () => {
    const snapshot = await getDocs(collection(db, "plans"));
    setPlans(snapshot.docs.map((doc) => ({ ...(doc.data() as PlanData), id: doc.id })));
  };
  
const handleAddPlan = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault(); // prevent page reload if inside a form
if (!newPlan.name || newPlan.price < 0) {
  alert("Plan name is required and price cannot be negative");
  return;
}
  try {
    await addDoc(collection(db, "plans"), {
      name: newPlan.name,
      price: newPlan.price,
      description: newPlan.description,
      features: newPlan.features.split(",").map(f => f.trim()),
    });
    setNewPlan({ name: "", price: 0, description: "", features: "" });
    await fetchPlans(); // fetch after adding
  } catch (err) {
    console.error("Error adding plan:", err);
    alert("Failed to add plan");
  }
};


  const handleDeletePlan = async (id: string) => {
    await deleteDoc(doc(db, "plans", id));
    fetchPlans();
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
          await fetchPlans();
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

  const handleDeleteUser = async (uid: string) => {
  try {
    await deleteDoc(doc(db, "users", uid));
    setUsers(users.filter((u) => u.uid !== uid));
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("Failed to delete user");
  }
};

const handleDeactivateUser = async (uid: string) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: "inactive" }); // Or { active: false }
    setUsers(users.map((u) => (u.uid === uid ? { ...u, role: "inactive" } : u)));
  } catch (err) {
    console.error("Error deactivating user:", err);
    alert("Failed to deactivate user");
  }
};

const handleToggleActiveUser = async (uid: string, currentRole: string | undefined) => {
  try {
    const newRole = currentRole === "inactive" ? "user" : "inactive"; // toggle
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: newRole });
    setUsers(users.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
  } catch (err) {
    console.error("Error toggling user status:", err);
    alert("Failed to update user status");
  }
};

const exportCSV = () => {
  if (!planSummary || planSummary.length === 0) return;
  const header = ["Plan", "Active Users"];
  const rows = planSummary.map((p) => [p.plan, p.count]);
  const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "subscription_report.csv");
  link.click();
  URL.revokeObjectURL(url);
};




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
          <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === "plans" ? "bg-pink-100 font-semibold" : "hover:bg-gray-100"}`}
            onClick={() => setActiveTab("plans")}
          >
            Plans
          </li>
                    <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === "subscriptions" ? "bg-pink-100 font-semibold" : "hover:bg-gray-100"}`}
            onClick={() => setActiveTab("subscriptions")}
          >
            Subscriptions Dashboard
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
                    <th className="border px-4 py-2 text-left text-gray-800">Status</th>
                    <th className="border px-4 py-2 text-left text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">{user.fullName}</td>
                      <td className="border px-4 py-2">{user.email}</td>
                      <td className="border px-4 py-2">{user.role || "user"}</td>
                      <td className="border px-4 py-2 space-x-2">
                        <button
                          onClick={() => handleToggleActiveUser(user.uid, user.role)}
                          className={`px-3 py-1 rounded text-white ${
                            user.role === "inactive" ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600"
                          }`}
                        >
                          {user.role === "inactive" ? "Activate" : "Deactivate"}
                        </button>
                      </td>
                      <td className="border px-4 py-2 space-x-2">
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
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

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <section>
            <h2 className="text-3xl font-bold text-pink-600 mb-6">Manage Subscription Plans</h2>

            {/* Add New Plan */}
            <div className="mb-6 p-4 border rounded bg-gray-50 text-gray-600">
              <h3 className="font-semibold mb-2">Add New Plan</h3>
              <div className="flex flex-col gap-2">
                <input
                  className="border p-2 rounded"
                  placeholder="Plan Name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                />
                <input
                  type="number"
                  className="border p-2 rounded"
                  placeholder="Price"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Features (comma separated)"
                  value={newPlan.features}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                />
                <button
                  onClick={handleAddPlan}
                  className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                >
                  Add Plan
                </button>
              </div>
            </div>

          {/* Plans Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-gray-600">
              <thead className="bg-pink-50">
                <tr>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Features</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    {/* Name */}
                    <td className="border px-4 py-2">
                      {editingPlanId === p.id ? (
                        <input
                          type="text"
                          value={editingPlanData.name || ""}
                          onChange={(e) => setEditingPlanData({ ...editingPlanData, name: e.target.value })}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        p.name
                      )}
                    </td>

                    {/* Price */}
                    <td className="border px-4 py-2">
                      {editingPlanId === p.id ? (
                        <input
                          type="number"
                          value={editingPlanData.price || 0}
                          onChange={(e) => setEditingPlanData({ ...editingPlanData, price: Number(e.target.value) })}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        `$${p.price}`
                      )}
                    </td>

                    {/* Description */}
                    <td className="border px-4 py-2">
                      {editingPlanId === p.id ? (
                        <input
                          type="text"
                          value={editingPlanData.description || ""}
                          onChange={(e) => setEditingPlanData({ ...editingPlanData, description: e.target.value })}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        p.description
                      )}
                    </td>

                    {/* Features */}
                    <td className="border px-4 py-2">
                      {editingPlanId === p.id ? (
                        <input
                          type="text"
                          value={editingPlanData.features?.join(", ") || ""}
                          onChange={(e) =>
                            setEditingPlanData({ ...editingPlanData, features: e.target.value.split(",").map(f => f.trim()) })
                          }
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        p.features.join(", ")
                      )}
                    </td>

                    {/* Actions */}
                    <td className="border px-4 py-2 space-x-2">
                      {editingPlanId === p.id ? (
                        <>
                          <button
                            onClick={async () => {
                              if (!editingPlanId) return;
                              const planRef = doc(db, "plans", editingPlanId);
                              await updateDoc(planRef, editingPlanData);
                              setEditingPlanId(null);
                              fetchPlans();
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPlanId(null)}
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingPlanId(p.id);
                              setEditingPlanData(p);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlan(p.id)}
                            className="text-red-600 hover:underline px-3 py-1"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </section>
        )}

          {/* Subscriptions */}
        {activeTab === "subscriptions" && (
          <section>
            <h1 className="text-3xl font-bold text-pink-600 mb-8 flex items-center gap-2">
              <MdSubscriptions className="text-pink-600" /> Subscription
              Overview
            </h1>

            {planSummary.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <p className="text-gray-600">No users with a plan found.</p>
              </div>
            ) : (
              <>
                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {planSummary.map((plan, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center"
                    >
                      <h2 className="text-xl font-semibold text-gray-800">
                        {plan.plan}
                      </h2>
                      <p className="text-3xl font-bold text-pink-600 mt-3">
                        {plan.count}
                      </p>
                      <p className="text-gray-500">Users</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mb-4">
                  <button
                    onClick={exportCSV}
                    className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
                  >
                    Export Subscription Report
                  </button>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow h-[400px]">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Plan Distribution
                  </h2>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planSummary}
                        dataKey="count"
                        nameKey="plan"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {planSummary.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
