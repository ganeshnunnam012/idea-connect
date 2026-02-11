"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { serverTimestamp } from "firebase/firestore";
import { setupPresence } from "./presence";
import { useRef } from "react";


/* =====================================================
   AUTH CONTEXT
===================================================== */

const AuthContext = createContext(null);

/* =====================================================
   AUTH PROVIDER
===================================================== */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasResolvedOnce = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!hasResolvedOnce.current) {
    hasResolvedOnce.current = true;
  }

  // Always set user (or null)
  setUser(currentUser ?? null);

  // Always stop loading
  setLoading(false);

  if (!currentUser) return;

  // Optional: presence setup (safe)
  if (currentUser) {
    setupPresence(currentUser.uid);
  }
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
      const emailName =
        currentUser.email
          ?.split("@")[0]
          ?.replace(/[^a-zA-Z]/g, "")
          ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "User";

      // CREATE USER DOC IF MISSING
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || emailName,
          role: "user",
          isAdmin: false,
          isBanned: false,
          createdAt: serverTimestamp(),
        });
      }

      // 🔑 ALWAYS FETCH FRESH DATA (SINGLE SOURCE OF TRUTH)
      const freshSnap = await getDoc(userRef);
      const data = freshSnap.data();

      // NORMALIZE LEGACY USERS
      if (!data.displayName || data.displayName === "Anonymous") {
        const normalizedName =
          currentUser.displayName || emailName;

        await setDoc(
          userRef,
          { displayName: normalizedName },
          { merge: true }
        );

        // keep local state in sync
        data.displayName = normalizedName;
      }

      // FINAL USER STATE
      setUserData({
        uid: currentUser.uid,
        ...data,
        isAdmin: data.role === "admin",
        isBanned: data.isBanned === true,
      });
      hasResolvedOnce.current = true;
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isAdmin: userData?.role === "admin",
        isBanned: userData?.isBanned === true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =====================================================
   AUTH HOOK
===================================================== */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

/* =====================================================
   AUTH ACTION HELPERS
===================================================== */

/* =========================
   SIGN UP WITH EMAIL
   (EMAIL VERIFICATION FIXED)
========================= */

export async function signupUser(email, password) {
  try {
    const userCredential =
      await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    // SEND EMAIL VERIFICATION
    await sendEmailVerification(user);

    // IMPORTANT FIX: allow Firebase to complete email dispatch
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return userCredential;
  } catch (error) {
    throw error;
  }
}

/* =========================
   LOGIN WITH EMAIL
   (BLOCK UNVERIFIED USERS)
========================= */

export async function loginUser(email, password) {
  const userCredential =
    await signInWithEmailAndPassword(auth, email, password);

  // ✅ STEP 3: set session cookie
  document.cookie = "__session=true; path=/";

  return userCredential;
}

/* =========================
   LOGIN WITH GOOGLE
========================= */

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);

  // OPTIONAL: return user if your UI needs it
  return result.user;
}


/* =========================
   LOGOUT
========================= */

export async function logoutUser() {
  await signOut(auth);

  // ✅ STEP 3: remove session cookie
  document.cookie = "__session=; path=/; max-age=0";
}

/* =========================
   FORGOT PASSWORD
========================= */

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
}

/* =========================
   RESEND EMAIL VERIFICATION
========================= */

export async function resendVerificationEmail() {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "Please login to resend the verification email.",
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: "Your email is already verified.",
      };
    }

    await sendEmailVerification(user);

    return {
      success: true,
      message:
        "Verification email resent. Please check your inbox or spam folder.",
    };
  } catch (error) {
    console.error("Resend verification failed:", error);
    throw error;
  }
}