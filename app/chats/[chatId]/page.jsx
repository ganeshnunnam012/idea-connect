"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

import ChatHeader from "@/components/chat/ChatHeader";
import ChatBox from "@/components/chat/ChatBox";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { chatId } = useParams();
  const router = useRouter();

  const { user, loading } = useAuth();

  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [otherUserId, setOtherUserId] = useState(null);

  /* ================= ACCESS + OTHER USER ================= */
  useEffect(() => {
    // ⛔ wait until auth is ready
    if (loading) return;

    // ⛔ no user or no chatId
    if (!user || !chatId) {
      setChecking(false);
      return;
    }

    const checkAccess = async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        const snap = await getDoc(chatRef);

        if (!snap.exists()) {
          toast.error("Chat not found");
          router.push("/home");
          return;
        }

        const data = snap.data();

        // 🔐 Client-side safety check
        if (!data.participants?.includes(user.uid)) {
          toast.error("You are not allowed to access this chat");
          router.push("/home");
          return;
        }

        // ✅ ACCESS GRANTED
        setAllowed(true);

        // 👤 GET OTHER USER ID
        const other = data.participants.find(
          (uid) => uid !== user.uid
        );
        setOtherUserId(other);
      } catch (error) {
        console.error("Chat access error:", error);
        router.push("/home");
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [user, loading, chatId, router]);

  /* ================= STATES ================= */
  if (loading || checking) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center mt-10">
        Please login to access chats
      </p>
    );
  }

  if (!allowed || !otherUserId) return null;

  /* ================= CHAT ================= */
  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto mt-6 h-[70vh] flex flex-col">
        <ChatHeader
          chatId={chatId}
          otherUserId={otherUserId}
        />

        <ChatBox chatId={chatId} />
      </div>
    </ProtectedRoute>
  );
}