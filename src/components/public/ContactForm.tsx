"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Ad soyad gereklidir.";
    if (!formData.email.trim()) {
      newErrors.email = "E-posta adresi gereklidir.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz.";
    }
    if (!formData.subject.trim()) newErrors.subject = "Konu gereklidir.";
    if (!formData.message.trim()) {
      newErrors.message = "Mesaj gereklidir.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Mesaj en az 10 karakter olmalıdır.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Mesaj gönderilemedi.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Bir hata oluştu. Lütfen tekrar deneyiniz."
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (status === "success") {
    return (
      <div className="bg-success/10 border border-success/30 rounded-[var(--radius-lg)] p-8 text-center animate-fade-in">
        <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
        <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-primary mb-2">
          Mesajınız Gönderildi!
        </h3>
        <p className="text-muted mb-6">
          En kısa sürede size geri dönüş yapılacaktır. Teşekkürler.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="px-6 py-2.5 bg-accent text-white rounded-[var(--radius-md)] font-medium hover:bg-accent-dark transition-colors"
        >
          Yeni Mesaj Gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Error Banner */}
      {status === "error" && (
        <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/30 rounded-[var(--radius-md)] text-danger animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-primary mb-1.5">
          Ad Soyad <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={cn(
            "w-full px-4 py-3 rounded-[var(--radius-md)] border bg-surface text-primary",
            "placeholder:text-muted/50 transition-colors duration-[var(--transition-fast)]",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
            errors.name ? "border-danger" : "border-border"
          )}
          placeholder="Adınız ve soyadınız"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary mb-1.5">
          E-posta <span className="text-danger">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={cn(
            "w-full px-4 py-3 rounded-[var(--radius-md)] border bg-surface text-primary",
            "placeholder:text-muted/50 transition-colors duration-[var(--transition-fast)]",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
            errors.email ? "border-danger" : "border-border"
          )}
          placeholder="ornek@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-danger">{errors.email}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-primary mb-1.5">
          Konu <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={cn(
            "w-full px-4 py-3 rounded-[var(--radius-md)] border bg-surface text-primary",
            "placeholder:text-muted/50 transition-colors duration-[var(--transition-fast)]",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
            errors.subject ? "border-danger" : "border-border"
          )}
          placeholder="Mesajınızın konusu"
        />
        {errors.subject && (
          <p className="mt-1 text-xs text-danger">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-primary mb-1.5">
          Mesaj <span className="text-danger">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={formData.message}
          onChange={handleChange}
          className={cn(
            "w-full px-4 py-3 rounded-[var(--radius-md)] border bg-surface text-primary resize-y",
            "placeholder:text-muted/50 transition-colors duration-[var(--transition-fast)]",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
            errors.message ? "border-danger" : "border-border"
          )}
          placeholder="Mesajınızı buraya yazınız..."
        />
        {errors.message && (
          <p className="mt-1 text-xs text-danger">{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--radius-md)]",
          "bg-accent text-white font-medium text-base",
          "hover:bg-accent-dark transition-all duration-[var(--transition-base)]",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Mesaj Gönder
          </>
        )}
      </button>
    </form>
  );
}
