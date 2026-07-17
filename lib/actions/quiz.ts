"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { compareAyah, type CompareResult } from "@/lib/quran/diff";
import type { CompareMode } from "@/lib/quran/normalize";

export async function submitQuizAttempt(
  ayahId: string,
  rawInput: string,
  mode: CompareMode
): Promise<CompareResult> {
  const userId = await requireUserId();

  const ayah = await prisma.ayah.findUniqueOrThrow({ where: { id: ayahId } });
  const result = compareAyah(ayah.textUthmani, rawInput, mode);

  await prisma.$transaction(async (tx) => {
    await tx.quizAttempt.create({
      data: {
        userId,
        ayahId,
        mode: mode.toUpperCase(),
        rawInput,
        scorePercent: result.scorePercent,
        diffJson: JSON.parse(JSON.stringify(result.ops)),
      },
    });

    // Only NOT_STARTED -> IN_PROGRESS is safe to set automatically here; an already
    // HAFAL ayah being re-practiced (murojaah) must never be silently downgraded.
    await tx.ayahProgress.upsert({
      where: { userId_ayahId: { userId, ayahId } },
      create: {
        userId,
        ayahId,
        status: "IN_PROGRESS",
        firstStudiedAt: new Date(),
      },
      update: {},
    });
    await tx.ayahProgress.updateMany({
      where: { userId, ayahId, status: "NOT_STARTED" },
      data: { status: "IN_PROGRESS", firstStudiedAt: new Date() },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await tx.userDailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, quizAttempts: 1 },
      update: { quizAttempts: { increment: 1 } },
    });
  });

  return result;
}
