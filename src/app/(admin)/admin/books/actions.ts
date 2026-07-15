"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  commitTemporaryUpload,
  discardTemporaryUpload,
  removeStorageFilesByUrls,
} from "@/lib/supabase/storage";
import { slugify } from "@/lib/utils/helpers";
import { isHttpUrl } from "@/lib/validation";
import { buildStableBookUpdate } from "@/lib/book-lifecycle";

export interface BookFormState {
  message: string;
  committedImageUrl?: string | null;
}

interface BookPayload {
  title: string;
  description: string;
  cover_image_url: string | null;
  shopier_url: string;
  publisher: string | null;
  publication_year: number | null;
  page_count: number | null;
  isbn: string | null;
  display_order: number;
  is_published: boolean;
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
  return getAdminClient();
}

function parseBookForm(formData: FormData): ParsedBookForm {
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const shopierUrl = getString(formData, "shopier_url");
  const publicationYear = getOptionalNumber(formData, "publication_year");
  const pageCount = getOptionalNumber(formData, "page_count");
  const displayOrder = getOptionalNumber(formData, "display_order") ?? 0;

  if (!title) return { error: "Kitap adı gereklidir." };
  if (!slugify(title)) {
    return { error: "Kitap adından geçerli bir URL oluşturulamadı." };
  }
  if (!description) return { error: "Kitap açıklaması gereklidir." };

  if (shopierUrl) {
    if (!isHttpUrl(shopierUrl)) {
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

  if (Number.isNaN(pageCount) || (pageCount !== null && pageCount < 1)) {
    return { error: "Sayfa sayısı pozitif bir tam sayı olmalıdır." };
  }

  if (Number.isNaN(displayOrder) || displayOrder < 0) {
    return { error: "Görüntülenme sırası sıfır veya daha büyük olmalıdır." };
  }

  return {
    data: {
      title,
      description,
      cover_image_url: getString(formData, "cover_image_url") || null,
      shopier_url: shopierUrl,
      publisher: getString(formData, "publisher") || null,
      publication_year: publicationYear,
      page_count: pageCount,
      isbn: getString(formData, "isbn") || null,
      display_order: displayOrder,
      is_published: getString(formData, "is_published") === "published",
    },
  };
}

async function generateUniqueBookSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  currentBookId?: string
) {
  const baseSlug = slugify(title);
  if (!baseSlug) return null;

  const { data, error } = await supabase
    .from("books")
    .select("id, slug")
    .like("slug", `${baseSlug}%`);

  if (error) {
    console.error("Book slug lookup error:", error);
    return null;
  }

  const existingSlugs = new Set(
    (data ?? [])
      .filter((book) => book.id !== currentBookId)
      .map((book) => book.slug)
  );

  let candidate = baseSlug;
  let suffix = 2;

  while (existingSlugs.has(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function revalidateBookPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/sitemap.xml");
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

  const slug = await generateUniqueBookSlug(supabase, parsed.data.title);
  if (!slug) return initialError("Kitap URL'si otomatik oluşturulamadı.");

  const { error } = await supabase
    .from("books")
    .insert({ ...parsed.data, slug });

  if (error) {
    await discardTemporaryUpload(supabase, parsed.data.cover_image_url);
    if (error.code === "23505") {
      return initialError("Kitap URL'si otomatik oluşturulurken çakışma oluştu.");
    }
    console.error("Book create error:", error);
    return initialError("Kitap kaydedilemedi. Lütfen tekrar deneyin.");
  }

  await commitTemporaryUpload(supabase, parsed.data.cover_image_url);
  revalidateBookPages(slug);
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

  const { data: existingBook, error: existingBookError } = await supabase
    .from("books")
    .select("slug, cover_image_url")
    .eq("id", id)
    .single();

  if (existingBookError || !existingBook) {
    return initialError("Kitap bulunamadı. Lütfen sayfayı yenileyin.");
  }

  const { error } = await supabase
    .from("books")
    .update(buildStableBookUpdate(existingBook.slug, parsed.data))
    .eq("id", id);

  if (error) {
    if (existingBook?.cover_image_url !== parsed.data.cover_image_url) {
      await discardTemporaryUpload(supabase, parsed.data.cover_image_url);
    }
    console.error("Book update error:", error);
    return initialError("Kitap güncellenemedi. Lütfen tekrar deneyin.");
  }

  await commitTemporaryUpload(supabase, parsed.data.cover_image_url);
  if (existingBook?.cover_image_url !== parsed.data.cover_image_url) {
    await removeStorageFilesByUrls(supabase, [existingBook?.cover_image_url]);
  }

  revalidateBookPages(existingBook?.slug);
  redirect("/admin/books?status=updated");
}

export async function deleteBookCoverAction(
  id: string,
  imageUrl: string
): Promise<BookFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { data: book, error: fetchError } = await supabase
    .from("books")
    .select("slug, cover_image_url")
    .eq("id", id)
    .single();

  if (fetchError || !book) {
    console.error("Book cover lookup error:", fetchError);
    return initialError("Kapak görseli kontrol edilemedi. Lütfen tekrar deneyin.");
  }

  if (!book.cover_image_url) {
    return { message: "", committedImageUrl: null };
  }

  if (book.cover_image_url !== imageUrl) {
    return initialError("Kapak görseli zaten değişmiş. Lütfen sayfayı yenileyin.");
  }

  const { error: updateError } = await supabase
    .from("books")
    .update({ cover_image_url: null })
    .eq("id", id)
    .eq("cover_image_url", imageUrl);

  if (updateError) {
    console.error("Book cover remove error:", updateError);
    return initialError("Kapak görseli kaldırılamadı. Lütfen tekrar deneyin.");
  }

  const storageCleanupSucceeded = await removeStorageFilesByUrls(supabase, [
    imageUrl,
  ]);

  revalidateBookPages(book.slug);
  return {
    message: storageCleanupSucceeded
      ? ""
      : "Görsel siteden kaldırıldı, ancak Storage temizliği tamamlanamadı.",
    committedImageUrl: null,
  };
}

export async function deleteBookAction(id: string): Promise<BookFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { data: book } = await supabase
    .from("books")
    .select("slug, cover_image_url")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("books").delete().eq("id", id);

  if (error) {
    console.error("Book delete error:", error);
    return initialError("Kitap silinemedi. Lütfen tekrar deneyin.");
  }

  await removeStorageFilesByUrls(supabase, [book?.cover_image_url]);

  revalidateBookPages(book?.slug);
  return { message: "" };
}
