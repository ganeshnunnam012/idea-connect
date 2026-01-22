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
  GoogleAuthProvider,
  signInWithPopup,
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

/* =========================================================
   AUTH CONTEXT
========================================================= */

const AuthContext = createContext(null);

/* =========================================================
   AUTH PROVIDER
========================================================= */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // FIRST RESOLUTION (important)
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      // BLOCK UNVERIFIED EMAIL USERS
      if (!currentUser.emailVerified) {
        await signOut(auth);
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);

      const emailName =
        currentUser.email
          ?.split("@")[0]
          ?.replace(/[^a-zA-Z]/g, "")
          ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "User";

      // CREATE USER DOC IF MISSING
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || emailName,
          role: "user",
          isAdmin: false,
          isBanned: false,
          createdAt: new Date(),
        });

        setUserData({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || emailName,
          role: "user",
          isAdmin: false,
          isBanned: false,
        });

        setLoading(false);
        return;
      }

      // NORMALIZE LEGACY USERS
      const data = snap.data();

      if (!data.displayName || data.displayName === "Anonymous") {
        await setDoc(
          userRef,
          { displayName: currentUser.displayName || emailName },
          { merge: true }
        );
        data.displayName = currentUser.displayName || emailName;
      }

      setUserData({
        uid: currentUser.uid,
        ...data,
        isAdmin: data.role === "admin",
        isBanned: data.isBanned === true,
      });

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

/* =========================================================
   AUTH HOOK
========================================================= */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

/* =========================================================
   AUTH ACTION HELPERS
========================================================= */

/* ===========================
   SIGN UP WITH EMAIL
   (EMAIL VERIFICATION FIXED)
=========================== */

export async function signupUser(email, password) {
  try {
    const userCredential =
      await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    // SEND EMAIL VERIFICATION
    await sendEmailVerification(user);

    // IMPORTANT FIX: allow Firebase to complete email dispatch
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // SIGN OUT AFTER EMAIL IS SENT
    await signOut(auth);

    return {
      success: true,
      message:
        "Verification email sent. Please check your inbox and verify before logging in.",
    };
  } catch (error) {
    throw error;
  }
}

/* ===========================
   LOGIN WITH EMAIL
   (BLOCK UNVERIFIED USERS)
=========================== */

export async function loginUser(email, password) {
  try {
    const userCredential =
      await signInWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw { code: "auth/email-not-verified" };
    }

    return userCredential;
  } catch (error) {
    throw error;
  }
}

/* ===========================
   LOGIN WITH GOOGLE
=========================== */

export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    throw error;
  }
}

/* ===========================
   LOGOUT
=========================== */

export async function logoutUser() {
  await signOut(auth);
}

/* ===========================
   FORGOT PASSWORD
=========================== */

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
}

// RESEND EMAIL VERIFICATION
export async function resendVerificationEmail() {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "Please login to resend the verification email."
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: "Your email is already verified."
      };
    }

    await sendEmailVerification(user);

    return {
      success: true,
      message: "Verification email resent. Please check your inbox or spam folder."
    };
  } catch (error) {
    console.error("Resend verification failed:", error);
    throw error;
  }
}