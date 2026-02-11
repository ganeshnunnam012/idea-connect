 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}) {
  const { user, loading, isAdmin, isBanned } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Guest detection (unchanged logic)
  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guestUser") === "true";
  // 🚫 Block rendering while Firebase restores auth
 if (loading) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-white text-sm">
          Signing in with Google…
        </p>
      </div>
    </div>
  );
}

if (user && !user.emailVerified && !isGuest) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-bold mb-3">Verify your email</h2>
      <p className="text-gray-600 max-w-md">
        Please verify your email address to access full features.
        Check your inbox or spam folder.
      </p>
    </div>
  );
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
