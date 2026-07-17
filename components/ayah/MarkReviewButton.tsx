"use client";

import { useState, useTransition } from "react";
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
      className="mt-2 text-xs font-medium text-neutral-500 hover:text-emerald-600 disabled:opacity-60"
    >
      {done ? "Sudah direview hari ini ✓" : "Tandai sudah murojaah"}
    </button>
  );
}
