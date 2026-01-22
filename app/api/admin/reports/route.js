import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
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