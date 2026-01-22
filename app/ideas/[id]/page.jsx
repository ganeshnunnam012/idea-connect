"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getIdeaById } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";

import ChatBox from "@/components/chat/ChatBox";
import ChatTrigger from "@/components/chat/ChatTrigger";

const IdeaDetailsPage = () => {
  const { id } = useParams();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const data = await getIdeaById(id);
        setIdea(data);
      } catch (error) {
        console.error("Error fetching idea:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  /* ---------- SAFE EARLY RETURNS ---------- */
  if (loading) return <p>Loading idea...</p>;
  if (!idea) return <p>Idea not found</p>;

  /* ---------- CHAT PERMISSION LOGIC ---------- */
  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guestUser") === "true";

  const isOwner = user && idea?.userId === user.uid;

  const canChat = user && !isGuest && !isOwner;

  /* ---------- UI ---------- */
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{idea.title}</h1>

      <p className="text-gray-700 mb-6">{idea.description}</p>

      <div className="text-sm text-gray-500">
        Posted by: {idea.userEmail || "Anonymous"}
      </div>

      {/* ---------- CHAT TRIGGER ---------- */}
      {user && !isOwner && (
        <div style={{ marginTop: "16px" }}>
          <ChatTrigger ideaId={idea.id} ideaOwnerId={idea.userId} />
        </div>
      )}
      {/* ---------- CHAT BOX ---------- */}
      {showChat && (
        <ChatBox
          ideaId={idea.id}
          ownerId={idea.userId}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default IdeaDetailsPage;