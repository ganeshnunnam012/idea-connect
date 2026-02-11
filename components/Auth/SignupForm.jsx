"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSnackbar } from "@/components/Snackbar";

export default function SignupForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Create Auth user
      const userCredential = await signupUser(email, password);
      const user = userCredential.user;

      // after Firestore setDoc(...)
showSnackbar({
  message: "Verification email sent. Please check your INBOX or SPAM folder.",
  type: "success",
});

      // ✅ Redirect after successful signup
      router.push("/home");

    } catch (err) {
      console.error("Signup error:", err);

      // ✅ Friendly error messages
      switch (err.code) {
        case "auth/email-already-in-use":
          setError(
            "This emial is already registered. Please login instead or Choose another email."
          );
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Password should be at least 6 characters long.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;

        case "auth/internal-error":
          setError("Something went wrong. Please try again.");
          break;

        default:
          setError("Unable to create account. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="auth-form">
      <h2>Create Account</h2>

      {error && <p className="error">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}