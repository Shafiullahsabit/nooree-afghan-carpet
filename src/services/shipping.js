import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getShippingRates() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "unconfigured", rates: [] };

  const { data, error } = await supabase
    .from("shipping_rates")
    .select("id, country_code, rate_afn, is_active")
    .eq("is_active", true)
    .order("country_code");

  if (error) {
    console.error("Could not load shipping rates:", error.message);
    return { status: "error", rates: [] };
  }

  return { status: "ready", rates: data ?? [] };
}

export async function checkCodEligibility({ countryCode, region, city, postalCode }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "unconfigured", eligible: false };

  const { data, error } = await supabase.rpc("is_cod_available", {
    p_country_code: countryCode,
    p_region: region,
    p_city: city,
    p_postal_code: postalCode || null,
  });

  if (error) {
    console.error("Could not verify COD eligibility:", error.message);
    return { status: "error", eligible: false };
  }

  return { status: "ready", eligible: data === true };
}
