"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkScreen = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  checkScreen();
  window.addEventListener("resize", checkScreen);

  return () => window.removeEventListener("resize", checkScreen);
}, []);

  useEffect(() => {
  const onScroll = () => {
    setScrolled(window.scrollY > 6);
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);

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
    <nav
  style={{
    ...styles.nav,
    ...(scrolled ? styles.navScrolled : {}),
  }}
  className="navbar-animate"
>
      <h2 style={styles.logo} onClick={() => router.push("/")}>
        Idea Connect
      </h2>

      {/* Mobile Hamburger */}
{isMobile && (
  <button
    onClick={() => setIsMobileMenuOpen(prev => !prev)}
    style={styles.hamburger}
    aria-label="Toggle menu"
  >
    ☰
  </button>
)}

      <div style={{ 
  ...styles.links, 
  ...(isMobile ? { display: "none" } : {}) 
}}>
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

      {/* Mobile Menu */}
{isMobile && isMobileMenuOpen && (
  <div style={styles.mobileMenu}>
    <button onClick={() => { router.push("/home"); setIsMobileMenuOpen(false); }}>
      Home
    </button>

    {user && (
      <button onClick={() => { router.push("/post-idea"); setIsMobileMenuOpen(false); }}>
        Post Idea
      </button>
    )}

    {user ? (
      <>
        <button onClick={() => { router.push("/profile"); setIsMobileMenuOpen(false); }}>
          Profile
        </button>
        <button onClick={() => { router.push("/chats"); setIsMobileMenuOpen(false); }}>
          Chats
        </button>
        <button onClick={handleLogout}>
          Logout
        </button>
      </>
    ) : (
      <button onClick={() => { router.push("/login"); setIsMobileMenuOpen(false); }}>
        Login
      </button>
    )}

    <button onClick={() => { router.push("/about"); setIsMobileMenuOpen(false); }}>
      About
    </button>
  </div>
)}
    </nav>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  nav: {
  position: "sticky",
  top: 0,
  zIndex: 50,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 32px",
  background:
    "linear-gradient(135deg, rgba(17,24,39,0.98), rgba(30,41,59,0.95))",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(6px)",
},
navScrolled: {
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
},
  logo: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "20px",
    cursor: "pointer",
  },
  links: {
    display: "flex",
    gap: "28px",
  },
  activeButton: {
  background: "rgba(159,231,235,0.08)",
  border: "none",
  borderBottom: "2px solid #2563eb",
  color: "#2563eb",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  padding: "6px 10px",
  transition: "all 0.25s ease",
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
  hamburger: {
  background: "transparent",
  border: "none",
  fontSize: "26px",
  color: "#ffffff",
  cursor: "pointer",
  display: "flex",
},

mobileMenu: {
  position: "absolute",
  top: "100%",
  right: "16px",
  background: "rgba(17,24,39,0.98)",
  backdropFilter: "blur(8px)",
  borderRadius: "12px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  zIndex: 100,
},
};