"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import IdeaList from "@/components/Idea/IdeaList";
import { Suspense } from "react";
import toast from "react-hot-toast";
import { resendVerificationEmail } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Layout/Sidebar";
import { useSidebar } from "@/components/Layout/SidebarContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("GENERAL");
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const handleResendVerification = async () => {
  if (resendDisabled) {
  toast.error(`Please wait ${cooldown}s before resending.`);
  return;
}

  try {
    setResendDisabled(true);
    setCooldown(60);

    const res = await resendVerificationEmail();

    if (res?.success) {
      toast.success(
        "Verification email sent again. Please check your inbox or SPAM folder."
      );

      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      toast.error(res?.message || "Unable to resend verification email.");
      setResendDisabled(false);
    }
  } catch (error) {
    if (error.code === "auth/too-many-requests") {
      toast.error("Please wait before resending the verification email.");
    } else {
      toast.error("Failed to resend verification email. Please try again later.");
    }
    setResendDisabled(false);
  }
};

useEffect(() => {
  if (!user) return;

  const interval = setInterval(async () => {
    await user.reload();
    if (user.emailVerified) {
      clearInterval(interval);
      router.refresh(); // Next.js App Router
    }
  }, 4000);

  return () => clearInterval(interval);
}, [user, router]);

if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Loading...
      </p>
    );
  }


  return (
  <ProtectedRoute>
    <div className="flex w-full h-screen overflow-hidden relative">
      {/* Mobile Sidebar */}
{isSidebarOpen && (
  <div className="fixed inset-0 z-40 md:hidden">
    
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={closeSidebar}
    />

    {/* Drawer */}
    <aside className="absolute left-0 top-0 w-64 h-full bg-white dark:bg-black p-4 overflow-y-auto shadow-lg md:hidden">
  <Sidebar
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
/>
</aside>
  </div>
)}
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:block">
  <Sidebar
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
  />
</div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
      {user && !user.emailVerified && (
  <div
    style={{
      margin: "20px auto",
      maxWidth: "900px",
      padding: "16px 20px",
      borderRadius: "8px",
      backgroundColor: "#fff8e1",
      border: "3px solid #ffb300",
      color: "#7a5a00",
      textAlign: "left",
    }}
  >
    <strong>⚠️ Email verification required</strong>
    <p style={{ marginTop: "8px", lineHeight: "1.5" }}>
      A verification email has been sent to{" "}
      <strong>{user.email}</strong>.
      <br />
      <span style={{ color: "#ff6b6b", fontWeight: "bold" }}>
        Important:
      </span>{" "}
      Please check your <strong>SPAM folder</strong> as well — verification
      emails often land there.
      <br />
      Verify your email to unlock full features like posting and interacting.
    </p>

    <button
  onClick={handleResendVerification}
  disabled={resendDisabled}
  style={{
    marginTop: "10px",
    background: "transparent",
    border: "none",
    color: resendDisabled ? "#999" : "#4ea1ff",
    cursor: resendDisabled ? "not-allowed" : "pointer",
    padding: 0,
    fontWeight: "bold",
  }}
>
  {resendDisabled
    ? `Resend available in ${cooldown}s`
    : "Resend verification email"}
</button>
  </div>
)}

<>

  <div
  className="flex-1 overflow-y-auto"
  style={{
  paddingTop: window.innerWidth <= 768 ? "20px" : "40px",
  paddingLeft: window.innerWidth <= 768 ? "20px" : "40px",
  paddingRight: window.innerWidth <= 768 ? "20px" : "40px",
  paddingBottom: "100px"
}}
>

      <div className="px-4 md:px-10 pt-6 text-center shrink-0">
        {/* Welcome / Info message */}
        {user ? (
  <p>
    Welcome back, <strong>{user.email}</strong>
  </p>
) : (
  <p>Browse ideas freely. Login to post or interact.</p>
)}
        {/* IDEAS SECTION */}
        <section className="ideas" style={{ marginTop: "30px" }}>
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
          <Suspense fallback={null}>
            {/* Idea List (Firestore-driven) */}
            <IdeaList searchQuery={searchQuery}
            user={user}
            allowEdit={false}
            selectedCategory={selectedCategory}
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
      </div>
</>
    </main>
    </div>
    </ProtectedRoute>
  );
}