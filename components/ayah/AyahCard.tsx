import type { ProgressStatus } from "@/app/generated/prisma/client";

const STATUS_LABEL: Record<ProgressStatus, string> = {
  NOT_STARTED: "Belum mulai",
  IN_PROGRESS: "Sedang dihafal",
  HAFAL: "Hafal",
};

const STATUS_CLASS: Record<ProgressStatus, string> = {
  NOT_STARTED:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  HAFAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function AyahCard({
  ayahNumber,
  textUthmani,
  status,
  children,
}: {
  ayahNumber: number;
  textUthmani: string;
  status: ProgressStatus;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
          {ayahNumber}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose text-neutral-900 dark:text-neutral-50">
        {textUthmani}
      </p>
      {children}
    </div>
  );
}
