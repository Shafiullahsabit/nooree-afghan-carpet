"use server";

import { redirect } from "next/navigation";
import { getSafeLocale, getTrimmed } from "@/lib/form-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData) {
  const locale = getSafeLocale(formData);
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/${locale}/auth/sign-in?result=unavailable`);

  const email = getTrimmed(formData, "email", 320);
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Customer sign-in failed:", error.message);
    redirect(`/${locale}/auth/sign-in?result=failed`);
  }

  redirect(`/${locale}/account`);
}

export async function signUpAction(formData) {
  const locale = getSafeLocale(formData);
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/${locale}/auth/register?result=unavailable`);

  const fullName = getTrimmed(formData, "full_name", 160);
  const email = getTrimmed(formData, "email", 320);
  const password = String(formData.get("password") ?? "");

  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10) {
    redirect(`/${locale}/auth/register?result=invalid`);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    console.error("Customer registration failed:", error.message);
    redirect(`/${locale}/auth/register?result=failed`);
  }

  redirect(`/${locale}/auth/register?result=check-email`);
}

export async function signOutAction(formData) {
  const locale = getSafeLocale(formData);
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Customer sign-out failed:", error.message);
      redirect(`/${locale}/account?result=failed`);
    }
  }
  redirect(`/${locale}`);
}
