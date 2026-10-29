"use server";

import { redirect } from "next/navigation";
import { getSafeLocale, getTrimmed } from "@/lib/form-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export async function submitContactAction(formData) {
  const locale = getSafeLocale(formData);
  if (getTrimmed(formData, "website", 200)) redirect(`/${locale}/contact?result=sent`);

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/${locale}/contact?result=unavailable`);

  const email = getTrimmed(formData, "email", 320);
  const name = getTrimmed(formData, "name", 160);
  const subject = getTrimmed(formData, "subject", 200);
  const message = getTrimmed(formData, "message", 5000);
  if (
    !name ||
    !subject ||
    message.length < 10 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    redirect(`/${locale}/contact?result=invalid`);
  }

  const user = await getSignedInUser(supabase);
  const { error } = await supabase.from("contact_messages").insert({
    profile_id: user?.id ?? null,
    name,
    email,
    subject,
    message,
    locale,
  });

  if (error) {
    console.error("Contact message submission failed:", error.message);
    redirect(`/${locale}/contact?result=failed`);
  }

  redirect(`/${locale}/contact?result=sent`);
}
