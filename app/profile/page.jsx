"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import PersonalDetailsForm from "@/components/User/PersonalDetailsForm";
import PersonalDetailsView from "@/components/User/PersonalDetailsView";
import IdeaCard from "@/components/Idea/IdeaCard";
import { hasPersonalDetails } from "@/lib/profileChecks";
import ProtectedRoute from "@/components/ProtectedRoute";
import IncomingChatRequests from "@/components/chat/IncomingChatRequests";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const canUseFirestore = !loading && user && !user.isBanned;
  const [userData, setUserData] = useState(null);
  const [myIdeas, setMyIdeas] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (!canUseFirestore) return;

    const fetchProfileData = async () => {
      try {
        // User profile
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserData({ uid: user.uid, ...userSnap.data() });
        }

        // My ideas
        const ideasSnap = await getDocs(
          query(collection(db, "ideas"), where("userId", "==", user.uid))
        );
        setMyIdeas(
          ideasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );

        // Saved ideas
        const savedSnap = await getDocs(
          collection(db, "users", user.uid, "savedIdeas")
        );

        if (!savedSnap.empty) {
          const ids = savedSnap.docs.map((d) => d.id);
          const ideasQuery = await getDocs(
            query(collection(db, "ideas"), where("__name__", "in", ids))
          );
          setSavedIdeas(
            ideasQuery.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        }
      }
      catch (err) {
  console.error("Profile fetch failed:", err);
} finally {
        setPageLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  /* 🔹 Auth-only guard (no UI block) */
  if (loading) return null;

  if (!user) {
    return (
      <p className="text-center mt-10">
        Please login to view profile
      </p>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-6">
        {/* PROFILE HEADER */}
        {!userData ? (
          <div className="h-24 bg-gray-800 rounded animate-pulse mb-6" />
        ) : (
          <ProfileHeader
            userData={userData}
            isOwner={true}
            onNameClick={() => {
              setShowContactDetails((p) => !p);
              setShowEditForm(false);
            }}
            onUserUpdate={(updates) =>
              setUserData((prev) => ({ ...prev, ...updates }))
            }
          />
        )}

        <IncomingChatRequests />

        {/* INCOMPLETE PROFILE WARNING */}
        {userData &&
          !hasPersonalDetails(userData) &&
          !showEditForm && (
            <div
  style={{
    border: "1px solid #facc15",
    backgroundColor: "#fefce8",
    color: "#92400e",
    padding: "12px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    marginBottom: "16px",
  }}
>
  <span style={{ fontSize: "16px" }}>⚠️</span>

  <div>
    <strong>Your profile is incomplete.</strong>
    <br />
    Add contact details so others can reach you.
    <br />
    <button
  onClick={() => {
    setShowContactDetails(true);
    setShowEditForm(true);
  }}
  style={{
    background: "none",
    border: "none",
    padding: 0,
    color: "#1d4ed8",
    fontWeight: 500,
    textDecoration: "underline",
    cursor: "pointer",
  }}
>
  Add personal details
</button>
  </div>
</div>
          )}

        {/* CONTACT DETAILS */}
        {showContactDetails && userData && !showEditForm && (
          <PersonalDetailsView
            userData={userData}
            isOwner={true}
            onEdit={() => {
              setShowEditForm(true);
              setShowContactDetails(false);
            }}
          />
        )}

        {/* EDIT FORM */}
        {showEditForm && userData && (
          <PersonalDetailsForm
            userData={userData}
            onSaved={(updated) => {
              setUserData((prev) => ({ ...prev, ...updated }));
              setShowEditForm(false);
              setShowContactDetails(true);
            }}
            onClose={() => {
              setShowEditForm(false);
              setShowContactDetails(true);
            }}
          />
        )}

        {/* MY IDEAS */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">My Ideas</h2>

          {pageLoading ? (
            <p className="text-gray-500">Loading your ideas...</p>
          ) : myIdeas.length === 0 ? (
            <p className="text-gray-500">
              You haven’t posted any ideas yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  user={user}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* SAVED IDEAS */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Saved Ideas</h2>

          {pageLoading ? (
            <p className="text-gray-500">Loading saved ideas...</p>
          ) : savedIdeas.length === 0 ? (
            <p className="text-gray-500">No saved ideas yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  user={user}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}