"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, PlusSquare, MessageCircle, User, Info } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [isMobileScreen, setIsMobileScreen] = useState(false);

useEffect(() => {
  const checkScreen = () => {
    setIsMobileScreen(window.innerWidth <= 1024);
  };

  checkScreen();
  window.addEventListener("resize", checkScreen);

  return () => window.removeEventListener("resize", checkScreen);
}, []);

 const allowedRoutes = [
  "/home",
  "/post-idea",
  "/chats",
  "/profile",
  "/about"
];

// 1️⃣ Screen check
if (!isMobileScreen) return null;

// 2️⃣ Auth check
if (!user) return null;

// 3️⃣ Route check
if (!allowedRoutes.some(route => pathname.startsWith(route))) {
    return null;
}

  const isActive = (path) => {
    if (path === "/home") return pathname === "/home";
    return pathname.startsWith(path);
  };

  const navItem = (Icon, path) => (
    <button
      onClick={() => router.push(path)}
      style={{
        flex: 1,
        background: "transparent",
        border: "none",
        color: isActive(path) ? "#2563eb" : "#aaa",
transform: isActive(path) ? "scale(1.1)" : "scale(1)",
transition: "all 0.2s ease",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon size={22} />
    </button>
  );

  return (
    <div
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "rgba(17,24,39,0.98)",
backdropFilter: "blur(8px)",
boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        zIndex: 1000,
      }}
    >
      {navItem(Home, "/home")}
      {user && navItem(PlusSquare, "/post-idea")}
      {user && navItem(MessageCircle, "/chats")}
      {user ? navItem(User, "/profile") : navItem(User, "/login")}
      {navItem(Info, "/about")}
    </div>
  );
}