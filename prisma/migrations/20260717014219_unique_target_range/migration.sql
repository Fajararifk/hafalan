-- CreateIndex
CREATE UNIQUE INDEX "MemorizationTarget_userId_surahNumber_ayahStart_ayahEnd_key" ON "MemorizationTarget"("userId", "surahNumber", "ayahStart", "ayahEnd");
