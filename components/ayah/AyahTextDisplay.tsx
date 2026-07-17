"use client";

import { useState } from "react";
import { PencilLine, Eye } from "lucide-react";
import { SambungAyatExercise } from "./SambungAyatExercise";

export function AyahTextDisplay({
  ayahId,
  textUthmani,
}: {
  ayahId: string;
  textUthmani: string;
}) {
  const [mode, setMode] = useState<"full" | "sambung">("full");

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setMode(mode === "full" ? "sambung" : "full")}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
        >
          {mode === "full" ? (
            <>
              <PencilLine className="h-3.5 w-3.5" /> Latihan Sambung Ayat
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Tampilkan Teks Lengkap
            </>
          )}
        </button>
      </div>

      {mode === "full" ? (
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic animate-fade-in text-3xl leading-loose text-neutral-900 dark:text-neutral-50"
        >
          {textUthmani}
        </p>
      ) : (
        <div className="animate-fade-in">
          <SambungAyatExercise ayahId={ayahId} textUthmani={textUthmani} />
        </div>
      )}
    </div>
  );
}
