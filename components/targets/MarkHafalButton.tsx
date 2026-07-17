"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markTargetHafal } from "@/lib/actions/targets";

export function MarkHafalButton({ targetId }: { targetId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markTargetHafal(targetId);
          router.push("/hafalan");
        })
      }
      className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {isPending ? "Menyimpan..." : "Tandai Sudah Hafal"}
    </button>
  );
}
