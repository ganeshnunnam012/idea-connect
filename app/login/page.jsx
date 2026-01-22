"use client";

import { useAuth } from "@/lib/auth";
import LoginForm from "@/components/Auth/LoginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(!loading && user) {
      router.replace("/home");
    }
  }, [user, loading]);

  if (loading) {
    return  (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  } // or loader

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">
            Idea Connect 💡
        </h1>
        <p className="text-gray-600 text-center mb-8 max-w-md">
            A platform to share ideas, discover gaps, and connect with people
        </p>
        <LoginForm />
    </div>
  );
}
