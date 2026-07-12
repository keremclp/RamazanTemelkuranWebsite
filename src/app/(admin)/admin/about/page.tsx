import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { AboutContent } from "@/lib/types/database";
import AboutForm from "@/components/admin/AboutForm";
import { deleteAboutPortraitAction, updateAboutContentAction } from "./actions";

export const metadata: Metadata = {
  title: "Hakkında",
};

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("about_content")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const about = data as AboutContent | null;
  const action = updateAboutContentAction.bind(null, about?.id ?? null);
  const deletePortraitAction = deleteAboutPortraitAction.bind(
    null,
    about?.id ?? null
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Hakkında Sayfası
        </h1>
        <p className="mt-1 text-muted">
          Biyografi, portre görseli, kariyer adımları ve sosyal medya bağlantılarını yönetin.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          Hakkında içeriği yüklenemedi. Verilerin üzerine yazmamak için düzenleme formu açılmadı. Lütfen sayfayı yenileyin.
        </div>
      ) : (
        <AboutForm
          action={action}
          deletePortraitAction={deletePortraitAction}
          about={about ?? undefined}
        />
      )}
    </div>
  );
}
