"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { normalizeArabic } from "@/lib/quran/normalize";

export interface BlankAnswer {
  index: number;
  expected: string;
  answer: string;
}

export interface BlankResult extends BlankAnswer {
  correct: boolean;
}

export interface SambungAyatResult {
  scorePercent: number;
  results: BlankResult[];
}

export async function submitSambungAyat(
  ayahId: string,
  blanks: BlankAnswer[]
): Promise<SambungAyatResult> {
  const userId = await requireUserId();

  const results: BlankResult[] = blanks.map((b) => ({
    ...b,
    correct: normalizeArabic(b.answer, "lenient") === normalizeArabic(b.expected, "lenient"),
  }));

  const correctCount = results.filter((r) => r.correct).length;
  const scorePercent = results.length ? Math.round((correctCount / results.length) * 100) : 0;

  await prisma.$transaction(async (tx) => {
    await tx.quizAttempt.create({
      data: {
        userId,
        ayahId,
        mode: "SAMBUNG_AYAT",
        rawInput: blanks.map((b) => b.answer).join(" "),
        scorePercent,
        diffJson: JSON.parse(JSON.stringify(results)),
      },
    });

    // Same rule as the retype quiz: only NOT_STARTED -> IN_PROGRESS auto-advances;
    // an already HAFAL ayah being drilled again (murojaah) is never downgraded.
    await tx.ayahProgress.upsert({
      where: { userId_ayahId: { userId, ayahId } },
      create: { userId, ayahId, status: "IN_PROGRESS", firstStudiedAt: new Date() },
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

  return { scorePercent, results };
}
