"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { GatingError } from "@/lib/errors";

async function materializeAyahProgress(
  tx: Prisma.TransactionClient,
  userId: string,
  surahNumber: number,
  ayahStart: number,
  ayahEnd: number
) {
  const ayat = await tx.ayah.findMany({
    where: { surahNumber, ayahNumber: { gte: ayahStart, lte: ayahEnd } },
    select: { id: true },
  });

  for (const ayah of ayat) {
    await tx.ayahProgress.upsert({
      where: { userId_ayahId: { userId, ayahId: ayah.id } },
      create: { userId, ayahId: ayah.id, status: "NOT_STARTED" },
      update: {},
    });
  }
}

async function bumpDailyActivity(
  tx: Prisma.TransactionClient,
  userId: string,
  delta: { ayahsReviewed?: number; ayahsMemorized?: number; quizAttempts?: number }
) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await tx.userDailyActivity.upsert({
    where: { userId_date: { userId, date: today } },
    create: {
      userId,
      date: today,
      ayahsReviewed: delta.ayahsReviewed ?? 0,
      ayahsMemorized: delta.ayahsMemorized ?? 0,
      quizAttempts: delta.quizAttempts ?? 0,
    },
    update: {
      ayahsReviewed: { increment: delta.ayahsReviewed ?? 0 },
      ayahsMemorized: { increment: delta.ayahsMemorized ?? 0 },
      quizAttempts: { increment: delta.quizAttempts ?? 0 },
    },
  });
}

export async function createMemorizationTarget(input: {
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
}) {
  const userId = await requireUserId();

  if (input.ayahStart > input.ayahEnd) {
    throw new GatingError("Ayat awal tidak boleh lebih besar dari ayat akhir.");
  }

  const surah = await prisma.surah.findUnique({ where: { number: input.surahNumber } });
  if (!surah || input.ayahStart < 1 || input.ayahEnd > surah.ayahCount) {
    throw new GatingError("Rentang ayat tidak valid untuk surah ini.");
  }

  const target = await prisma.$transaction(async (tx) => {
    const duplicate = await tx.memorizationTarget.findUnique({
      where: {
        userId_surahNumber_ayahStart_ayahEnd: {
          userId,
          surahNumber: input.surahNumber,
          ayahStart: input.ayahStart,
          ayahEnd: input.ayahEnd,
        },
      },
    });
    if (duplicate) {
      throw new GatingError(
        `Target ${surah.nameTransliteration} ayat ${input.ayahStart}-${input.ayahEnd} sudah pernah dibuat sebelumnya.`
      );
    }

    const last = await tx.memorizationTarget.findFirst({
      where: { userId },
      orderBy: { sequenceIndex: "desc" },
    });

    if (last && last.status !== "HAFAL") {
      throw new GatingError(
        "Selesaikan dan tandai Hafal target sebelumnya sebelum membuat target baru."
      );
    }

    const created = await tx.memorizationTarget.create({
      data: {
        userId,
        sequenceIndex: (last?.sequenceIndex ?? 0) + 1,
        surahNumber: input.surahNumber,
        ayahStart: input.ayahStart,
        ayahEnd: input.ayahEnd,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    await materializeAyahProgress(tx, userId, input.surahNumber, input.ayahStart, input.ayahEnd);

    return created;
  });

  revalidatePath("/hafalan");
  return target;
}

export async function createTargetFormAction(
  _prevState: string | undefined,
  formData: FormData
) {
  const surahNumber = Number(formData.get("surahNumber"));
  const ayahStart = Number(formData.get("ayahStart"));
  const ayahEnd = Number(formData.get("ayahEnd"));

  if (
    !Number.isInteger(surahNumber) ||
    !Number.isInteger(ayahStart) ||
    !Number.isInteger(ayahEnd)
  ) {
    return "Input tidak valid.";
  }

  let target;
  try {
    target = await createMemorizationTarget({ surahNumber, ayahStart, ayahEnd });
  } catch (error) {
    if (error instanceof GatingError) return error.message;
    throw error;
  }

  redirect(`/hafalan/${target.id}`);
}

export async function markTargetHafal(targetId: string) {
  const userId = await requireUserId();

  await prisma.$transaction(async (tx) => {
    const target = await tx.memorizationTarget.findUniqueOrThrow({ where: { id: targetId } });
    if (target.userId !== userId) throw new GatingError("Target tidak ditemukan.");

    await tx.memorizationTarget.update({
      where: { id: targetId },
      data: { status: "HAFAL", hafalAt: new Date() },
    });

    await tx.ayahProgress.updateMany({
      where: {
        userId,
        ayah: {
          surahNumber: target.surahNumber,
          ayahNumber: { gte: target.ayahStart, lte: target.ayahEnd },
        },
      },
      data: { status: "HAFAL", hafalAt: new Date() },
    });

    await bumpDailyActivity(tx, userId, {
      ayahsMemorized: target.ayahEnd - target.ayahStart + 1,
    });
  });

  revalidatePath("/hafalan");
  revalidatePath("/dashboard");
  revalidatePath("/murojaah");
}

// Murojaah/review of an already-visible ayah is never gated — no sequenceIndex check.
export async function recordReview(ayahId: string) {
  const userId = await requireUserId();

  await prisma.$transaction(async (tx) => {
    await tx.ayahProgress.upsert({
      where: { userId_ayahId: { userId, ayahId } },
      create: {
        userId,
        ayahId,
        status: "IN_PROGRESS",
        firstStudiedAt: new Date(),
        lastRevisedAt: new Date(),
        revisionCount: 1,
      },
      update: {
        lastRevisedAt: new Date(),
        revisionCount: { increment: 1 },
      },
    });

    await bumpDailyActivity(tx, userId, { ayahsReviewed: 1 });
  });

  revalidatePath("/murojaah");
}
