"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/helpers";

export interface BookFormState {
  message: string;
}

interface BookPayload {
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  shopier_url: string;
  publisher: string | null;
  publication_year: number | null;
  page_count: number | null;
  isbn: string | null;
  category: string | null;
  display_order: number;
}

type ParsedBookForm =
  | { data: BookPayload; error?: never }
  | { data?: never; error: string };

const initialError = (message: string): BookFormState => ({ message });

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return null;

  const number = Number(value);
  return Number.isInteger(number) ? number : Number.NaN;
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function parseBookForm(formData: FormData): ParsedBookForm {
  const title = getString(formData, "title");
  const slug = slugify(getString(formData, "slug") || title);
  const description = getString(formData, "description");
  const shopierUrl = getString(formData, "shopier_url");
  const publicationYear = getOptionalNumber(formData, "publication_year");
  const pageCount = getOptionalNumber(formData, "page_count");
  const displayOrder = getOptionalNumber(formData, "display_order") ?? 0;

  if (!title) return { error: "Kitap adı gereklidir." };
  if (!slug) return { error: "Geçerli bir URL kısa adı gereklidir." };
  if (!description) return { error: "Kitap açıklaması gereklidir." };

  if (shopierUrl) {
    try {
      new URL(shopierUrl);
    } catch {
      return { error: "Shopier bağlantısı geçerli bir URL olmalıdır." };
    }
  }

  const maxPublicationYear = new Date().getFullYear() + 1;
  if (
    Number.isNaN(publicationYear) ||
    (publicationYear !== null &&
      (publicationYear < 1000 || publicationYear > maxPublicationYear))
  ) {
    return { error: "Yayın yılı geçerli bir yıl olmalıdır." };
  }

  if (
    Number.isNaN(pageCount) ||
    (pageCount !== null && pageCount < 1)
  ) {
    return { error: "Sayfa sayısı pozitif bir tam sayı olmalıdır." };
  }

  if (Number.isNaN(displayOrder) || displayOrder < 0) {
    return { error: "Görüntülenme sırası sıfır veya daha büyük olmalıdır." };
  }

  return {
    data: {
      title,
      slug,
      description,
      cover_image_url: getString(formData, "cover_image_url") || null,
      shopier_url: shopierUrl,
      publisher: getString(formData, "publisher") || null,
      publication_year: publicationYear,
      page_count: pageCount,
      isbn: getString(formData, "isbn") || null,
      category: getString(formData, "category") || null,
      display_order: displayOrder,
    },
  };
}

function revalidateBookPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  if (slug) revalidatePath(`/books/${slug}`);
}

export async function createBookAction(
  _previousState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  const parsed = parseBookForm(formData);
  if (parsed.error !== undefined) return initialError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error } = await supabase.from("books").insert(parsed.data);

  if (error) {
    if (error.code === "23505") {
      return initialError("Bu URL kısa adı başka bir kitap tarafından kullanılıyor.");
    }
    console.error("Book create error:", error);
    return initialError("Kitap kaydedilemedi. Lütfen tekrar deneyin.");
  }

  revalidateBookPages(parsed.data.slug);
  redirect("/admin/books?status=created");
}

export async function updateBookAction(
  id: string,
  _previousState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  const parsed = parseBookForm(formData);
  if (parsed.error !== undefined) return initialError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { data: existingBook } = await supabase
    .from("books")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("books")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return initialError("Bu URL kısa adı başka bir kitap tarafından kullanılıyor.");
    }
    console.error("Book update error:", error);
    return initialError("Kitap güncellenemedi. Lütfen tekrar deneyin.");
  }

  revalidateBookPages(existingBook?.slug);
  revalidateBookPages(parsed.data.slug);
  redirect("/admin/books?status=updated");
}

export async function deleteBookAction(id: string): Promise<BookFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { data: book } = await supabase
    .from("books")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("books").delete().eq("id", id);

  if (error) {
    console.error("Book delete error:", error);
    return initialError("Kitap silinemedi. Lütfen tekrar deneyin.");
  }

  revalidateBookPages(book?.slug);
  return { message: "" };
}
