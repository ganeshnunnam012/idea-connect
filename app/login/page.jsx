"use client";

import { useAuth } from "@/lib/auth";
import LoginForm from "@/components/Auth/LoginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/home");
  }, [loading, user]);

  // 🔒 HARD GUARD — stops flicker completely
  if (loading || user) {
    return null;
  }
  // ✅ Only unauthenticated users reach here
  return (
    <div className="relative min-h-screen">

  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/puzzle-bg.jpg')",
    }}
  />

 {/* Centered Login Section */}
<div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">

  {/* Website Name */}
  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
    Idea Connect
  </h1>

  {/* Login Form */}
  <LoginForm />

</div>

</div>
  );
}