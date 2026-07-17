"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Check, Loader2 } from "lucide-react";
import { recordReview } from "@/lib/actions/targets";

export function MarkReviewButton({ ayahId }: { ayahId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await recordReview(ayahId);
          setDone(true);
        })
      }
      className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-60 ${
        done
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-emerald-600 dark:hover:bg-neutral-800"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : done ? (
        <Check className="h-3 w-3" />
      ) : (
        <RotateCcw className="h-3 w-3" />
      )}
      {done ? "Sudah direview hari ini" : "Tandai sudah murojaah"}
    </button>
  );
}
