import { prisma } from "@/lib/prisma";

export interface SurahProgressRow {
  surahNumber: number;
  nameTransliteration: string;
  total: number;
  hafal: number;
}

// Ayah LEFT JOIN AyahProgress gives correct percentages even for surahs the user
// hasn't touched yet, in one cheap query (fixed cardinality: 114 rows) — Prisma's
// groupBy can't express the LEFT JOIN + FILTER combination this needs.
export async function getSurahProgress(userId: string): Promise<SurahProgressRow[]> {
  return prisma.$queryRaw<SurahProgressRow[]>`
    SELECT a."surahNumber"::int AS "surahNumber",
           s."nameTransliteration" AS "nameTransliteration",
           s."ayahCount"::int AS total,
           COUNT(*) FILTER (WHERE ap.status = 'HAFAL')::int AS hafal
    FROM "Ayah" a
    JOIN "Surah" s ON s.number = a."surahNumber"
    LEFT JOIN "AyahProgress" ap ON ap."ayahId" = a.id AND ap."userId" = ${userId}
    GROUP BY a."surahNumber", s."nameTransliteration", s."ayahCount"
    ORDER BY a."surahNumber"
  `;
}

export async function getOverallProgress(userId: string) {
  const rows = await prisma.$queryRaw<{ hafal: number; total: number }[]>`
    SELECT COUNT(*) FILTER (WHERE ap.status = 'HAFAL')::int AS hafal,
           COUNT(*)::int AS total
    FROM "Ayah" a
    LEFT JOIN "AyahProgress" ap ON ap."ayahId" = a.id AND ap."userId" = ${userId}
  `;
  const { hafal, total } = rows[0] ?? { hafal: 0, total: 6236 };
  return { hafal, total, percent: total ? Math.round((hafal / total) * 100) : 0 };
}

export async function getStreak(userId: string): Promise<number> {
  const activities = await prisma.userDailyActivity.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 60,
    select: { date: true },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = today.getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (const activity of activities) {
    const day = new Date(activity.date);
    day.setUTCHours(0, 0, 0, 0);
    const dayTime = day.getTime();

    if (dayTime === cursor) {
      streak++;
      cursor -= DAY_MS;
    } else if (dayTime < cursor) {
      break;
    }
  }

  return streak;
}
