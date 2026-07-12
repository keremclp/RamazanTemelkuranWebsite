import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MAX_FIELD_LENGTH = {
  name: 120,
  email: 254,
  subject: 160,
  message: 3000,
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return existing.count > RATE_LIMIT_MAX;
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = getText(body.name);
    const email = getText(body.email).toLowerCase();
    const subject = getText(body.subject);
    const message = getText(body.message);
    const website = getText(body.website);

    if (website) {
      return jsonError("Mesaj gönderilemedi.", 400);
    }

    const rateLimitKey = getClientIp(request);
    if (isRateLimited(rateLimitKey)) {
      return jsonError(
        "Çok fazla mesaj gönderildi. Lütfen daha sonra tekrar deneyiniz.",
        429
      );
    }

    if (!name) return jsonError("Ad soyad gereklidir.", 400);
    if (name.length > MAX_FIELD_LENGTH.name) {
      return jsonError("Ad soyad çok uzun.", 400);
    }

    if (!email) return jsonError("E-posta adresi gereklidir.", 400);
    if (email.length > MAX_FIELD_LENGTH.email) {
      return jsonError("E-posta adresi çok uzun.", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Geçerli bir e-posta adresi giriniz.", 400);
    }

    if (!subject) return jsonError("Konu gereklidir.", 400);
    if (subject.length > MAX_FIELD_LENGTH.subject) {
      return jsonError("Konu çok uzun.", 400);
    }

    if (!message) return jsonError("Mesaj gereklidir.", 400);
    if (message.length < 10) {
      return jsonError("Mesaj en az 10 karakter olmalıdır.", 400);
    }
    if (message.length > MAX_FIELD_LENGTH.message) {
      return jsonError("Mesaj çok uzun.", 400);
    }

    const supabase = await createClient();

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject,
      message,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return jsonError("Mesaj kaydedilirken bir hata oluştu.", 500);
    }

    return NextResponse.json(
      { message: "Mesajınız başarıyla gönderildi." },
      { status: 200 }
    );
  } catch {
    console.error("Contact API error");
    return jsonError("Sunucu hatası. Lütfen tekrar deneyiniz.", 500);
  }
}
