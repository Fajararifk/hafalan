import { RotateCcw } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getMemorizedAyat } from "@/lib/queries/progress";
import { AyahCard } from "@/components/ayah/AyahCard";
import { MarkReviewButton } from "@/components/ayah/MarkReviewButton";

export default async function MurojaahPage() {
  const userId = await requireUserId();
  const ayat = await getMemorizedAyat(userId);

  const bySurah = new Map<number, typeof ayat>();
  for (const ayah of ayat) {
    const list = bySurah.get(ayah.surahNumber) ?? [];
    list.push(ayah);
    bySurah.set(ayah.surahNumber, list);
  }

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          <RotateCcw className="h-5 w-5 text-emerald-600" />
          Murojaah
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Ulangi ayat yang sudah kamu hafal kapan saja — ini tidak memengaruhi target aktif.
        </p>
      </div>

      {ayat.length === 0 && (
        <p className="animate-slide-up text-sm text-neutral-500">
          Belum ada ayat yang ditandai hafal. Selesaikan target pertama di halaman Hafalan.
        </p>
      )}

      {[...bySurah.entries()].map(([surahNumber, surahAyat]) => (
        <div key={surahNumber} className="space-y-3">
          <h2 className="font-medium text-neutral-900 dark:text-neutral-50">{surahAyat[0].surah.nameTransliteration}</h2>
          {surahAyat.map((ayah) => (
            <AyahCard
              key={ayah.id}
              ayahId={ayah.id}
              ayahNumber={ayah.ayahNumber}
              textUthmani={ayah.textUthmani}
              status="HAFAL"
            >
              <MarkReviewButton ayahId={ayah.id} />
            </AyahCard>
          ))}
        </div>
      ))}
    </div>
  );
}
