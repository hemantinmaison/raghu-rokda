"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { QUOTE_IDS } from "@/lib/quotes";

export async function toggleQuoteLike(quoteId: string, liked: boolean) {
  if (!QUOTE_IDS.has(quoteId)) throw new Error("Unknown quote.");

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to like quotes.");

  if (liked) {
    const { error } = await supabase
      .from("quote_likes")
      .upsert({ user_id: user.id, quote_id: quoteId }, { onConflict: "user_id,quote_id" });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("quote_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("quote_id", quoteId);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/quotes");
}
