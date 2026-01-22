 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}) {
  const { user, loading, isAdmin, isBanned } = useAuth();
  const router = useRouter();

  // ✅ Guest detection (unchanged logic)
  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guestUser") === "true";

  // ✅ Redirect ONLY after auth is fully resolved
  useEffect(() => {
    if (loading) return; // 🚫 DO NOTHING while loading

    if (!user && !isGuest) {
      router.replace("/login");
    }
  }, [loading, user, isGuest, router]);

  // 🚫 Block rendering while Firebase restores auth
  if (loading) {
    return null;
  }

  // ❌ Not logged in AND not guest
  if (!user && !isGuest) {
    return null;
  }

  // 🚫 BANNED USER (global block)
  if (isBanned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          Account Banned
        </h2>
        <p className="text-gray-600 max-w-md">
          Your account has been banned due to policy violations.
          Please contact support if you believe this is a mistake.
        </p>
      </div>
    );
  }
  // 🚫 ADMIN ONLY ROUTE
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-3">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You are not authorized to view this page.
        </p>
      </div>
    );
  }

  // ✅ Allowed
  return children;
}
