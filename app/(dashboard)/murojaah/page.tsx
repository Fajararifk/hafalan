import Link from "next/link";
import { RotateCcw, BookOpen, ChevronRight } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getHafalTargets } from "@/lib/queries/targets";

export default async function MurojaahPage() {
  const userId = await requireUserId();
  const targets = await getHafalTargets(userId);

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          <RotateCcw className="h-5 w-5 text-emerald-600" />
          Murojaah
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Pilih target yang sudah hafal untuk diulang — ini tidak memengaruhi target aktif.
        </p>
      </div>

      {targets.length === 0 && (
        <p className="animate-slide-up text-sm text-neutral-500">
          Belum ada target yang ditandai hafal. Selesaikan target pertama di halaman Hafalan.
        </p>
      )}

      <div className="space-y-2.5">
        {targets.map((target, i) => (
          <Link
            key={target.id}
            href={`/murojaah/${target.id}`}
            style={{ animationDelay: `${i * 40}ms` }}
            className="animate-slide-up group flex items-center justify-between rounded-xl border border-neutral-200/70 bg-white/60 p-3.5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm dark:border-emerald-900/30 dark:bg-neutral-900/50 dark:hover:border-emerald-700"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {target.surah.nameTransliteration} {target.ayahStart}-{target.ayahEnd}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
