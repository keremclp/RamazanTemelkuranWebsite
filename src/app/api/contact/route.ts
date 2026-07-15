import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_FIELD_LENGTH = {
  name: 120,
  email: 254,
  subject: 160,
  message: 3000,
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_REQUEST_BYTES) {
      return jsonError("İstek çok büyük.", 413);
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return jsonError("Geçersiz istek.", 400);
    }

    const name = getText(body.name);
    const email = getText(body.email).toLowerCase();
    const subject = getText(body.subject);
    const message = getText(body.message);
    const website = getText(body.website);

    if (website) {
      return jsonError("Mesaj gönderilemedi.", 400);
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

    const supabase = createServiceClient();
    const clientKey = createHash("sha256")
      .update(getClientIp(request))
      .digest("hex");

    const { data, error } = await supabase.rpc("submit_contact_message", {
      p_client_key: clientKey,
      p_name: name,
      p_email: email,
      p_subject: subject,
      p_message: message,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return jsonError("Mesaj kaydedilirken bir hata oluştu.", 500);
    }

    if (data === "rate_limited") {
      return jsonError(
        "Çok fazla mesaj gönderildi. Lütfen daha sonra tekrar deneyiniz.",
        429
      );
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
