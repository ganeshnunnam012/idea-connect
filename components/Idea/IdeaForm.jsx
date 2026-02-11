"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createIdea, updateIdea } from "@/lib/db";
import toast from "react-hot-toast";

export default function IdeaForm({
  user,
  isEdit = false,
  initialData = null,
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  // Tip visibility
  const [showDescriptionTip, setShowDescriptionTip] = useState(false);

  // Prefill in edit mode
  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "");
      setTags(initialData.tags?.join(", ") || "");
    }
  }, [isEdit, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
  toast.error("Please login to continue");
  return;
}

if (!user.emailVerified) {
  toast.error("Please verify your email to post ideas");
  return;
}

    if (!title || !description) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        category: category.toLowerCase(),
        tags: tags.split(",").map((t) => t.trim().toLowerCase()),
        userId: user.uid,
        userEmail: user.email,
        createdAt:
          isEdit && initialData?.createdAt
            ? initialData.createdAt
            : new Date(),
      };

      if (isEdit && initialData?.id) {
        await updateIdea(initialData.id, payload);
        toast.success("Idea updated successfully");
      } else {
        await createIdea(payload);
        toast.success("Idea posted successfully");
      }

      router.push("/home");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save idea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4">
      {/* WHITE CARD */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Title */}
          <h2 className="text-xl font-semibold text-gray-900">
            Share an Idea
          </h2>

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-md
              border border-gray-300
              bg-white
              text-gray-900
              placeholder-gray-400
              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/40"
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setShowDescriptionTip(true)}
            onBlur={() => setShowDescriptionTip(false)}
            className="w-full px-4 py-2.5 rounded-md
              border border-gray-300
              bg-white
              text-gray-900
              placeholder-gray-400
              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/40"
          />

          {/* Tip */}
          {showDescriptionTip && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              ⚠️ <strong>Tip:</strong> Describe your idea clearly and concisely.
              Focus on the core concept rather than long explanations — clarity
              helps others understand your idea better.
            </div>
          )}

          {/* Category */}
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-md
              border border-gray-300
              bg-white
              text-gray-900
              placeholder-gray-400
              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/40"
          />

          {/* Applications */}
          <input
            type="text"
            placeholder="Applications (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2.5 rounded-md
              border border-gray-300
              bg-white
              text-gray-900
              placeholder-gray-400
              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/40"
          />

          {/* Submit */}
          <button
  type="submit"
  disabled={loading || !user?.emailVerified}
  className={`mt-4 inline-flex items-center justify-center
    rounded-md px-6 py-2.5 font-medium text-white transition-all
    ${
      loading || !user?.emailVerified
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
>
  {loading
    ? "Saving..."
    : !user?.emailVerified
    ? "Verify Email to Post"
    : isEdit
    ? "Update Idea"
    : "Post Idea"}
</button>
{!user?.emailVerified && (
  <p className="mt-2 text-sm text-amber-600 text-center">
    Please verify your email to post or update ideas.
  </p>
)}
        </form>
      </div>
    </div>
  );
}