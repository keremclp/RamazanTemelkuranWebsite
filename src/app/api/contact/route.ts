import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Ad soyad gereklidir." },
        { status: 400 }
      );
    }
    if (!email?.trim()) {
      return NextResponse.json(
        { error: "E-posta adresi gereklidir." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }
    if (!subject?.trim()) {
      return NextResponse.json(
        { error: "Konu gereklidir." },
        { status: 400 }
      );
    }
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Mesaj gereklidir." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Mesaj kaydedilirken bir hata oluştu." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Mesajınız başarıyla gönderildi." },
      { status: 200 }
    );
  } catch {
    console.error("Contact API error");
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar deneyiniz." },
      { status: 500 }
    );
  }
}
