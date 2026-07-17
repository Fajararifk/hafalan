"use client";

import { useActionState } from "react";
import { createTargetFormAction } from "@/lib/actions/targets";

export function CreateTargetForm({
  surahs,
}: {
  surahs: { number: number; nameTransliteration: string; ayahCount: number }[];
}) {
  const [error, formAction, pending] = useActionState(createTargetFormAction, undefined);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h2 className="font-medium">Buat target hafalan baru</h2>
      <div>
        <label htmlFor="surahNumber" className="mb-1 block text-sm font-medium">
          Surat
        </label>
        <select
          id="surahNumber"
          name="surahNumber"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
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
          <label htmlFor="ayahStart" className="mb-1 block text-sm font-medium">
            Ayat awal
          </label>
          <input
            id="ayahStart"
            name="ayahStart"
            type="number"
            min={1}
            required
            defaultValue={1}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="ayahEnd" className="mb-1 block text-sm font-medium">
            Ayat akhir
          </label>
          <input
            id="ayahEnd"
            name="ayahEnd"
            type="number"
            min={1}
            required
            defaultValue={5}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Mulai Hafalan"}
      </button>
    </form>
  );
}
