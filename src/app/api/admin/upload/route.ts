import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { uploadSiteImage } from "@/lib/db";

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
  if (!hasPermission(user, "manage_content")) {
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
        { error: "Use a JPG, PNG, WEBP, or GIF image." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is too large (max about 4.5 MB)." },
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
