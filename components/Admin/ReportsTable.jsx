"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function ReportsTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================================================
     REAL-TIME FETCH REPORTS + USER INFO + LIVE COUNTS
     ====================================================== */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reports"), async (snap) => {
      try {
        // 1️⃣ Build live report count per user
        const reportCountMap = {};
        snap.docs.forEach((d) => {
          const r = d.data();
          reportCountMap[r.reportedUserId] =
            (reportCountMap[r.reportedUserId] || 0) + 1;
        });

        // 2️⃣ Attach user data + derived counts
        const data = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const report = docSnap.data();
            const userRef = doc(db, "users", report.reportedUserId);
            const userSnap = await getDoc(userRef);

            return {
              id: docSnap.id,
              ...report,
              user: userSnap.exists()
                ? {
                    ...userSnap.data(),
                    reportCount:
                      reportCountMap[report.reportedUserId] || 0,
                  }
                : null,
            };
          })
        );

        setReports(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  /* ======================================================
     ADMIN API CALL (DELETE / REVIEW)
     ====================================================== */
  const adminAction = async (payload) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("Not authenticated");

    const token = await user.getIdToken();

    const res = await fetch("/api/admin/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("NON JSON RESPONSE:", text);
      throw new Error("Server returned invalid response");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Action failed");

    return data;
  };

  /* ======================================================
     REVIEW REPORT
     ====================================================== */
  const markReviewed = async (id) => {
    try {
      await adminAction({ action: "review", reportId: id });
      toast.success("Marked as reviewed");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  /* ======================================================
     DELETE REPORT
     ====================================================== */
  const deleteReport = async (id) => {
    if (!confirm("Delete this report?")) return;

    try {
      await adminAction({ action: "delete", reportId: id });
      toast.success("Report deleted");
      // UI updates automatically via onSnapshot
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  /* ======================================================
     BAN / UNBAN USER
     ====================================================== */
  const toggleBan = async (userId, isBanned) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBanned: !isBanned,
      });

      toast.success(isBanned ? "User unbanned" : "User banned");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  /* ======================================================
     UI
     ====================================================== */
  if (loading) return <p>Loading reports...</p>;
  if (reports.length === 0) return <p>No reports found.</p>;

  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-black font-bold">User</th>
            <th className="border p-2 text-black font-bold">Reason</th>
            <th className="border p-2 text-black font-bold text-center">
              Reports
            </th>
            <th className="border p-2 text-black font-bold text-center">
              Status
            </th>
            <th className="border p-2 text-black font-bold text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">
                {r.user?.displayName || "Unknown"}
              </td>

              <td className="border p-2">{r.reason}</td>

              <td className="border p-2 text-center">
                {r.user?.reportCount ?? 0}
              </td>

              <td className="border p-2 text-center">
                {r.user?.isBanned ? "Banned" : "Active"}
              </td>

              <td className="border p-2 text-center space-x-2">
                {!r.reviewed && (
                  <button
                    onClick={() => markReviewed(r.id)}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Review
                  </button>
                )}

                <button
                  onClick={() =>
                    toggleBan(r.reportedUserId, r.user?.isBanned)
                  }
                  className={`px-2 py-1 rounded text-white ${
                    r.user?.isBanned ? "bg-blue-600" : "bg-red-600"
                  }`}
                >
                  {r.user?.isBanned ? "Unban" : "Ban"}
                </button>

                <button
                  onClick={() => deleteReport(r.id)}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}