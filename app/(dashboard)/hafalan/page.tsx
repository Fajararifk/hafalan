import Link from "next/link";
import { CheckCircle2, Clock, ChevronRight } from "lucide-react";
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
      <div className="animate-slide-up">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Hafalan
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">Kelola target hafalan harianmu.</p>
      </div>

      {!canCreate && latest && (
        <TargetGateBanner
          targetLabel={`${latest.surah.nameTransliteration} ${latest.ayahStart}-${latest.ayahEnd}`}
          targetId={latest.id}
        />
      )}

      {canCreate && <CreateTargetForm surahs={surahs} />}

      <div className="space-y-2.5">
        <h2 className="font-medium text-neutral-900 dark:text-neutral-50">Riwayat target</h2>
        {targets.length === 0 && (
          <p className="text-sm text-neutral-500">Belum ada target hafalan.</p>
        )}
        {[...targets].reverse().map((target, i) => (
          <Link
            key={target.id}
            href={`/hafalan/${target.id}`}
            style={{ animationDelay: `${i * 40}ms` }}
            className="animate-slide-up group flex items-center justify-between rounded-xl border border-neutral-200/70 bg-white/60 p-3.5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm dark:border-emerald-900/30 dark:bg-neutral-900/50 dark:hover:border-emerald-700"
          >
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {target.surah.nameTransliteration} {target.ayahStart}-{target.ayahEnd}
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 text-sm font-medium ${
                  target.status === "HAFAL" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {target.status === "HAFAL" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {STATUS_LABEL[target.status]}
              </span>
              <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
