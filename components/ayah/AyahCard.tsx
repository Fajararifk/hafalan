import { CheckCircle2, Clock, Circle } from "lucide-react";
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

const STATUS_ICON: Record<ProgressStatus, typeof Circle> = {
  NOT_STARTED: Circle,
  IN_PROGRESS: Clock,
  HAFAL: CheckCircle2,
};

const STATUS_BORDER: Record<ProgressStatus, string> = {
  NOT_STARTED: "border-l-neutral-300 dark:border-l-neutral-700",
  IN_PROGRESS: "border-l-blue-400 dark:border-l-blue-600",
  HAFAL: "border-l-emerald-500 dark:border-l-emerald-500",
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
  const StatusIcon = STATUS_ICON[status];

  return (
    <div
      className={`animate-slide-up rounded-xl border border-neutral-200/70 border-l-4 bg-white/70 p-4 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/30 dark:bg-neutral-900/50 ${STATUS_BORDER[status]}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-medium text-white dark:from-neutral-100 dark:to-neutral-300 dark:text-neutral-900">
          {ayahNumber}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${STATUS_CLASS[status]}`}
        >
          <StatusIcon className="h-3 w-3" />
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
