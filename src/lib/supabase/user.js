export async function getSignedInUser(supabase) {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Could not verify the current Supabase user:", error.message);
    return null;
  }
  return data.user;
}
