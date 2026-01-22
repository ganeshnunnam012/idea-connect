"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import IdeaList from "@/components/Idea/IdeaList";
import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Loading...
      </p>
    );
  }

  return (
    <ProtectedRoute>
    <main>
      <div style={{ padding: "40px", textAlign: "center" }}>
        {/* Welcome / Info message */}
        {user ? (
  <p>Welcome back, <strong>{user.email}</strong></p>
) : (
  <p>Browse ideas freely. Login to post or interact.</p>
)}

        {/* IDEAS SECTION */}
        <section className="ideas" style={{ marginTop: "30px" }}>
          <Suspense fallback={null}>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search ideas by title, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            {/* Idea List (Firestore-driven) */}
            <IdeaList searchQuery={searchQuery}
            user={user}
            allowEdit={false} 
            />
          </Suspense>
        </section>

        {/* Action Buttons */}
        {!user && (
          <div style={{ marginTop: "30px" }}>
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Login / Sign Up
            </button>
          </div>
        )}
      </div>
    </main>
    </ProtectedRoute>
  );
}