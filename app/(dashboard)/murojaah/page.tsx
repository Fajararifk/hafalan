import { requireUserId } from "@/lib/session";
import { getMemorizedAyat } from "@/lib/queries/progress";
import { AyahCard } from "@/components/ayah/AyahCard";
import { QuizPractice } from "@/components/ayah/QuizPractice";
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
      <div>
        <h1 className="text-xl font-semibold">Murojaah</h1>
        <p className="text-sm text-neutral-500">
          Ulangi ayat yang sudah kamu hafal kapan saja — ini tidak memengaruhi target aktif.
        </p>
      </div>

      {ayat.length === 0 && (
        <p className="text-sm text-neutral-500">
          Belum ada ayat yang ditandai hafal. Selesaikan target pertama di halaman Hafalan.
        </p>
      )}

      {[...bySurah.entries()].map(([surahNumber, surahAyat]) => (
        <div key={surahNumber} className="space-y-3">
          <h2 className="font-medium">{surahAyat[0].surah.nameTransliteration}</h2>
          {surahAyat.map((ayah) => (
            <AyahCard
              key={ayah.id}
              ayahNumber={ayah.ayahNumber}
              textUthmani={ayah.textUthmani}
              status="HAFAL"
            >
              <MarkReviewButton ayahId={ayah.id} />
              <QuizPractice ayahId={ayah.id} />
            </AyahCard>
          ))}
        </div>
      ))}
    </div>
  );
}
