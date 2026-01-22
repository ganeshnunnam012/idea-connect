"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import toast from "react-hot-toast";

export default function AboutPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);

  /* ================= LOGOUT (UNCHANGED) ================= */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* ================= SEND FEEDBACK ================= */
  const handleSubmitFeedback = async () => {
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    try {
      setSending(true);

      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        userEmail: user.email,
        message: message.trim(),
        status: "open",
        createdAt: serverTimestamp(),
      });

      setMessage("");
      toast.success("Feedback sent successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send feedback");
    } finally {
      setSending(false);
    }
  };

  /* ================= LOAD USER FEEDBACK ================= */
  useEffect(() => {
    if (!user) return;

    const q = isAdmin
      ? query(
          collection(db, "feedback"),
          orderBy("createdAt", "desc")
        )
      : query(
          collection(db, "feedback"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

    const unsub = onSnapshot(q, (snap) => {
      setMyFeedback(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [user, isAdmin]);

  return (
    <div className="min-h-screen bg-gray-950 flex justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-lg p-8">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-white mb-4">
          About Idea Connect 💡
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Idea Connect is a platform designed to share ideas, discover gaps,
          collaborate with others, and turn thoughts into real-world solutions.
        </p>

        {/* HOW IT WORKS */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            How the Platform Works
          </h2>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Create an account or log in</li>
            <li>Post ideas with clear descriptions</li>
            <li>Explore ideas shared by others</li>
            <li>Save ideas for later reference</li>
            <li>Report issues or give feedback</li>
          </ul>
        </section>

        {/* GUIDELINES */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            Community Guidelines
          </h2>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Share respectful and original ideas</li>
            <li>Avoid spam, hate speech, or harmful content</li>
            <li>Do not misuse reporting features</li>
            <li>Repeated violations may lead to restrictions</li>
          </ul>
        </section>

        {/* PRIVACY */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            Privacy & Safety
          </h2>
          <p className="text-gray-400">
            Feedback and reports are private and visible only to you and
            administrators. Moderation actions help maintain a safe environment.
          </p>
        </section>

        {/* FEEDBACK */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">
            Send Feedback or Report an Issue
          </h2>

          <textarea
            className="w-full bg-gray-800 text-white rounded p-3 outline-none resize-none"
            rows={4}
            placeholder="Share any issues, problems, or suggestions (only visible to you and admin)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={handleSubmitFeedback}
            disabled={sending}
            className="mt-3 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {sending ? "Sending..." : "Submit Feedback"}
          </button>

          {/* USER FEEDBACK LIST */}
          {myFeedback.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg text-white mb-2">
                {isAdmin ? "All User Feedback" : "Your Submitted Feedback"}
              </h3>

              <div className="space-y-3">
                {myFeedback.map((f) => (
                  <div
                    key={f.id}
                    className="bg-gray-800 p-3 rounded text-gray-300"
                  >
                    <p>{f.message}</p>

                    <p className="text-xs text-gray-500 mt-1">
                      {f.createdAt?.toDate().toLocaleString()}
                    </p>

                    {f.status === "seen" ? (
                      <p className="text-green-400 text-sm mt-1">
                        ✅ Admin has reviewed this
                      </p>
                    ) : (
                      <p className="text-yellow-400 text-sm mt-1">
                        ⏳ Waiting for admin review
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* LOGOUT (UNCHANGED) */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}