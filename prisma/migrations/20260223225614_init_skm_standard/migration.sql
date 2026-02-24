-- CreateEnum
CREATE TYPE "StatusPeriode" AS ENUM ('AKTIF', 'DITUTUP', 'ARSIP');

-- CreateTable
CREATE TABLE "PerangkatDaerah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,

    CONSTRAINT "PerangkatDaerah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layanan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "perangkatDaerahId" TEXT NOT NULL,

    CONSTRAINT "Layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Periode" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "layananId" TEXT NOT NULL,
    "tglMulai" TIMESTAMP(3) NOT NULL,
    "tglSelesai" TIMESTAMP(3) NOT NULL,
    "status" "StatusPeriode" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Periode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Respon" (
    "id" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "u1" INTEGER NOT NULL,
    "u2" INTEGER NOT NULL,
    "u3" INTEGER NOT NULL,
    "u4" INTEGER NOT NULL,
    "u5" INTEGER NOT NULL,
    "u6" INTEGER NOT NULL,
    "u7" INTEGER NOT NULL,
    "u8" INTEGER NOT NULL,
    "u9" INTEGER NOT NULL,
    "saran" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Respon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Layanan" ADD CONSTRAINT "Layanan_perangkatDaerahId_fkey" FOREIGN KEY ("perangkatDaerahId") REFERENCES "PerangkatDaerah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periode" ADD CONSTRAINT "Periode_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respon" ADD CONSTRAINT "Respon_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
