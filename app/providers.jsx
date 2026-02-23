"use client";

import { AuthProvider, useAuth } from "@/lib/auth";
import MobileBottomNav from "@/components/Layout/MobileBottomNav";
import NavbarWrapper from "@/components/NavbarWrapper";
import { SidebarProvider } from "@/components/Layout/SidebarContext";
import BootSplashRemover from "@/components/BootSplashRemover";
import { Toaster } from "react-hot-toast";

function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Authenticating...
      </div>
    );
  }

  return children;
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <SidebarProvider>   {/* ✅ NOW IT WRAPS EVERYTHING */}

        <BootSplashRemover />

        <Toaster
          position="top-center"
          toastOptions={{ duration: 3000 }}
        />

        <NavbarWrapper />

        <AuthGate>
          {children}
        </AuthGate>

        <MobileBottomNav />

      </SidebarProvider>
    </AuthProvider>
  );
}