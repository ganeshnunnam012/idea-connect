"use client";

export default function AuthTransition() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white">
      {/* Logo / App Name */}
      <h1 className="text-3xl font-bold tracking-wide mb-4">
        Idea Connect
      </h1>

      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />

      {/* Status text */}
      <p className="mt-4 text-sm text-white/70">
        Signing you in…
      </p>
    </div>
  );
}