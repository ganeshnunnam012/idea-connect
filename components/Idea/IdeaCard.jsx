"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import toast from "react-hot-toast";
import {
  BookmarkIcon as BookmarkOutline,
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkSolid,
} from "@heroicons/react/24/solid";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { requestIdeaAccess } from "@/lib/db";

/* ------------------------------------
   Helper: Date formatter
------------------------------------ */
const formatDate = (date) => {
  if (!date) return "";
  const d = date.seconds
    ? new Date(date.seconds * 1000)
    : new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ------------------------------------
   Component
------------------------------------ */
const IdeaCard = ({ idea, showActions = false }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isVerifiedUser = user && user.emailVerified;
  const [saved, setSaved] = useState(false);
  const canUseFirestore = !loading && user && !user.isBanned;
  const isOwner = user && idea.userId === user.uid;
  const isProtected = idea.visibility === "protected";
  const [hasAccess, setHasAccess] = useState(false);
const previewText =
  idea.description?.length > 120
    ? idea.description.slice(0, 120) + "..."
    : idea.description;

  /* ------------------------------------
     Check if idea is saved
  ------------------------------------ */
  useEffect(() => {
    if (!canUseFirestore) return;

    const checkSaved = async () => {
  if (!canUseFirestore) return;

  try {
    const ref = doc(db, "users", user.uid, "savedIdeas", idea.id);
    const snap = await getDoc(ref);
    setSaved(snap.exists());
  } catch (err) {
    // 🔇 silently ignore permission errors
    if (err.code !== "permission-denied") {
      console.error("checkSaved failed:", err);
    }
    setSaved(false);
  }
};
    checkSaved();
  }, [user, idea.id]);

  // 🔐 Check if user has approved access
useEffect(() => {
  if (!user || !isProtected || isOwner) return;

  const checkAccess = async () => {
    try {
      const q = query(
        collection(db, "accessRequests"),
        where("ideaId", "==", idea.id),
        where("requesterId", "==", user.uid),
        where("status", "==", "approved")
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }

    } catch (err) {
      console.error("Access check failed:", err);
    }
  };

  checkAccess();

}, [user, idea.id, isProtected, isOwner]);

  /* ------------------------------------
     Toggle Save / Unsave
  ------------------------------------ */
  const toggleSave = async (e) => {
    e.stopPropagation();

    if (!user.emailVerified) {
  toast.error("Verify your email to save ideas");
  return;
}

    if (!canUseFirestore) {
    toast.error("Your account is banned");
    return;
  }

    if (!user) {
      toast.error("Please login to save ideas");
      router.push("/login");
      return;
    }

    if (loading) return;

    try {
      const ref = doc(db, "users", user.uid, "savedIdeas", idea.id);

      if (saved) {
        await deleteDoc(ref);
        setSaved(false);
        toast.success("Removed from bookmarks");
      } else {
        await setDoc(ref, {
          ideaId: idea.id,
          title: idea.title,
          createdAt: new Date(),
        });
        setSaved(true);
        toast.success("Saved to bookmarks");
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  /* ------------------------------------
     Render
  ------------------------------------ */
  return (
    <article
      onClick={() => {
  if (!user) {
    toast.error("Please login to continue");
    router.push("/login");
    return;
  }

  if (!user.emailVerified) {
    toast.error("Verify your email to access idea details");
    return;
  }
  if (isProtected && !isOwner && !hasAccess) {
  toast.error("You don't have access to this idea");
  return;
}

router.push(`/ideas/${idea.id}`);
}}
      className="relative border rounded-xl bg-white p-5 cursor-pointer hover:shadow-md transition"
    >
      {/* Bookmark (Only for verified non-owners) */}
{user && user.emailVerified && !isOwner && (
  <button
    onClick={toggleSave}
    className="absolute top-4 right-4"
    title={saved ? "Unsave" : "Save"}
  >
    {saved ? (
      <BookmarkSolid className="w-6 h-6 text-sky-500" />
    ) : (
      <BookmarkOutline className="w-6 h-6 text-sky-400 hover:text-sky-500" />
    )}
  </button>
)}

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">
        {idea.title}
      </h3>
      {isProtected && !isOwner && !hasAccess && (
  <div className="flex justify-center mt-2">
    <span className="px-3 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-semibold tracking-wide">
      🔒 Protected Idea
    </span>
  </div>
)}

      {/* Description (PASSAGE STYLE) */}
      <p className="text-gray-700 mb-4 leading-relaxed text-justify w-full">
  {isProtected && !isOwner && !hasAccess
    ? previewText + " ..."
    : idea.description}
</p>
      {/* Category & Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {idea.category && (
          <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
            {idea.category}
          </span>
        )}

        {idea.tags?.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 text-xs rounded-full bg-sky-50 text-sky-700"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2">
        {/* Author */}
        <p
          onClick={(e) => {
  e.stopPropagation();

  if (!user) {
    toast.error("Please login to view profiles");
    router.push("/login");
    return;
  }

  if (!user.emailVerified) {
    toast.error("Verify your email to view user profiles");
    return;
  }

  router.push(`/user/${idea.userId}`);
}}
          className="text-sm text-gray-600 cursor-pointer"
        >
          Posted by{" "}
          <span className="text-sky-600 hover:underline font-medium">
            {idea.userEmail}
          </span>
        </p>

        {/* Date */}
        <p className="text-xs text-gray-500">
          Posted on {formatDate(idea.createdAt)}
        </p>

        {/* Owner Actions */}
        {isOwner && showActions && (
          <div className="flex gap-3 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post-idea?edit=true&id=${idea.id}`);
              }}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!confirm("Delete this idea?")) return;
                await deleteDoc(doc(db, "ideas", idea.id));
                toast.success("Idea deleted");
                window.location.reload();
              }}
              className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
        {isProtected && !isOwner &&  !hasAccess && (
  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
    <button
      onClick={async (e) => {
  e.stopPropagation();

  // 1️⃣ Not logged in
  if (!user) {
    toast.error("Please login to request access");
    return;
  }

  // 2️⃣ Email not verified
  if (!user.emailVerified) {
    toast.error("Please verify your email before requesting access");
    return;
  }

  try {
    await requestIdeaAccess(idea, user);
    toast.success("Access request sent successfully");
  } catch (err) {
    console.error(err);
    toast.error(
      err.message === "Request already sent"
        ? "You already requested access"
        : "Failed to send request"
    );
  }
}}
      className="
  px-4 py-1.5
  text-sm font-medium
  rounded-md
  bg-gradient-to-r from-blue-600 to-indigo-600
  text-white
  hover:from-blue-700 hover:to-indigo-700
  active:scale-95
  transition-all duration-200
  shadow-md hover:shadow-lg
"
    >
    <span className="flex items-center gap-2">
  <ShieldCheckIcon className="w-4 h-4" />
  Request Access
</span>
    </button>
  </div>
)}
      </div>
    </article>
  );
};

export default IdeaCard;