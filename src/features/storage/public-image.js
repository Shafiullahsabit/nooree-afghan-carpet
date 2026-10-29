import { createClient } from "@supabase/supabase-js";

export function getProductImageUrl(storagePath) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET;

  if (!supabaseUrl || !supabaseKey || !bucket || !storagePath) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey)
    .storage.from(bucket)
    .getPublicUrl(storagePath).data.publicUrl;
}
