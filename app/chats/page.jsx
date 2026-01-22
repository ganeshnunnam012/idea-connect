"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function ChatsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  // cache user info to avoid repeated reads
  const [userMap, setUserMap] = useState({});

  /* ================= FETCH CHATS ================= */
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // 🚫 STOP banned users before Firestore runs
if (user?.isBanned) {
  setLoadingChats(false);
  return;
}

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChats(list);
      setLoadingChats(false);

      // fetch missing user profiles only once
      const missingUserIds = new Set();

      list.forEach((chat) => {
        const otherUserId = chat.participants.find(
          (id) => id !== user.uid
        );
        if (otherUserId && !userMap[otherUserId]) {
          missingUserIds.add(otherUserId);
        }
      });

      for (const uid of missingUserIds) {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            setUserMap((prev) => ({
              ...prev,
              [uid]: snap.data(),
            }));
          }
        } catch (err) {
          console.error("Failed to load user:", uid, err);
        }
      }
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  /* ================= UI STATES ================= */
  if (loading || loadingChats) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-400">Loading chats…</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <p className="text-gray-400">No chats yet</p>
      </div>
    );
  }

  /* ================= MAIN RENDER ================= */
  return (
    <ProtectedRoute>
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-white">
        Your Chats
      </h2>

      <div className="space-y-4">
        {chats.map((chat) => {
          const otherUserId = chat.participants.find(
            (id) => id !== user.uid
          );

          const otherUser =
            userMap[otherUserId]?.name ||
            userMap[otherUserId]?.email ||
            "User";

          const isUnread =
            chat.lastSenderId &&
            chat.lastSenderId !== user.uid;

          return (
            <div
              key={chat.id}
              className="bg-white border rounded-lg px-5 py-4 flex justify-between items-center shadow-sm"
            >
              {/* LEFT SIDE */}
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Chat with{" "}
                  <span
                    className="font-medium text-blue-600 cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/user/${otherUserId}`);
                    }}
                  >
                    {otherUser}
                  </span>
                </p>

                <p className="text-sm text-gray-500">
                  {chat.lastMessage || "Chat started"}
                </p>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-3">
                {isUnread && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/chats/${chat.id}`);
                  }}
                  className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700 transition"
                >
                  Continue Chat
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </ProtectedRoute>
  );
}