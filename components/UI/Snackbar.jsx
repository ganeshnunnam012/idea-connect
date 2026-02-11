"use client";

import { useEffect } from "react";

export default function Snackbar({
  open,
  message,
  type = "info", // success | info | warning | error
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  const typeStyles = {
    success: "bg-green-600",
    info: "bg-blue-600",
    warning: "bg-amber-600",
    error: "bg-red-600",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm
        ${typeStyles[type]}`}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}