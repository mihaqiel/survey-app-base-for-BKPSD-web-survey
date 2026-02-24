/*
  Warnings:

  - You are about to drop the column `perangkatDaerahId` on the `Layanan` table. All the data in the column will be lost.
  - The `status` column on the `Periode` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[token]` on the table `Periode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `perangkatId` to the `Layanan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Layanan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PerangkatDaerah` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Periode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Layanan" DROP CONSTRAINT "Layanan_perangkatDaerahId_fkey";

-- DropForeignKey
ALTER TABLE "Periode" DROP CONSTRAINT "Periode_layananId_fkey";

-- DropForeignKey
ALTER TABLE "Respon" DROP CONSTRAINT "Respon_periodeId_fkey";

-- AlterTable
ALTER TABLE "Layanan" DROP COLUMN "perangkatDaerahId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deskripsi" TEXT,
ADD COLUMN     "perangkatId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AKTIF',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PerangkatDaerah" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Periode" ADD COLUMN     "token" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AKTIF';

-- DropEnum
DROP TYPE "StatusPeriode";

-- CreateTable
CREATE TABLE "LogActivity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Periode_token_key" ON "Periode"("token");

-- AddForeignKey
ALTER TABLE "Layanan" ADD CONSTRAINT "Layanan_perangkatId_fkey" FOREIGN KEY ("perangkatId") REFERENCES "PerangkatDaerah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periode" ADD CONSTRAINT "Periode_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respon" ADD CONSTRAINT "Respon_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
