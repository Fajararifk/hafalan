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
      <div>
        <h1 className="text-xl font-semibold">
          {surah.number}. {surah.nameTransliteration}
        </h1>
        <p dir="rtl" lang="ar" className="font-arabic text-2xl text-neutral-700 dark:text-neutral-300">
          {surah.nameArabic}
        </p>
        <p className="text-sm text-neutral-500">
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
