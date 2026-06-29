import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, UPLOAD_BUCKET, ensureUploadBucket } from "@/lib/supabase";

export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// Uploads are stored in Supabase Storage (public bucket) so they persist across
// deploys and work on any host. Returns the public URL saved on the claim.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP or PDF files are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (max 8 MB)." }, { status: 400 });
  }

  try {
    await ensureUploadBucket();

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
    const objectPath = `receipts/${randomUUID()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(UPLOAD_BUCKET)
      .upload(objectPath, bytes, { contentType: file.type, upsert: false });
    if (error) throw error;

    const { data } = supabaseAdmin.storage.from(UPLOAD_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
