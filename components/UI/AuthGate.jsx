"use client";

import { useAuth } from "@/lib/auth";
import AuthTransition from "./AuthTransition";

export default function AuthGate({ children }) {
  const { loading } = useAuth();
  return children;
}