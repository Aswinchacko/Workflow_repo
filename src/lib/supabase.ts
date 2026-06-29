import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. Never import this in
// client components — the service-role key must stay on the server.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const UPLOAD_BUCKET = "uploads";

// Lazily ensure the public storage bucket exists (created once per server
// process). Best-effort: resets on failure so it can retry on the next upload.
let bucketReady: Promise<void> | null = null;

export function ensureUploadBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data } = await supabaseAdmin.storage.getBucket(UPLOAD_BUCKET);
      if (!data) {
        const { error } = await supabaseAdmin.storage.createBucket(UPLOAD_BUCKET, {
          public: true,
          fileSizeLimit: "8MB",
        });
        // Ignore "already exists" races; surface anything else.
        if (error && !/exist/i.test(error.message)) throw error;
      }
    })().catch((e) => {
      bucketReady = null;
      throw e;
    });
  }
  return bucketReady;
}
