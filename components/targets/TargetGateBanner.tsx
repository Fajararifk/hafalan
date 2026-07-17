import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

export function TargetGateBanner({
  targetLabel,
  targetId,
}: {
  targetLabel: string;
  targetId: string;
}) {
  return (
    <div className="animate-slide-up relative overflow-hidden rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50 to-amber-100/60 p-5 text-amber-900 shadow-sm dark:border-amber-800/50 dark:from-amber-950/60 dark:to-amber-900/20 dark:text-amber-200">
      <div className="flex items-start gap-3">
        <div className="animate-gentle-pulse flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
          <Lock className="h-[18px] w-[18px]" />
        </div>
        <div>
          <p className="font-semibold">Belum hafal sepenuhnya</p>
          <p className="mt-1 text-sm">
            Kamu belum menandai <span className="font-semibold">{targetLabel}</span> sebagai
            hafal. Selesaikan dan tandai hafal target ini dulu sebelum membuat target baru.
          </p>
          <Link
            href={`/hafalan/${targetId}`}
            className="group mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-900 hover:underline dark:text-amber-200"
          >
            Lanjutkan menghafal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
