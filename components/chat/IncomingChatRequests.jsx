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
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function IncomingChatRequests() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chatRequests"),
      where("toUserId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [user]);

  const acceptRequest = async (req) => {
    const participants = [req.fromUserId, req.toUserId].sort();
    const chatId = `${req.ideaId}_${participants.join("_")}`;

    // Create chat
    await setDoc(doc(db, "chats", chatId), {
      ideaId: req.ideaId,
      participants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: "Chat started",
    });

    // Update request
    await updateDoc(doc(db, "chatRequests", req.id), {
      status: "accepted",
      handledAt: serverTimestamp(),
      chatId,
    });

    router.push(`/chats/${chatId}`);
  };

  const rejectRequest = async (reqId) => {
    await updateDoc(doc(db, "chatRequests", reqId), {
      status: "rejected",
      handledAt: serverTimestamp(),
    });
  };

  if (!requests.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Chat Requests</h2>

      {requests.map((req) => (
        <div
          key={req.id}
          className="border rounded p-4 mb-3 flex justify-between items-center"
        >
          <p className="text-sm">
            Someone wants to chat about your idea
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => acceptRequest(req)}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={() => rejectRequest(req.id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}