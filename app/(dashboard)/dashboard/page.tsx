import Link from "next/link";
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
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Total hafalan</p>
          <p className="mt-1 text-2xl font-semibold">
            {overall.hafal} <span className="text-sm font-normal text-neutral-500">/ {overall.total} ayat</span>
          </p>
          <div className="mt-2">
            <ProgressBar percent={overall.percent} />
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Streak harian</p>
          <p className="mt-1 text-2xl font-semibold">{streak} hari</p>
        </div>
      </div>

      {latestTarget && (
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Target aktif</p>
          <p className="mt-1 font-medium">
            {latestTarget.surah.nameTransliteration} {latestTarget.ayahStart}-{latestTarget.ayahEnd}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {latestTarget.status === "HAFAL" ? "Sudah hafal" : "Belum hafal sepenuhnya"}
          </p>
          <Link
            href={`/hafalan/${latestTarget.id}`}
            className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:underline"
          >
            Buka target &rarr;
          </Link>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-medium">Progres per surat</h2>
        {touchedSurahs.length === 0 && (
          <p className="text-sm text-neutral-500">
            Belum ada surat yang dihafal.{" "}
            <Link href="/hafalan" className="text-emerald-600 hover:underline">
              Mulai sekarang
            </Link>
            .
          </p>
        )}
        {touchedSurahs.map((s) => (
          <Link
            key={s.surahNumber}
            href={`/surah/${s.surahNumber}`}
            className="block rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">
                {s.surahNumber}. {s.nameTransliteration}
              </span>
              <span className="text-neutral-500">
                {s.hafal} / {s.total} ayat
              </span>
            </div>
            <ProgressBar percent={Math.round((s.hafal / s.total) * 100)} />
          </Link>
        ))}
      </div>
    </div>
  );
}
