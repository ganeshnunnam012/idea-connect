"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 🔹 Active route checker
  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  if (loading) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo} onClick={() => router.push("/")}>
        Idea Connect
      </h2>

      <div style={styles.links}>
        {/* HOME */}
        <button
          style={isActive("/home") ? styles.activeButton : styles.button}
          onClick={() => router.push("/home")}
        >
          Home
        </button>

        {/* POST IDEA */}
        {user && (
          <button
            style={isActive("/post-idea") ? styles.activeButton : styles.button}
            onClick={() => router.push("/post-idea")}
          >
            Post Idea
          </button>
        )}

        {/* PROFILE & CHATS */}
        {user ? (
          <>
            <button
              style={isActive("/profile") ? styles.activeButton : styles.button}
              onClick={() => router.push("/profile")}
            >
              Profile
            </button>

            <button
              style={isActive("/chats") ? styles.activeButton : styles.button}
              onClick={() => router.push("/chats")}
            >
              Chats
            </button>
          </>
        ) : (
          <button
            style={isActive("/login") ? styles.activeButton : styles.button}
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        )}

        {/* ABOUT */}
        <button
          style={isActive("/about") ? styles.activeButton : styles.button}
          onClick={() => router.push("/about")}
        >
          About
        </button>
      </div>
    </nav>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#111827",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logo: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "20px",
    cursor: "pointer",
  },
  links: {
    display: "flex",
    gap: "12px",
  },
  button: {
    background: "transparent",
    border: "none",
    color: "#e5e7eb",
    fontSize: "14px",
    cursor: "pointer",
    padding: "6px 10px",
  },
  activeButton: {
    background: "transparent",
    borderBottom: "2px solid #2563eb",
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    padding: "6px 10px",
  },
};