"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { signupUser, loginUser } from "@/lib/auth";
import { resendVerificationEmail } from "@/lib/auth";

const styles = {
  card: {
  width: "100%",
  maxWidth: "460px",
  padding: "36px 40px",
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
},
  title: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "16px",
    textAlign: "center",
    color: "#111",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    color: "#000",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
  },
  primaryButton: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1032caff",
    color: "#fff",
    cursor: "pointer",
  },
  googleButton: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#4285F4",
    color: "#fff",
    cursor: "pointer",
  },
  divider: {
    textAlign: "center",
    margin: "12px 0",
    color: "#555",
  },
  switchText: {
    marginTop: "12px",
    textAlign: "center",
    fontSize: "14px",
    color: "#222",
  },
  link: {
    color: "#0070f3",
    cursor: "pointer",
  },
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // ✅ NEW: warning state (focus-based)
  const [showLoginTip, setShowLoginTip] = useState(false);

  const provider = new GoogleAuthProvider();
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleEmailAuth = async () => {
  setError("");
  setLoading(true);

  try {
    if (isSignup) {
      const result = await signupUser(email, password);
      setError(result.message);
    } else {
      await loginUser(email, password);
    }
  } catch (err) {
    switch (err.code) {
      case "auth/email-not-verified":
        setError("Please verify your email before logging in.");
        break;
      case "auth/email-already-in-use":
        setError("This email is already registered. Please login instead.");
        break;
      case "auth/invalid-email":
        setError("Please enter a valid email address.");
        break;
      case "auth/invalid-credential":
        setError("Incorrect password. Please try again.");
        break;
      default:
        setError(
          isSignup
            ? "Unable to create account. Please try again."
            : "Unable to login. Please try again."
        );
    }
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch {
      setError("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
  try {
    setResendLoading(true);
    setError("");

    const result = await resendVerificationEmail();
    setError(result.message);

    // Start 30s cooldown
    setCooldown(30);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  } catch {
    setError("Unable to resend verification email. Try again later.");
  } finally {
    setResendLoading(false);
  }
};

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset link sent to your email.");
    } catch {
      setError("Unable to send reset email. Try again later.");
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>{isSignup ? "Create Account" : "Login"}</h2>

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => setShowLoginTip(true)}
        style={styles.input}
      />

      {/* Password */}
      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setShowLoginTip(true)}
          style={{ ...styles.input, paddingRight: "36px" }}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "#555",
          }}
        >
          {showPassword ? "😣" : "😳"}
        </span>
      </div>

      {/* ✅ WARNING MESSAGE (NO UX BREAK) */}
      {/* ⚠️ WARNING MESSAGE (Same UX as Post Idea) */}
{showLoginTip && (
  <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 mb-2">
    ⚠️ <strong>Tip:</strong> Please enter a valid email and password. We may use
    your email for verification and important communication.
  </div>
)}

{/* ❌ ERROR MESSAGE (Same layout, red variant) */}
{/* ❌ ERROR MESSAGE (plain text, no box) */}
{error && (
  <p className="text-red-600 text-sm mb-2">
    {error}
  </p>
)}

{/* EMAIL VERIFICATION HELP */}
{error?.includes("verify") && (
  <div style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
    <p>Didn’t receive the verification email?</p>

    <button
      onClick={handleResendVerification}
      disabled={resendLoading || cooldown > 0}
      style={{
        background: "none",
        border: "none",
        color: "#0070f3",
        cursor: resendLoading || cooldown > 0 ? "not-allowed" : "pointer",
        padding: 0
      }}
    >
      {resendLoading
        ? "Sending..."
        : cooldown > 0
        ? `Resend available in ${cooldown}s`
        : "Resend verification email"}
    </button>

    <p style={{ marginTop: "6px", fontSize: "12px", color: "#777" }}>
      Check Spam, Promotions, or All Mail folders.
    </p>
  </div>
)}

      {/* Login / Signup */}
      <button
        onClick={handleEmailAuth}
        disabled={loading}
        style={styles.primaryButton}
      >
        {loading ? "Processing..." : isSignup ? "Sign up" : "Login"}
      </button>

      {!isSignup && (
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm"
          style={{ marginTop: "6px", color: "#0070f3", textAlign: "right" }}
        >
          Forgot password?
        </button>
      )}

      <div style={styles.divider}>OR</div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        style={styles.googleButton}
      >
        Login with Google
      </button>

      <p style={styles.switchText}>
        {isSignup ? "Already have an account?" : "No account?"}{" "}
        <span
          style={styles.link}
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}
        >
          {isSignup ? "Login" : "Sign up"}
        </span>
      </p>
    </div>
  );
}