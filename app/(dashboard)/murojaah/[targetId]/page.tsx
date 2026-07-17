import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getTargetWithAyat } from "@/lib/queries/targets";
import { AyahCard } from "@/components/ayah/AyahCard";
import { MarkReviewButton } from "@/components/ayah/MarkReviewButton";

export default async function MurojaahTargetPage({
  params,
}: {
  params: Promise<{ targetId: string }>;
}) {
  const { targetId } = await params;
  const userId = await requireUserId();
  const data = await getTargetWithAyat(targetId, userId);

  if (!data || data.target.status !== "HAFAL") notFound();
  const { target, ayat } = data;

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {target.surah.nameTransliteration} {target.ayahStart}-{target.ayahEnd}
        </h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Sudah hafal
          {target.hafalAt &&
            ` sejak ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(target.hafalAt)}`}
        </p>
      </div>

      <div className="space-y-4">
        {ayat.map((ayah) => (
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
    </div>
  );
}
