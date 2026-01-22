"use client";

import { useState, useRef } from "react";
import {
  XMarkIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { storage } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/db";
import toast from "react-hot-toast";

export default function ProfileHeader({
  userData,
  isOwner,
  onNameClick,
  onReport,
  onUserUpdate, // optional
}) {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ===== Username edit ===== */
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(
    userData?.displayName || ""
  );

  const fileInputRef = useRef(null);
  const hasImage = Boolean(userData?.photoURL);

  /* =========================
     IMAGE UPLOAD
  ========================== */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userData?.uid) return;

    try {
      setUploading(true);

      const imageRef = ref(
        storage,
        `profile-images/${userData.uid}/profile.jpg`
      );

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      await updateUserProfile(userData.uid, {
        photoURL: downloadURL,
      });

      setPreviewImage(downloadURL);
      onUserUpdate?.({ photoURL: downloadURL });

      toast.success("Profile picture updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* =========================
     IMAGE DELETE (SAFE)
  ========================== */
  const handleDeleteImage = async () => {
    if (!userData?.uid) return;

    try {
      setUploading(true);

      const imageRef = ref(
        storage,
        `profile-images/${userData.uid}/profile.jpg`
      );

      try {
        await deleteObject(imageRef);
      } catch (err) {
        if (err.code !== "storage/object-not-found") throw err;
      }

      await updateUserProfile(userData.uid, {
        photoURL: null,
      });

      setPreviewImage(null);
      onUserUpdate?.({ photoURL: null });

      toast.success("Profile picture removed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete profile picture");
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     USERNAME UPDATE
  ========================== */
  const saveName = async () => {
    if (!nameValue.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updateUserProfile(userData.uid, {
        displayName: nameValue.trim(),
      });

      onUserUpdate?.({ displayName: nameValue.trim() });
      toast.success("Name updated");
      setEditingName(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update name");
    }
  };

  /* =========================
     REPORT USER
  ========================== */
  const handleReportClick = () => {
    setMenuOpen(false);
    onReport?.();
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <section className="flex items-center gap-6 mb-6 relative">
      {/* AVATAR */}
      <div className="relative w-24 h-24">
        <img
          src={
            previewImage ||
            userData?.photoURL ||
            "/default-avatar.png"
          }
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border cursor-pointer"
          onClick={() =>
            setPreviewImage(
              userData?.photoURL || "/default-avatar.png"
            )
          }
        />
      </div>

      {/* USER INFO */}
      <div className="flex-1">
        {!editingName ? (
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-bold cursor-pointer hover:underline"
              onClick={onNameClick}
            >
              {userData?.displayName || "User"}
            </h1>

            {isOwner && (
              <button
                onClick={() => {
                  setNameValue(userData?.displayName || "");
                  setEditingName(true);
                }}
                className="p-1 rounded hover:bg-gray-200"
                title="Edit name"
              >
                <PencilIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") setEditingName(false);
              }}
              className="border px-2 py-1 rounded text-sm w-56"
              autoFocus
            />

            <button
              onClick={saveName}
              className="p-1 rounded bg-green-600 text-white"
            >
              <CheckIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => setEditingName(false)}
              className="p-1 rounded bg-gray-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-gray-500 text-sm">
          {userData?.email || "No email"}
        </p>

        {userData?.bio && (
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            {userData.bio}
          </p>
        )}
      </div>

      {/* NON-OWNER MENU */}
      {!isOwner && typeof onReport === "function" && userData?.role !== "admin" &&(
        <div className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
              <button
                onClick={handleReportClick}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <FlagIcon className="w-4 h-4" />
                Report user
              </button>
            </div>
          )}
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-gray-900 p-6 rounded-xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-white rounded-full p-1"
            >
              <XMarkIcon className="w-5 h-5 text-black" />
            </button>

            <img
              src={previewImage}
              alt="Preview"
              className="w-80 h-80 rounded-full object-cover border mb-6"
            />

            {isOwner && (
              <div className="flex justify-center gap-3">
                {!hasImage && (
                  <label className="px-4 py-2 bg-white text-black rounded cursor-pointer hover:bg-gray-200">
                    {uploading ? "Uploading..." : "Add"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </label>
                )}

                {hasImage && (
                  <>
                    <label className="px-4 py-2 bg-white text-black rounded cursor-pointer hover:bg-gray-200">
                      {uploading ? "Uploading..." : "Change"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                      />
                    </label>

                    <button
                      onClick={handleDeleteImage}
                      disabled={uploading}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}