import Link from "next/link";
import { BookMarked, Flame, Target, ChevronRight, Sparkles } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getOverallProgress, getSurahProgress, getStreak } from "@/lib/queries/progress";
import { getLatestTarget } from "@/lib/queries/targets";
import { ProgressBar } from "@/components/dashboard/ProgressBar";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [overall, surahProgress, streak, latestTarget] = await Promise.all([
    getOverallProgress(userId),
    getSurahProgress(userId),
    getStreak(userId),
    getLatestTarget(userId),
  ]);

  const touchedSurahs = surahProgress.filter((s) => s.hafal > 0);

  return (
    <div className="space-y-8">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">Pantau progres hafalanmu di sini.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="animate-slide-up stagger-1 group rounded-2xl border border-neutral-200/70 bg-white/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/30 dark:bg-neutral-900/60">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <BookMarked className="h-5 w-5" />
          </div>
          <p className="text-sm text-neutral-500">Total hafalan</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            {overall.hafal} <span className="text-sm font-normal text-neutral-500">/ {overall.total} ayat</span>
          </p>
          <div className="mt-3">
            <ProgressBar percent={overall.percent} />
          </div>
        </div>

        <div className="animate-slide-up stagger-2 group rounded-2xl border border-neutral-200/70 bg-white/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/30 dark:bg-neutral-900/60">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Flame className="h-5 w-5" />
          </div>
          <p className="text-sm text-neutral-500">Streak harian</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            {streak} <span className="text-sm font-normal text-neutral-500">hari</span>
          </p>
        </div>
      </div>

      {latestTarget && (
        <div className="animate-slide-up stagger-3 rounded-2xl border border-neutral-200/70 bg-white/70 p-5 shadow-sm dark:border-emerald-900/30 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Target className="h-4 w-4" />
            Target aktif
          </div>
          <p className="mt-1.5 font-medium text-neutral-900 dark:text-neutral-50">
            {latestTarget.surah.nameTransliteration} {latestTarget.ayahStart}-{latestTarget.ayahEnd}
          </p>
          <p className="mt-0.5 text-sm text-neutral-500">
            {latestTarget.status === "HAFAL" ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" /> Sudah hafal
              </span>
            ) : (
              "Belum hafal sepenuhnya"
            )}
          </p>
          <Link
            href={`/hafalan/${latestTarget.id}`}
            className="group mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Buka target
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      <div className="animate-slide-up stagger-4 space-y-3">
        <h2 className="font-medium text-neutral-900 dark:text-neutral-50">Progres per surat</h2>
        {touchedSurahs.length === 0 && (
          <p className="text-sm text-neutral-500">
            Belum ada surat yang dihafal.{" "}
            <Link href="/hafalan" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Mulai sekarang
            </Link>
            .
          </p>
        )}
        {touchedSurahs.map((s, i) => (
          <Link
            key={s.surahNumber}
            href={`/surah/${s.surahNumber}`}
            style={{ animationDelay: `${280 + i * 40}ms` }}
            className="animate-slide-up group block rounded-xl border border-neutral-200/70 bg-white/60 p-3.5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm dark:border-emerald-900/30 dark:bg-neutral-900/50 dark:hover:border-emerald-700"
          >
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-800 dark:text-neutral-100">
                {s.surahNumber}. {s.nameTransliteration}
              </span>
              <span className="flex items-center gap-1 text-neutral-500">
                {s.hafal} / {s.total} ayat
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
            <ProgressBar percent={Math.round((s.hafal / s.total) * 100)} />
          </Link>
        ))}
      </div>
    </div>
  );
}
