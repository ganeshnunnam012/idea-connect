"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import IdeaForm from "@/components/Idea/IdeaForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function PostIdeaClient() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();

  const isEdit = searchParams.get("edit") === "true";
  const ideaId = searchParams.get("id");

  const [initialData, setInitialData] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (!isEdit || !ideaId) return;

    const fetchIdea = async () => {
      try {
        setPageLoading(true);
        const snap = await getDoc(doc(db, "ideas", ideaId));
        if (snap.exists()) {
          setInitialData({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchIdea();
  }, [isEdit, ideaId]);

  if (loading || pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold ">
            {isEdit ? "Edit Your Idea" : "Post New Idea"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isEdit
              ? "Update your idea details and keep it fresh."
              : "Share your idea with the community and inspire others."}
          </p>
        </div>

        <IdeaForm
          user={user}
          isEdit={isEdit}
          initialData={initialData}
        />
      </main>
    </ProtectedRoute>
  );
}