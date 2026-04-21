-- AlterTable: add openId column to TikTokAccount (nullable, unique)
ALTER TABLE "TikTokAccount" ADD COLUMN "openId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TikTokAccount_openId_key" ON "TikTokAccount"("openId");
