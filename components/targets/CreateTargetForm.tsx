"use client";

import { useActionState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { createTargetFormAction } from "@/lib/actions/targets";

export function CreateTargetForm({
  surahs,
}: {
  surahs: { number: number; nameTransliteration: string; ayahCount: number }[];
}) {
  const [error, formAction, pending] = useActionState(createTargetFormAction, undefined);

  return (
    <form
      action={formAction}
      className="animate-slide-up space-y-4 rounded-2xl border border-neutral-200/70 bg-white/70 p-5 shadow-sm dark:border-emerald-900/30 dark:bg-neutral-900/60"
    >
      <h2 className="flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-50">
        <PlusCircle className="h-[18px] w-[18px] text-emerald-600" />
        Buat target hafalan baru
      </h2>
      <div>
        <label htmlFor="surahNumber" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Surat
        </label>
        <select
          id="surahNumber"
          name="surahNumber"
          required
          className="w-full rounded-xl border border-neutral-300 bg-white/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {surahs.map((s) => (
            <option key={s.number} value={s.number}>
              {s.number}. {s.nameTransliteration} ({s.ayahCount} ayat)
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="ayahStart" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Ayat awal
          </label>
          <input
            id="ayahStart"
            name="ayahStart"
            type="number"
            min={1}
            required
            defaultValue={1}
            className="w-full rounded-xl border border-neutral-300 bg-white/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="ayahEnd" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Ayat akhir
          </label>
          <input
            id="ayahEnd"
            name="ayahEnd"
            type="number"
            min={1}
            required
            defaultValue={5}
            className="w-full rounded-xl border border-neutral-300 bg-white/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      </div>

      {error && (
        <p className="animate-fade-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2.5 text-sm font-medium text-white shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg hover:shadow-emerald-600/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:hover:brightness-100"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Menyimpan..." : "Mulai Hafalan"}
      </button>
    </form>
  );
}
