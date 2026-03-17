-- CreateTable Admin (if not exists)
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin"("username");

-- CreateTable LogActivity (if not exists)
CREATE TABLE IF NOT EXISTS "LogActivity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogActivity_pkey" PRIMARY KEY ("id")
);

-- Add new columns to existing tables
ALTER TABLE "Respon"  ADD COLUMN IF NOT EXISTS "rating"    INTEGER;
ALTER TABLE "Layanan" ADD COLUMN IF NOT EXISTS "kategori"  TEXT;
ALTER TABLE "Periode" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "Periode" ADD COLUMN IF NOT EXISTS "endDate"   TIMESTAMP(3);