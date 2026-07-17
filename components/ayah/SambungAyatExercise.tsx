"use client";

import { useMemo, useState, useTransition } from "react";
import { Shuffle, CheckCheck, Loader2 } from "lucide-react";
import { pickBlankIndices } from "@/lib/quran/blanks";
import { submitSambungAyat, type BlankResult } from "@/lib/actions/sambung";

export function SambungAyatExercise({
  ayahId,
  textUthmani,
}: {
  ayahId: string;
  textUthmani: string;
}) {
  const words = useMemo(() => textUthmani.split(" ").filter(Boolean), [textUthmani]);

  const [round, setRound] = useState(0);
  const blankIndices = useMemo(
    () => pickBlankIndices(words.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words, round]
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<BlankResult[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const resultByIndex = useMemo(() => {
    const map = new Map<number, BlankResult>();
    results?.forEach((r) => map.set(r.index, r));
    return map;
  }, [results]);

  const allFilled =
    blankIndices.size > 0 && [...blankIndices].every((i) => (answers[i] ?? "").trim().length > 0);

  function handleReshuffle() {
    setAnswers({});
    setResults(null);
    setRound((r) => r + 1);
  }

  function handleCheck() {
    const blanks = [...blankIndices].map((index) => ({
      index,
      expected: words[index],
      answer: answers[index] ?? "",
    }));
    startTransition(async () => {
      const res = await submitSambungAyat(ayahId, blanks);
      setResults(res.results);
    });
  }

  return (
    <div className="space-y-3">
      <div dir="rtl" className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {words.map((word, i) => {
          if (!blankIndices.has(i)) {
            return (
              <span key={i} className="font-arabic text-2xl leading-loose text-neutral-900 dark:text-neutral-50">
                {word}
              </span>
            );
          }

          const result = resultByIndex.get(i);
          const stateClass =
            result === undefined
              ? "border-neutral-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-neutral-700"
              : result.correct
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                : "border-red-400 bg-red-50 dark:bg-red-950/40";

          return (
            <span key={i} className="inline-flex flex-col items-center">
              <input
                dir="rtl"
                lang="ar"
                value={answers[i] ?? ""}
                disabled={results !== null}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                style={{ width: `${Math.max(3, word.length)}ch` }}
                className={`font-arabic rounded-lg border-2 bg-white/70 px-1.5 py-0.5 text-center text-2xl outline-none transition-colors dark:bg-neutral-900 ${stateClass}`}
              />
              {result && !result.correct && (
                <span className="font-arabic mt-0.5 text-sm text-red-500">{result.expected}</span>
              )}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReshuffle}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <Shuffle className="h-3.5 w-3.5" />
          Acak ulang
        </button>

        {results ? (
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Skor: {results.length ? Math.round((results.filter((r) => r.correct).length / results.length) * 100) : 0}%
          </span>
        ) : (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!allFilled || isPending}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-neutral-700 active:scale-95 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
            Cek Jawaban
          </button>
        )}
      </div>
    </div>
  );
}
