"use client";
import { useEffect } from "react";

export default function BootSplashRemover() {
  useEffect(() => {
    const splash = document.getElementById("boot-splash");
    if (splash) {
      splash.classList.add("boot-hide");
    }
  }, []);

  return null;
}