"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Layout/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { user, guestMode } = useAuth();

  // ❌ No Navbar on login page
  if (pathname === "/login") return null;

  // ❌ No Navbar if not logged in & not guest
  if (!user && !guestMode) return null;

  if (pathname == "/") return null;

  return <Navbar />;
}