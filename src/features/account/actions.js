"use server";

import { redirect } from "next/navigation";
import { getSafeLocale, getTrimmed } from "@/lib/form-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { getDictionary } from "@/i18n/config";

export async function saveProfileAction(formData) {
  const locale = getSafeLocale(formData);
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/${locale}/account?result=unavailable`);

  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/${locale}/auth/sign-in`);

  const fullName = getTrimmed(formData, "full_name", 160);
  const phone = getTrimmed(formData, "phone", 40);
  const submittedLocale = String(formData.get("preferred_locale") ?? "");
  const preferredLocale = getDictionary(submittedLocale) ? submittedLocale : locale;
  if (!fullName) redirect(`/${locale}/account?result=invalid`);

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null, preferred_locale: preferredLocale })
    .eq("id", user.id);

  if (error) {
    console.error("Customer profile update failed:", error.message);
    redirect(`/${locale}/account?result=failed`);
  }

  redirect(`/${locale}/account?result=saved`);
}

export async function saveAddressAction(formData) {
  const locale = getSafeLocale(formData);
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/${locale}/account/addresses?result=unavailable`);

  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/${locale}/auth/sign-in`);

  const address = {
    profile_id: user.id,
    recipient_name: getTrimmed(formData, "recipient_name", 160),
    phone: getTrimmed(formData, "phone", 40),
    country_code: getTrimmed(formData, "country_code", 2).toUpperCase(),
    region: getTrimmed(formData, "region", 120),
    city: getTrimmed(formData, "city", 120),
    address_line1: getTrimmed(formData, "address_line1", 240),
    address_line2: getTrimmed(formData, "address_line2", 240) || null,
    postal_code: getTrimmed(formData, "postal_code", 32) || null,
    delivery_instructions: getTrimmed(formData, "delivery_instructions", 500) || null,
    is_default: formData.get("is_default") === "on",
  };

  if (
    !address.recipient_name ||
    !address.phone ||
    !/^[A-Z]{2}$/.test(address.country_code) ||
    !address.region ||
    !address.city ||
    !address.address_line1
  ) {
    redirect(`/${locale}/account/addresses?result=invalid`);
  }

  const { error } = await supabase.from("addresses").insert(address);
  if (error) {
    console.error("Customer address save failed:", error.message);
    redirect(`/${locale}/account/addresses?result=failed`);
  }

  redirect(`/${locale}/account/addresses?result=saved`);
}

export async function deleteAddressAction(formData) {
  const locale = getSafeLocale(formData);
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/${locale}/account/addresses?result=unavailable`);

  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/${locale}/auth/sign-in`);

  const id = getTrimmed(formData, "address_id", 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    redirect(`/${locale}/account/addresses?result=invalid`);
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Customer address deletion failed:", error.message);
    redirect(`/${locale}/account/addresses?result=failed`);
  }

  redirect(`/${locale}/account/addresses?result=deleted`);
}
