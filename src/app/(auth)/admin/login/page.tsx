"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("E-posta veya şifre hatalı.");
        } else {
          setError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
        }
        return;
      }

      const { data: isAdmin, error: authorizationError } =
        await supabase.rpc("is_admin");

      if (authorizationError) {
        console.error("Admin login authorization error:", authorizationError);
        await supabase.auth.signOut({ scope: "local" });
        setError(
          "Admin yetkisi doğrulanamadı. Lütfen sistem yöneticisiyle iletişime geçin."
        );
        return;
      }

      if (isAdmin !== true) {
        await supabase.auth.signOut({ scope: "local" });
        setError("Bu hesabın yönetim paneline erişim yetkisi yok.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(197,165,90,0.5) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(197,165,90,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <BookOpen className="text-accent" size={28} />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-primary">
            Yönetim Paneli
          </h1>
          <p className="text-muted text-sm mt-1">
            Devam etmek için giriş yapın
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface rounded-2xl shadow-[var(--shadow-card)] p-8 animate-fade-in-up delay-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger animate-fade-in">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary"
              >
                E-posta
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/50 text-primary placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary"
              >
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-secondary/50 text-primary placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Giriş Yap
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          Ramazan Temelkuran &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
