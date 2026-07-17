"use client";

import { useState, useTransition } from "react";
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
    <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          dir="rtl"
          lang="ar"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik ulang ayat ini dari hafalan..."
          rows={2}
          className="font-arabic w-full rounded-md border border-neutral-300 p-2 text-xl focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-neutral-500">
            <input
              type="checkbox"
              checked={mode === "strict"}
              onChange={(e) => setMode(e.target.checked ? "strict" : "lenient")}
            />
            Mode ketat (harakat harus tepat)
          </label>
          <button
            type="submit"
            disabled={isPending || input.trim().length === 0}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isPending ? "Memeriksa..." : "Cek Hafalan"}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-3 rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Skor: {result.scorePercent}%
          </p>
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
