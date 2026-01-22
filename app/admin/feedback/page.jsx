"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

export default function AdminFeedbackPage() {
  const { user, loading, isAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(
      collection(db, "feedback"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbacks(data);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const markAsSeen = async (id) => {
    try {
      await updateDoc(doc(db, "feedback", id), {
        status: "seen",
        seenAt: serverTimestamp(),
        seenBy: "admin",
      });
    } catch (err) {
      console.error("Failed to mark as seen", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <p>Access denied</p>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-white">
        User Feedback
      </h1>

      {feedbacks.length === 0 && (
        <p className="text-gray-500">No feedback yet.</p>
      )}

      <div className="space-y-4">
        {feedbacks.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 bg-white shadow"
          >
            <p className="text-gray-700 mt-1">
              {item.message}
            </p>

            <p className="text-sm text-indigo-600 font-medium ">{item.userEmail}</p>

            <p className="text-xs text-gray-400 mt-1">
              {item.createdAt?.toDate().toLocaleString()}
            </p>

            {item.status === "open" ? (
              <button
                onClick={() => markAsSeen(item.id)}
                className="mt-3 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Mark as Seen
              </button>
            ) : (
              <span className="mt-3 inline-block text-green-600 font-medium">
                ✅ Seen
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}