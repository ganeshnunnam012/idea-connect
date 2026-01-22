import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function POST(req) {
  try {
    const authHeader = req.headers?.get("authorization") || "";

    if (!authHeader.startsWith("Bearer ")) {
  return NextResponse.json(
    { error: "Invalid or missing Authorization header" },
    { status: 401 }
  );
}

const token = authHeader.replace("Bearer ", "");

let decodedToken;
try {
  decodedToken = await getAuth().verifyIdToken(token);
} catch (error) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

    const body = await req.json();
    const { action, reportId } = body;

    if (!action || !reportId) {
      return NextResponse.json(
        { error: "Missing action or reportId" },
        { status: 400 }
      );
    }

    const ref = adminDb.collection("reports").doc(reportId);

    if (action === "review") {
      await ref.update({ reviewed: true });
    }

    if (action === "delete") {
      await ref.delete();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ADMIN REPORT API ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}