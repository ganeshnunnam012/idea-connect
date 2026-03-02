"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";


const styles = {
  container: {
    height: "100vh",
    background: "#0f0f0f",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  content: {
    textAlign: "center",
    maxWidth: "600px",
    animation: "fadeUp 1.2s ease",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  tagline: {
    fontSize: "1.2rem",
    marginBottom: "20px",
    color: "#aaa",
  },
  description: {
    fontSize: "1rem",
    marginBottom: "30px",
    lineHeight: "1.6",
    color: "#ccc",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },
  primaryBtn: {
    padding: "12px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  secondaryBtn: {
    padding: "12px 24px",
    background: "transparent",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [warning, setWarning] = useState("");

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>IdeaConnect</h1>

        <p style={styles.tagline}>
          Turn real-world problems into powerful ideas
        </p>

        <p style={styles.description}>
          Discover, share, and collaborate on ideas that solve everyday
          challenges across education, traffic, startups, health, and more.
        </p>
        {warning && (
  <div
    style={{
      border: "1px solid #ffcc15",
      backgroundColor: "#fff8e5",
      color: "#92400e",
      padding: "12px 14px",
      borderRadius: "8px",
      fontSize: "14px",
      marginBottom: "16px",
    }}
  >
    ⚠️ {warning}
  </div>
)}
        <div style={styles.buttons}>
          <button
            style={styles.primaryBtn}
            onClick={() => {
  if (user) {
    router.push("/home"); // or /profile
  } else {
    router.push("/login");
  }
}}
          >
            Login / Sign Up
          </button>

          <button
  style={styles.secondaryBtn}
  onClick={() => {
  if (user) {
    setWarning(
      "You are already logged in with an account. Please log out to continue as guest."
    );
    return;
  }

  localStorage.setItem("guestUser", "true");
  localStorage.setItem("guestName", "Guest User");
  router.push("/home");
}}
>
  Continue as Guest
</button>
        </div>
      </div>
    </div>
  );
}