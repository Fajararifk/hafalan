import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getTargetWithAyat } from "@/lib/queries/targets";
import { AyahCard } from "@/components/ayah/AyahCard";
import { QuizPractice } from "@/components/ayah/QuizPractice";
import { MarkHafalButton } from "@/components/targets/MarkHafalButton";

export default async function TargetPracticePage({
  params,
}: {
  params: Promise<{ targetId: string }>;
}) {
  const { targetId } = await params;
  const userId = await requireUserId();
  const data = await getTargetWithAyat(targetId, userId);

  if (!data) notFound();
  const { target, ayat } = data;

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {target.surah.nameTransliteration} {target.ayahStart}-{target.ayahEnd}
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Hafalkan ayat berikut, lalu tandai sudah hafal untuk membuka target berikutnya.
        </p>
      </div>

      {target.status !== "HAFAL" && (
        <div className="animate-slide-up flex items-center gap-2.5 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/60 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Belum hafal sepenuhnya — kamu tidak bisa membuat target baru sampai ini ditandai
          hafal.
        </div>
      )}

      <div className="space-y-4">
        {ayat.map((ayah) => (
          <AyahCard
            key={ayah.id}
            ayahNumber={ayah.ayahNumber}
            textUthmani={ayah.textUthmani}
            status={ayah.progress[0]?.status ?? "NOT_STARTED"}
          >
            <QuizPractice ayahId={ayah.id} />
          </AyahCard>
        ))}
      </div>

      {target.status !== "HAFAL" && <MarkHafalButton targetId={target.id} />}
    </div>
  );
}
