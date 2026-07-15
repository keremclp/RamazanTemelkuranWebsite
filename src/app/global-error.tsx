"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => console.error(error), [error]);

  return (
    <html lang="tr">
      <body className="flex min-h-screen items-center justify-center bg-[#faf6f0] px-4 text-center text-[#2c2c2c]">
        <main className="max-w-lg rounded-3xl bg-[#fffdf7] p-10 shadow-lg">
          <h1 className="text-3xl font-bold">Bir sorun oluştu</h1>
          <p className="mt-4 text-[#6f6b62]">Sayfa şu anda yüklenemiyor. Lütfen yeniden deneyin.</p>
          <button type="button" onClick={reset} className="mt-7 rounded-xl bg-[#a68a3e] px-5 py-3 font-medium text-white">
            Yeniden dene
          </button>
        </main>
      </body>
    </html>
  );
}
