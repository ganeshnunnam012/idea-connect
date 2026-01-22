"use client";

import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function ChatTrigger({ ideaId, ideaOwnerId }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
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
         STEP 1: CHECK EXISTING REQUEST
      =============================== */

      const reqQuery = query(
        collection(db, "chatRequests"),
        where("ideaId", "==", ideaId),
        where("fromUserId", "==", user.uid),
        where("toUserId", "==", ideaOwnerId)
      );

      const reqSnap = await getDocs(reqQuery);

      const participants = [user.uid, ideaOwnerId].sort();
      const chatId = `${ideaId}_${participants.join("_")}`;

      if (!reqSnap.empty) {
        const reqDoc = reqSnap.docs[0];
        const reqData = reqDoc.data();

        // ✅ ACCEPTED → OPEN CHAT
        if (reqData.status === "accepted") {
          router.push(`/chats/${chatId}`);
          return;
        }

        // ⏳ PENDING → BLOCK DUPLICATE
        if (reqData.status === "pending") {
          alert("Chat request already sent. Please wait for approval.");
          return;
        }

        // ❌ REJECTED → ALLOW RESEND
        if (reqData.status === "rejected") {
          await updateDoc(doc(db, "chatRequests", reqDoc.id), {
            status: "pending",
            handledAt: null,
            updatedAt: serverTimestamp(),
          });

          alert("Chat request re-sent.");
          return;
        }
      }

      /* ===============================
         STEP 2: CREATE NEW REQUEST
      =============================== */

      await setDoc(doc(collection(db, "chatRequests")), {
        ideaId,
        fromUserId: user.uid,
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