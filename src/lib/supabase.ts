import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily create a server-only Supabase client. Creating it at module load would
// crash the build (Next's "collect page data" imports this with env unset),
// because supabase-js throws when the URL/key are empty. Only instantiate at
// request time. Never import this into client components.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
      );
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const UPLOAD_BUCKET = "uploads";

// Lazily ensure the public storage bucket exists (created once per server
// process). Best-effort: resets on failure so it can retry on the next upload.
let bucketReady: Promise<void> | null = null;

export function ensureUploadBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.storage.getBucket(UPLOAD_BUCKET);
      if (!data) {
        const { error } = await supabase.storage.createBucket(UPLOAD_BUCKET, {
          public: true,
          fileSizeLimit: "8MB",
        });
        if (error && !/exist/i.test(error.message)) throw error;
      }
    })().catch((e) => {
      bucketReady = null;
      throw e;
    });
  }
  return bucketReady;
}
