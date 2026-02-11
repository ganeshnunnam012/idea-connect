"use client";

import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ChatTrigger({ ideaId, ideaOwnerId }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    /* ===============================
       BASIC SAFETY CHECKS
    =============================== */
    if (!user || !user.uid) {
      toast.error("Authentication not ready. Please try again.");
      return;
    }

    if (!ideaOwnerId) {
      toast.error("Idea owner not found.");
      return;
    }

    if (user.uid === ideaOwnerId) {
      toast.error("You cannot chat with yourself.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      /* ===============================
         DETERMINISTIC IDS
      =============================== */
      const requestId = `${ideaId}_${user.uid}_${ideaOwnerId}`;

      const participants = [user.uid, ideaOwnerId].sort();
      const chatId = `${ideaId}_${participants.join("_")}`;

      const reqRef = doc(db, "chatRequests", requestId);
      const reqSnap = await getDoc(reqRef);

      /* ===============================
         STEP 1: EXISTING REQUEST CHECK
      =============================== */
      if (reqSnap.exists()) {
        const reqData = reqSnap.data();

        // ✅ ACCEPTED → OPEN CHAT
        if (reqData.status === "accepted") {
          router.push(`/chats/${chatId}`);
          return;
        }

        // ⏳ PENDING → BLOCK DUPLICATE
        if (reqData.status === "pending") {
          toast("Chat request already sent. Please wait for approval.");
          return;
        }

        // ❌ REJECTED → RESEND
        if (reqData.status === "rejected") {
          await updateDoc(reqRef, {
            status: "pending",
            handledAt: null,
            updatedAt: serverTimestamp(),
          });

          toast.success("Chat request re-sent.");
          return;
        }
      }

      /* ===============================
         STEP 2: CREATE NEW REQUEST
      =============================== */
      await setDoc(reqRef, {
        ideaId,
        fromUserId: user.uid,
        fromUserEmail: user.email || null,
        fromUserName: user.displayName || null,
        toUserId: ideaOwnerId,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Chat request sent successfully.");
    } catch (err) {
      console.error("CHAT REQUEST ERROR:", err);
      toast.error("Failed to process chat request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startChat}
      disabled={loading}
      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : "Chat with Author"}
    </button>
  );
}