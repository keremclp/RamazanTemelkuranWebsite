"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";

export interface MessageActionState {
  message: string;
}

const initialError = (message: string): MessageActionState => ({ message });

async function getAuthenticatedClient() {
  return getAdminClient();
}

function revalidateMessagePages() {
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
}

export async function setMessageReadAction(
  id: string,
  isRead: boolean
): Promise<MessageActionState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id);

  if (error) {
    console.error("Message read state update error:", error);
    return initialError("Mesaj durumu güncellenemedi. Lütfen tekrar deneyin.");
  }

  revalidateMessagePages();
  return { message: "" };
}

export async function deleteMessageAction(
  id: string
): Promise<MessageActionState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Message delete error:", error);
    return initialError("Mesaj silinemedi. Lütfen tekrar deneyin.");
  }

  revalidateMessagePages();
  return { message: "" };
}
