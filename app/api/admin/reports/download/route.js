import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const fileName = searchParams.get("name") || "file";

    if (!fileUrl) {
      return new NextResponse("Missing file URL", { status: 400 });
    }

    // Fetch file from Firebase
    const response = await fetch(fileUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Firebase fetch failed:", response.status);
      return new NextResponse("Failed to fetch file", { status: 500 });
    }

    // Convert to Blob (MOST IMPORTANT FIX)
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/octet-stream",

        // Forces browser download
        "Content-Disposition": `attachment; filename="${fileName}"`,

        // Prevents corruption
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Download error", { status: 500 });
  }
}