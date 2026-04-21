-- AlterTable: add openId (with a temporary default so existing rows are valid)
ALTER TABLE "TikTokAccount" ADD COLUMN "openId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TikTokAccount" ADD COLUMN "displayName" TEXT;

-- Populate openId for any existing rows using their id so the unique constraint can be applied
UPDATE "TikTokAccount" SET "openId" = id WHERE "openId" = '';

-- Remove the temporary default
ALTER TABLE "TikTokAccount" ALTER COLUMN "openId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "TikTokAccount_userId_openId_key" ON "TikTokAccount"("userId", "openId");
