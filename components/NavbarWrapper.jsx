"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Layout/Navbar";
import { useEffect, useState } from "react";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { user, guestMode, loading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
  if (!loading) {
    setShow(true);
  }
}, [loading]);

  if(loading) return null;
  
  // ❌ No Navbar on login page
  if (pathname === "/login") return null;

  // ❌ No Navbar if not logged in & not guest
  if (!user && !guestMode) return null;

  if (pathname == "/") return null;

  return (
  <div
    style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-6px)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
    }}
  >
    <Navbar />
  </div>
);
}