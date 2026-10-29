"use server";

import { redirect } from "next/navigation";
import { getSafeLocale, getTrimmed } from "@/lib/form-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export async function submitInquiryAction(formData) {
  const locale = getSafeLocale(formData);
  if (getTrimmed(formData, "website", 200)) redirect(`/${locale}/custom-order?result=sent`);

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/${locale}/custom-order?result=unavailable`);

  const name = getTrimmed(formData, "name", 160);
  const email = getTrimmed(formData, "email", 320);
  const phone = getTrimmed(formData, "phone", 40);
  const details = getTrimmed(formData, "details", 5000);
  if (!name || details.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`/${locale}/custom-order?result=invalid`);
  }

  const user = await getSignedInUser(supabase);
  const { error } = await supabase.from("custom_inquiries").insert({
    profile_id: user?.id ?? null,
    name,
    email,
    phone: phone || null,
    locale,
    details,
  });

  if (error) {
    console.error("Custom inquiry submission failed:", error.message);
    redirect(`/${locale}/custom-order?result=failed`);
  }

  redirect(`/${locale}/custom-order?result=sent`);
}
