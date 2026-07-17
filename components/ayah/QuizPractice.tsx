"use client";

import { useState, useTransition } from "react";
import { PencilLine, Loader2 } from "lucide-react";
import { submitQuizAttempt } from "@/lib/actions/quiz";
import type { CompareResult, DiffOp } from "@/lib/quran/diff";
import type { CompareMode } from "@/lib/quran/normalize";

function DiffWord({ op }: { op: DiffOp }) {
  if (op.type === "MATCH") {
    return <span className="text-neutral-900 dark:text-neutral-100">{op.word} </span>;
  }
  if (op.type === "MISSING") {
    return (
      <span className="text-red-600 line-through decoration-2 dark:text-red-400">
        {op.word}{" "}
      </span>
    );
  }
  if (op.type === "EXTRA") {
    return (
      <span className="text-blue-600 underline decoration-wavy dark:text-blue-400">
        {op.word}{" "}
      </span>
    );
  }
  // SUBSTITUTION
  return (
    <span className="rounded bg-amber-100 px-1 dark:bg-amber-950">
      {op.charDiff.map((part, i) => (
        <span
          key={i}
          className={
            part.same
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-red-600 underline decoration-2 dark:text-red-400"
          }
        >
          {part.text}
        </span>
      ))}{" "}
    </span>
  );
}

function scoreRingColor(score: number) {
  if (score >= 95) return "text-emerald-500";
  if (score >= 70) return "text-amber-500";
  return "text-red-500";
}

export function QuizPractice({ ayahId }: { ayahId: string }) {
  const [mode, setMode] = useState<CompareMode>("lenient");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitQuizAttempt(ayahId, input, mode);
      setResult(res);
    });
  }

  return (
    <div className="mt-4 border-t border-neutral-200/70 pt-4 dark:border-neutral-800">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <textarea
          dir="rtl"
          lang="ar"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik ulang ayat ini dari hafalan..."
          rows={2}
          className="font-arabic w-full rounded-xl border border-neutral-300 bg-white/60 p-3 text-xl outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-500">
            <span
              onClick={() => setMode(mode === "strict" ? "lenient" : "strict")}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                mode === "strict" ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  mode === "strict" ? "translate-x-[18px]" : "translate-x-1"
                }`}
              />
            </span>
            Mode ketat (harakat harus tepat)
          </label>
          <button
            type="submit"
            disabled={isPending || input.trim().length === 0}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-neutral-700 active:scale-95 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PencilLine className="h-3.5 w-3.5" />
            )}
            {isPending ? "Memeriksa..." : "Cek Hafalan"}
          </button>
        </div>
      </form>

      {result && (
        <div className="animate-slide-up mt-3 rounded-xl bg-neutral-50 p-3.5 dark:bg-neutral-900/70">
          <div className="mb-2.5 flex items-center gap-2">
            <span className={`text-lg font-bold ${scoreRingColor(result.scorePercent)}`}>
              {result.scorePercent}%
            </span>
            <span className="text-xs text-neutral-500">skor kecocokan</span>
          </div>
          <p dir="rtl" lang="ar" className="font-arabic text-xl leading-loose">
            {result.ops.map((op, i) => (
              <DiffWord key={i} op={op} />
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
