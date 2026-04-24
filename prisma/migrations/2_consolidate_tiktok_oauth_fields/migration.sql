-- Consolidated migration: add openId and displayName to TikTokAccount
-- Uses IF NOT EXISTS / conditional guards so it is safe to run against a database
-- that already had either of the two previous conflicting migrations applied
-- (1_add_tiktok_open_id or 1_add_tiktok_oauth_fields).

-- Step 1: Add openId as nullable first so we can back-fill existing rows safely.
ALTER TABLE "TikTokAccount" ADD COLUMN IF NOT EXISTS "openId" TEXT;

-- Step 2: Add displayName (optional field).
ALTER TABLE "TikTokAccount" ADD COLUMN IF NOT EXISTS "displayName" TEXT;

-- Step 3: Back-fill any rows that still have NULL or empty openId with a clearly
-- marked placeholder so these accounts are obviously distinguishable from real
-- TikTok open_ids. They will need to re-authenticate via TikTok OAuth.
UPDATE "TikTokAccount" SET "openId" = 'PLACEHOLDER_' || "id" WHERE "openId" IS NULL OR "openId" = '';

-- Step 4: Now that every row has a value, enforce NOT NULL.
ALTER TABLE "TikTokAccount" ALTER COLUMN "openId" SET NOT NULL;

-- Step 5: Drop the old single-column unique index added by 1_add_tiktok_open_id,
-- if it still exists.
DROP INDEX IF EXISTS "TikTokAccount_openId_key";

-- Step 6: Create the composite unique index required by the current schema.
CREATE UNIQUE INDEX IF NOT EXISTS "TikTokAccount_userId_openId_key"
    ON "TikTokAccount"("userId", "openId");
