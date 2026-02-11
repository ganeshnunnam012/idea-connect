"use client";

import { AuthProvider, useAuth } from "@/lib/auth";
import NavbarWrapper from "@/components/NavbarWrapper";
import BootSplashRemover from "@/components/BootSplashRemover";
import { Toaster } from "react-hot-toast";

function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Authenticating…
    </div>
  );
}

  return children;
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <BootSplashRemover />

      {/* ✅ TOAST CONTAINER (GLOBAL & ALWAYS MOUNTED) */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
      <AuthGate>
        <>
          <NavbarWrapper />
          {children}
        </>
      </AuthGate>
    </AuthProvider>
  );
}