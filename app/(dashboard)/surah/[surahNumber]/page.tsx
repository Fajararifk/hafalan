import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { AyahCard } from "@/components/ayah/AyahCard";

export default async function SurahDetailPage({
  params,
}: {
  params: Promise<{ surahNumber: string }>;
}) {
  const { surahNumber: surahNumberParam } = await params;
  const surahNumber = Number(surahNumberParam);
  const userId = await requireUserId();

  const surah = await prisma.surah.findUnique({ where: { number: surahNumber } });
  if (!surah) notFound();

  const ayat = await prisma.ayah.findMany({
    where: { surahNumber },
    orderBy: { ayahNumber: "asc" },
    include: { progress: { where: { userId } } },
  });

  return (
    <div className="space-y-6">
      <div className="animate-slide-up rounded-2xl border border-neutral-200/70 bg-white/70 p-5 shadow-sm dark:border-emerald-900/30 dark:bg-neutral-900/60">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {surah.number}. {surah.nameTransliteration}
        </h1>
        <p dir="rtl" lang="ar" className="font-arabic mt-1 text-2xl text-emerald-700 dark:text-emerald-400">
          {surah.nameArabic}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          {surah.nameTranslationId} &middot; {surah.ayahCount} ayat
        </p>
      </div>

      <div className="space-y-4">
        {ayat.map((ayah) => (
          <AyahCard
            key={ayah.id}
            ayahNumber={ayah.ayahNumber}
            textUthmani={ayah.textUthmani}
            status={ayah.progress[0]?.status ?? "NOT_STARTED"}
          />
        ))}
      </div>
    </div>
  );
}
