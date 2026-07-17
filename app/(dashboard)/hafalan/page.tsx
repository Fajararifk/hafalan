import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getTargets, getLatestTarget, canCreateNewTarget } from "@/lib/queries/targets";
import { TargetGateBanner } from "@/components/targets/TargetGateBanner";
import { CreateTargetForm } from "@/components/targets/CreateTargetForm";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Belum mulai",
  IN_PROGRESS: "Belum hafal sepenuhnya",
  HAFAL: "Hafal",
};

export default async function HafalanPage() {
  const userId = await requireUserId();
  const [targets, latest, canCreate, surahs] = await Promise.all([
    getTargets(userId),
    getLatestTarget(userId),
    canCreateNewTarget(userId),
    prisma.surah.findMany({
      orderBy: { number: "asc" },
      select: { number: true, nameTransliteration: true, ayahCount: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Hafalan</h1>

      {!canCreate && latest && (
        <TargetGateBanner
          targetLabel={`${latest.surah.nameTransliteration} ${latest.ayahStart}-${latest.ayahEnd}`}
          targetId={latest.id}
        />
      )}

      {canCreate && <CreateTargetForm surahs={surahs} />}

      <div className="space-y-2">
        <h2 className="font-medium">Riwayat target</h2>
        {targets.length === 0 && (
          <p className="text-sm text-neutral-500">Belum ada target hafalan.</p>
        )}
        {[...targets].reverse().map((target) => (
          <Link
            key={target.id}
            href={`/hafalan/${target.id}`}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <span className="text-sm font-medium">
              {target.surah.nameTransliteration} {target.ayahStart}-{target.ayahEnd}
            </span>
            <span
              className={
                target.status === "HAFAL"
                  ? "text-sm text-emerald-600"
                  : "text-sm text-amber-600"
              }
            >
              {STATUS_LABEL[target.status]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
