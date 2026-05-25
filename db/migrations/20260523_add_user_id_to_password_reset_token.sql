ALTER TABLE "PasswordResetToken"
  ADD COLUMN IF NOT EXISTS "userId" integer;

UPDATE "PasswordResetToken" prt
SET "userId" = u.id
FROM "User" u
WHERE prt."userId" IS NULL
  AND lower(prt.email) = lower(u.email);

DELETE FROM "PasswordResetToken"
WHERE "userId" IS NULL;

ALTER TABLE "PasswordResetToken"
  ALTER COLUMN "userId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PasswordResetToken_userId_fkey'
  ) THEN
    ALTER TABLE "PasswordResetToken"
      ADD CONSTRAINT "PasswordResetToken_userId_fkey"
      FOREIGN KEY ("userId")
      REFERENCES "User"(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx"
  ON "PasswordResetToken" ("userId");
