export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
      <div
        className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      >
        {clamped > 0 && clamped < 100 && (
          <div
            className="absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.5)_50%,transparent_65%)] bg-[length:200%_100%]"
            style={{ animation: "shimmer 2s ease-in-out infinite" }}
          />
        )}
      </div>
    </div>
  );
}
