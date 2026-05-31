ALTER TABLE "Reservation"
  ADD COLUMN IF NOT EXISTS "cancelRequestStatus" character varying(20);

ALTER TABLE "Reservation"
  ADD COLUMN IF NOT EXISTS "cancelRequestedAt" timestamp with time zone;

ALTER TABLE "Reservation"
  ADD COLUMN IF NOT EXISTS "cancelRequestResolvedAt" timestamp with time zone;

CREATE INDEX IF NOT EXISTS "Reservation_cancelRequestStatus_idx"
  ON "Reservation" ("cancelRequestStatus");
