"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
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
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-sm font-medium text-white shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg hover:shadow-emerald-600/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:hover:brightness-100"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" /> Tandai Sudah Hafal
        </>
      )}
    </button>
  );
}
