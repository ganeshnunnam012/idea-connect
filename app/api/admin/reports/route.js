import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function POST(req) {
  /**
   * 🔐 Build-time & runtime safety guard
   * Prevents Vercel / Next.js build from crashing
   */
  if (!req || !req.headers || typeof req.headers.get !== "function") {
    return NextResponse.json(
      { error: "Invalid request context" },
      { status: 400 }
    );
  }

  try {
    /* ---------------- AUTH HEADER ---------------- */
    const authHeader = req.headers.get("authorization");

    if (!authHeader || typeof authHeader !== "string") {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Invalid Authorization format" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    /* ---------------- VERIFY TOKEN ---------------- */
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ---------------- REQUEST BODY ---------------- */
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { action, reportId } = body;

    if (!action || !reportId) {
      return NextResponse.json(
        { error: "Missing action or reportId" },
        { status: 400 }
      );
    }

    /* ---------------- FIRESTORE ---------------- */
    const ref = adminDb.collection("reports").doc(reportId);

    if (action === "review") {
      await ref.update({ reviewed: true });
    } else if (action === "delete") {
      await ref.delete();
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    /* ---------------- SUCCESS ---------------- */
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ADMIN REPORT API ERROR:", err);

    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}