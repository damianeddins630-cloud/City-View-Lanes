import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadSiteImage } from "@/lib/db";
import { canUploadSiteImages } from "@/lib/permissions";

const MAX_BYTES = 4_500_000;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!canUploadSiteImages(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, or WEBP image (real photos only)." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is too large (max about 4.5 MB). Compress and retry." },
        { status: 400 },
      );
    }

    const uploaded = await uploadSiteImage(file, file.name || "photo.jpg", file.type);
    return NextResponse.json({
      url: uploaded.url,
      mode: uploaded.mode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
