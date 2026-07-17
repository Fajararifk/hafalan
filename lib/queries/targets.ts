import { prisma } from "@/lib/prisma";

export async function getTargets(userId: string) {
  return prisma.memorizationTarget.findMany({
    where: { userId },
    orderBy: { sequenceIndex: "asc" },
    include: { surah: true },
  });
}

export async function getLatestTarget(userId: string) {
  return prisma.memorizationTarget.findFirst({
    where: { userId },
    orderBy: { sequenceIndex: "desc" },
    include: { surah: true },
  });
}

export async function canCreateNewTarget(userId: string): Promise<boolean> {
  const latest = await getLatestTarget(userId);
  return !latest || latest.status === "HAFAL";
}

export async function getTargetWithAyat(targetId: string, userId: string) {
  const target = await prisma.memorizationTarget.findFirst({
    where: { id: targetId, userId },
    include: { surah: true },
  });
  if (!target) return null;

  const ayat = await prisma.ayah.findMany({
    where: {
      surahNumber: target.surahNumber,
      ayahNumber: { gte: target.ayahStart, lte: target.ayahEnd },
    },
    orderBy: { ayahNumber: "asc" },
    include: { progress: { where: { userId } } },
  });

  return { target, ayat };
}
