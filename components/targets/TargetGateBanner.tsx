import Link from "next/link";

export function TargetGateBanner({
  targetLabel,
  targetId,
}: {
  targetLabel: string;
  targetId: string;
}) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <p className="font-medium">Belum hafal sepenuhnya</p>
      <p className="mt-1 text-sm">
        Kamu belum menandai <span className="font-semibold">{targetLabel}</span> sebagai
        hafal. Selesaikan dan tandai hafal target ini dulu sebelum membuat target baru.
      </p>
      <Link
        href={`/hafalan/${targetId}`}
        className="mt-3 inline-block text-sm font-medium text-amber-900 underline hover:no-underline dark:text-amber-200"
      >
        Lanjutkan menghafal &rarr;
      </Link>
    </div>
  );
}
