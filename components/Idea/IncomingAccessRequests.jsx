"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { orderBy } from "firebase/firestore";

export default function IncomingAccessRequests() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);

  // 🔎 Fetch access requests
  useEffect(() => {
    if (!user) return;

    const q = query(
  collection(db, "accessRequests"),
  where("ownerId", "==", user.uid),
  where("status", "==", "pending"),
  orderBy("createdAt", "desc")
);

    const unsub = onSnapshot(q, (snap) => {
      setRequests(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, [user]);

  // ✅ Approve access
  const approveRequest = async (req) => {
    try {
      await updateDoc(doc(db, "accessRequests", req.id), {
        status: "approved",
        handledAt: serverTimestamp(),
      });

      toast.success("Access granted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve request");
    }
  };

  // ❌ Reject access
  const rejectRequest = async (reqId) => {
    try {
      await updateDoc(doc(db, "accessRequests", reqId), {
        status: "rejected",
        handledAt: serverTimestamp(),
      });

      toast.success("Access request rejected");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject request");
    }
  };

  if (!requests.length) return null;

  return (
    <section className="mt-10 bg-purple-50 border border-purple-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-purple-700">
        <LockClosedIcon className="w-5 h-5" />
        Access Requests
      </h2>

      {requests.map((req) => (
        <div
          key={req.id}
          className="border bg-white rounded-lg p-4 mb-4 flex justify-between items-center shadow-sm hover:shadow-md transition"
        >
          {/* Left Content */}
          <div className="text-sm">
            <span
              onClick={() => {
  if (req.requesterId) {
    router.push(`/user/${req.requesterId}`);
  }
}}
              className="font-medium text-blue-600 cursor-pointer hover:underline"
            >
              {req.requesterEmail || "Unknown user"}
            </span>{" "}
            <span className="text-gray-700">
  wants access to{" "}
</span>
            <span className="font-semibold text-gray-800">
              {req.ideaTitle || "your protected idea"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => approveRequest(req)}
              className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition"
            >
              Approve
            </button>

            <button
              onClick={() => rejectRequest(req.id)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}