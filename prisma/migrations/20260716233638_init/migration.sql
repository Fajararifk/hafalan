-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'HAFAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Surah" (
    "number" INTEGER NOT NULL,
    "nameArabic" TEXT NOT NULL,
    "nameTransliteration" TEXT NOT NULL,
    "nameTranslationId" TEXT NOT NULL,
    "revelationPlace" TEXT NOT NULL,
    "ayahCount" INTEGER NOT NULL,

    CONSTRAINT "Surah_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "Ayah" (
    "id" TEXT NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL,
    "globalNumber" INTEGER NOT NULL,
    "textUthmani" TEXT NOT NULL,
    "juzNumber" INTEGER NOT NULL,
    "pageNumber" INTEGER NOT NULL,

    CONSTRAINT "Ayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuranSourceMeta" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checksum" TEXT NOT NULL,
    "verseCount" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "QuranSourceMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AyahProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ayahId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "firstStudiedAt" TIMESTAMP(3),
    "hafalAt" TIMESTAMP(3),
    "lastRevisedAt" TIMESTAMP(3),
    "revisionCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AyahProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemorizationTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sequenceIndex" INTEGER NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahStart" INTEGER NOT NULL,
    "ayahEnd" INTEGER NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "hafalAt" TIMESTAMP(3),

    CONSTRAINT "MemorizationTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ayahId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "rawInput" TEXT NOT NULL,
    "scorePercent" DOUBLE PRECISION NOT NULL,
    "diffJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "ayahsReviewed" INTEGER NOT NULL DEFAULT 0,
    "ayahsMemorized" INTEGER NOT NULL DEFAULT 0,
    "quizAttempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserDailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Ayah_globalNumber_key" ON "Ayah"("globalNumber");

-- CreateIndex
CREATE INDEX "Ayah_juzNumber_idx" ON "Ayah"("juzNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ayah_surahNumber_ayahNumber_key" ON "Ayah"("surahNumber", "ayahNumber");

-- CreateIndex
CREATE INDEX "AyahProgress_userId_status_idx" ON "AyahProgress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AyahProgress_userId_ayahId_key" ON "AyahProgress"("userId", "ayahId");

-- CreateIndex
CREATE INDEX "MemorizationTarget_userId_status_idx" ON "MemorizationTarget"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MemorizationTarget_userId_sequenceIndex_key" ON "MemorizationTarget"("userId", "sequenceIndex");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_ayahId_idx" ON "QuizAttempt"("userId", "ayahId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyActivity_userId_date_key" ON "UserDailyActivity"("userId", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ayah" ADD CONSTRAINT "Ayah_surahNumber_fkey" FOREIGN KEY ("surahNumber") REFERENCES "Surah"("number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AyahProgress" ADD CONSTRAINT "AyahProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AyahProgress" ADD CONSTRAINT "AyahProgress_ayahId_fkey" FOREIGN KEY ("ayahId") REFERENCES "Ayah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemorizationTarget" ADD CONSTRAINT "MemorizationTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemorizationTarget" ADD CONSTRAINT "MemorizationTarget_surahNumber_fkey" FOREIGN KEY ("surahNumber") REFERENCES "Surah"("number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_ayahId_fkey" FOREIGN KEY ("ayahId") REFERENCES "Ayah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyActivity" ADD CONSTRAINT "UserDailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
