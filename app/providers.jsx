"use client";

import { AuthProvider } from "@/lib/auth";
import NavbarWrapper from "@/components/NavbarWrapper";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <NavbarWrapper />
      {children}
    </AuthProvider>
  );
}