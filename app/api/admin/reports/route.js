import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function POST(req) {
  try {
    // 1️⃣ SAFETY: req & headers always checked
    if (!req || !req.headers) {
      return NextResponse.json(
        { error: "Invalid request context" },
        { status: 400 }
      );
    }

    // 2️⃣ Read Authorization header safely
    const authHeader = req.headers.get("authorization");

    // 3️⃣ HARD GUARD — prevents build-time crash
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Invalid or missing Authorization header" },
        { status: 401 }
      );
    }

    // 4️⃣ Safe token extraction (NO crash possible now)
    const token = authHeader.slice(7);

    // 5️⃣ Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 6️⃣ Parse body safely
    const body = await req.json();
    const { action, reportId } = body || {};

    if (!action || !reportId) {
      return NextResponse.json(
        { error: "Missing action or reportId" },
        { status: 400 }
      );
    }

    // 7️⃣ Firestore reference
    const ref = adminDb.collection("reports").doc(reportId);

    // 8️⃣ Perform action
    if (action === "review") {
      await ref.update({ reviewed: true });
    }

    if (action === "delete") {
      await ref.delete();
    }

    // 9️⃣ Success response
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("ADMIN REPORT API ERROR:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}