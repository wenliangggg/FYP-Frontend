"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface Review {
  id: string;
  userId: string;
  userName: string;
  content: string;
  itemId: string;
  type: string;
  title: string;
}

interface Report {
  id: string;
  reportedBy: string;
  reason?: string;
  createdAt: any;
  title: string;
  itemId: string;
  type: string;
}

export default function ReportedContentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, "users", u.uid));
        const role = userDoc.exists() ? userDoc.data()?.role : null;
        setIsAdmin(role === "admin");
        if (role === "admin") fetchReports();
        else setLoading(false);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "reports-contents"));
      const tempReports: Report[] = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        tempReports.push({
          id: docSnap.id,
          reportedBy: data.reportedBy,
          reason: data.reason,
          createdAt: data.createdAt,
          title: data.title,
          itemId: data.itemId,
          type: data.type,
        });
      }

      setReports(tempReports);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleDeleteReport(reportId: string) {
    if (!confirm("Delete this report?")) return;
    try {
      await deleteDoc(doc(db, "reports-contents", reportId));
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p className="p-6">Loading…</p>;
  if (!user || !isAdmin)
    return <p className="p-6 text-red-600">You do not have permission.</p>;

  return (
    <main className="bg-white">
      <div className="max-w-[900px] mx-auto p-6 font-sans text-gray-800">
        <h1 className="text-2xl font-bold mb-4">Reported Content</h1>
        {reports.length === 0 ? (
          <p>No reports yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reports.map((r) => (
              <div key={r.id} className="border p-4 rounded-xl bg-[#fafafa]">
                <p><strong>Reported by UID:</strong> {r.reportedBy}</p>
                {r.reason && <p><strong>Reason:</strong> {r.reason}</p>}
                <p>
                  <strong>Reported At:</strong>{" "}
                  {r.createdAt?.toDate
                    ? r.createdAt.toDate().toLocaleString()
                    : r.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : "Unknown"}
                </p>
                <p><strong>Item:</strong> {r.title} ({r.type})</p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDeleteReport(r.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                  >
                    Delete Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
