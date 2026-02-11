"use client";

import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { rtdb } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { ArrowLeft } from "lucide-react";

/* ================================
   AVATAR COLOR UTILS
================================ */
const COLORS = [
  "#1abc9c",
  "#3498db",
  "#9b59b6",
  "#e67e22",
  "#e74c3c",
  "#2ecc71",
  "#16a085",
  "#2980b9",
  "#8e44ad",
  "#d35400",
];

function getAvatarColor(letter) {
  if (!letter) return COLORS[0];
  const code = letter.charCodeAt(0);
  return COLORS[code % COLORS.length];
}

/* ================================
   LAST SEEN FORMATTER
================================ */
function formatLastSeen(timestamp) {
  if (!timestamp) return "Last seen recently";

  const last = timestamp.toDate();
  const now = new Date();

  const diffMs = now - last;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = last.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) {
    return `Last seen today at ${time}`;
  }

  if (diffDays === 1) {
    return `Last seen yesterday at ${time}`;
  }

  return `Last seen on ${last.toLocaleDateString()} at ${time}`;
}

function TypingIndicator() {
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:300ms]" />
    </span>
  );
}

/* ================================
   CHAT HEADER
================================ */
export default function ChatHeader({ chatId, otherUserId }) {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [status, setStatus] = useState(null);

  /* -------------------------------
     LISTEN TO USER STATUS
  -------------------------------- */
  useEffect(() => {
    if (!otherUserId) return;

    const unsub = onSnapshot(doc(db, "users", otherUserId), (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      setUserData(data);

      // SAFE FIELD ACCESS (important)
      setTyping(data?.typingInChat === chatId);
    });

    return () => unsub();
  }, [otherUserId, chatId]);

  /* -------------------------------
     UPDATE LAST ACTIVITY (SAFE)
     (does NOT spam Firestore)
  -------------------------------- */
  useEffect(() => {
  if (!otherUserId) return;

  const statusRef = ref(rtdb, `/status/${otherUserId}`);

  const unsubscribe = onValue(statusRef, (snapshot) => {
    setStatus(snapshot.val());
  });

  return () => unsubscribe();
}, [otherUserId]);

useEffect(() => {
  if (!status) return;

  // ✅ Realtime DB is the ONLY source for online/offline
  setOnline(status?.state === "online");
}, [status]);

  if (!userData) return null;

  /* -------------------------------
     USER DISPLAY DATA
  -------------------------------- */
  const name = userData.displayName || "User";
  const firstLetter = name.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(firstLetter);

  /* -------------------------------
     STATUS PRIORITY LOGIC
     (THIS FIXES YOUR ISSUE)
     1. Typing
     2. Online
     3. Last seen
  -------------------------------- */
  let statusText = "";
  let statusColor = "text-gray-400";

  if (typing) {
  statusText = <TypingIndicator />;
  statusColor = "text-green-500";
} else if (online) {
    statusText = "Online";
    statusColor = "text-green-500";
  } else {
  statusText = formatLastSeen(userData?.lastSeen);
  statusColor = "text-gray-400";
}

  /* ================================
     UI
  ================================= */
  return (
    <div
  className="
    flex items-center gap-3 px-4 py-3 border-b bg-slate-800 text-white
    transition-all duration-300 ease-out
    animate-header-in
  "
>
      <button
  onClick={() => router.push("/chats")}
  className="p-1 hover:bg-slate-700 rounded-full transition"
  aria-label="Back to chats"
>
  <ArrowLeft size={18} />
</button>
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
        style={{ backgroundColor: avatarColor }}
      >
        {firstLetter}
      </div>

      {/* Name & Status */}
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-white">{name}</span>
        <div className="h-5 overflow-hidden flex items-center">
  <span
    className={`
      text-sm ${statusColor}
      transition-opacity duration-200 ease-in-out
    `}
  >
    {statusText}
  </span>
</div>
      </div>
    </div>
  );
}