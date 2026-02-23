"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Layout/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Pages where navbar should NOT appear
  const hideNavbarRoutes = ["/", "/login", "/signup"];

  // If loading auth → don't render anything
  if (loading) return null;

  // If route is landing/login/signup → hide
  if (hideNavbarRoutes.includes(pathname)) return null;

  // If user not logged in → hide
  if (!user) return null;

  // Otherwise show navbar
  return <Navbar />;
}