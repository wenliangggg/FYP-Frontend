"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MdSubscriptions } from "react-icons/md";
import dynamic from "next/dynamic";

// ✅ Import Recharts components normally (not via dynamic)
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// ✅ Only lazy load ResponsiveContainer
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);


interface UserData {
  id?: string;
  fullName: string;
  email: string;
  plan?: string; // 👈 user plan stored here
  role?: string;
}

interface PlanSummary {
  plan: string;
  count: number;
}

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

export default function AdminSubscriptionDashboard() {
  const [planSummary, setPlanSummary] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as UserData),
      }));

      // ✅ Count users by plan
      const counts: Record<string, number> = {};
      usersList.forEach((user) => {
        if (user.plan) {
          counts[user.plan] = (counts[user.plan] || 0) + 1;
        }
      });

    const summaryArray = Object.entries(counts).map(([plan, count]) => ({
      plan,
      count: Number(count), // 👈 force numeric
    }));

      setPlanSummary(summaryArray);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading user data...</p>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen p-6">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-8 flex items-center gap-2">
          <MdSubscriptions className="text-pink-600" /> Plan Overview (Users)
        </h1>

        {planSummary.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-600">No users with a plan found.</p>
          </div>
        ) : (
          <>
            {/* ✅ Cards */}
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

            {/* ✅ Pie Chart */}
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
                        stroke="#fff" // 👈 adds white border between slices
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
    </main>
  );
}
