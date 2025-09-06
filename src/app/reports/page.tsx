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
  reviewId: string;
  reportedBy: string;
  reason?: string;
  createdAt: any;
  reviewData?: Review;
}

export default function ReportedReviewsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Get user document to check role
        const userDoc = await getDoc(doc(db, "users", u.uid));
        const role = userDoc.exists() ? userDoc.data()?.role : null;
        setIsAdmin(role === "admin");
        if (role === "admin") {
          fetchReports();
        } else {
          setLoading(false);
        }
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
      const snap = await getDocs(collection(db, "reports"));
      const tempReports: Report[] = [];

      for (const docSnap of snap.docs) {
        const reportData = docSnap.data();
        const reviewRef = doc(db, "books-video-reviews", reportData.reviewId);
        const reviewSnap = await getDoc(reviewRef);

        let reviewData: Review | undefined = undefined;
        if (reviewSnap.exists()) {
          const r = reviewSnap.data();
          reviewData = {
            id: reviewSnap.id,
            userId: r.userId || "",
            userName: r.userName || "Anonymous",
            content: r.content || "",
            itemId: r.itemId || "",
            type: r.type || "",
            title: r.title || "",
          };
        }

        tempReports.push({
          id: docSnap.id,
          reviewId: reportData.reviewId,
          reportedBy: reportData.reportedBy,
          reason: reportData.reason,
          createdAt: reportData.createdAt,
          reviewData,
        });
      }

      setReports(tempReports);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  // 🔹 Delete a report
  async function handleDeleteReport(reportId: string) {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await deleteDoc(doc(db, "reports", reportId));
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  }

  // 🔹 Delete both report & review (optional)
  async function handleDeleteReviewAndReport(report: Report) {
    if (!confirm("Delete both the review and its report?")) return;

    try {
      // delete report
      await deleteDoc(doc(db, "reports", report.id));
      // delete review if exists
      if (report.reviewData) {
        await deleteDoc(doc(db, "books-video-reviews", report.reviewId));
      }
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      console.error("Error deleting report & review:", err);
    }
  }

  if (loading) return <p className="p-6">Loading…</p>;

  if (!user || !isAdmin) {
    return (
      <p className="p-6 text-red-600">
        You do not have permission to view this page.
      </p>
    );
  }

  return (
    <main className="bg-white">
      <div className="max-w-[900px] mx-auto p-6 font-sans text-gray-800 bg-white">
        <h1 className="text-2xl font-bold mb-4">Reported Reviews</h1>
        {reports.length === 0 ? (
          <p>No reports yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reports.map((r) => (
              <div key={r.id} className="border p-4 rounded-xl bg-[#fafafa]">
                <p>
                  <strong>Reported by UID:</strong> {r.reportedBy}
                </p>
                {r.reason && (
                  <p>
                    <strong>Reason:</strong> {r.reason}
                  </p>
                )}
                <p>
                  <strong>Reported At:</strong>{" "}
                  {r.createdAt && "toDate" in r.createdAt
                    ? r.createdAt.toDate().toLocaleString()
                    : r.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : "Unknown"}
                </p>

                {r.reviewData ? (
                  <div className="mt-2 p-2 border rounded-lg bg-white">
                    <p>
                      <strong>Review by:</strong> {r.reviewData.userName}
                    </p>
                    <p>
                      <strong>Content:</strong> {r.reviewData.content}
                    </p>
                    <p>
                      <strong>Item:</strong> {r.reviewData.title} (
                      {r.reviewData.type})
                    </p>
                  </div>
                ) : (
                  <p className="text-red-500 mt-2">Original review deleted</p>
                )}

                {/* 🔹 Delete buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDeleteReport(r.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                  >
                    Delete Report
                  </button>
                  {r.reviewData && (
                    <button
                      onClick={() => handleDeleteReviewAndReport(r)}
                      className="px-3 py-1 bg-red-700 text-white rounded-lg text-sm"
                    >
                      Delete Review & Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
