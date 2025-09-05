'use client';

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Subscription {
  plan: string;
  amount: number;
  status: string;
  createdAt: any;
}

export default function PaymentHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // fetch all subscriptions for this user
        const q = query(
          collection(db, "subscriptions"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const subs = snapshot.docs.map((doc) => doc.data() as Subscription);
        setSubscriptions(subs);
      } else {
        setUser(null);
        setSubscriptions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

/*   const exportCSV = () => {
    if (!subscriptions.length) return;

    const header = ["Plan", "Amount", "Status", "Date"];
    const rows = subscriptions.map((s) => [
      s.plan,
      s.amount,
      s.status,
      s.createdAt?.toDate ? s.createdAt.toDate().toISOString() : s.createdAt,
    ]);
    const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "my_subscription_history.csv");
    link.click();
    URL.revokeObjectURL(url);
  };
 */
  if (loading) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading your subscription history...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-gray-600">You must be logged in to view your subscriptions.</p>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen p-6">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">My Subscription History</h1>

{/*         <div className="flex justify-end mb-4">
          <button
            onClick={exportCSV}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
          >
            Export My Subscriptions
          </button>
        </div> */}

        {subscriptions.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-600">No subscription history found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-pink-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Plan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((sub, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-3 text-gray-700">{sub.plan}</td>
                    <td className="px-6 py-3 text-gray-700">${sub.amount.toFixed(2)}</td>
                    <td className={`px-6 py-3 font-semibold ${
                      sub.status === "paid" ? "text-green-600" : "text-red-600"
                    }`}>
                      {sub.status.toUpperCase()}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {sub.createdAt?.toDate
                        ? sub.createdAt.toDate().toLocaleString()
                        : sub.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
