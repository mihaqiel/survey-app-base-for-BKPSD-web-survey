-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Periode" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Global Access',
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "token" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Periode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layanan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT,

    CONSTRAINT "Layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pegawai" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Respon" (
    "id" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "layananId" TEXT NOT NULL,
    "pegawaiId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "usia" INTEGER NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "pendidikan" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "isDifabel" TEXT NOT NULL,
    "jenisDisabilitas" TEXT,
    "tglLayanan" TIMESTAMP(3) NOT NULL,
    "u1" INTEGER NOT NULL,
    "u2" INTEGER NOT NULL,
    "u3" INTEGER NOT NULL,
    "u4" INTEGER NOT NULL,
    "u5" INTEGER NOT NULL,
    "u6" INTEGER NOT NULL,
    "u7" INTEGER NOT NULL,
    "u8" INTEGER NOT NULL,
    "u9" INTEGER NOT NULL,
    "rating" INTEGER,
    "saran" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fingerprintHash" TEXT,
    "answerHash" TEXT,
    "similarityScore" DOUBLE PRECISION,
    "responStatus" TEXT NOT NULL DEFAULT 'normal',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "Respon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogActivity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FingerprintBlacklist" (
    "id" TEXT NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'admin',
    "note" TEXT,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FingerprintBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoBlockRule" (
    "id" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "windowHours" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutoBlockRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedIp" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,
    "messageAt" TIMESTAMP(3),
    "messageEmail" TEXT,

    CONSTRAINT "BlockedIp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penghargaan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "unitKerja" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "catatan" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Penghargaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengaduan" (
    "id" TEXT NOT NULL,
    "nomorUrut" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telepon" TEXT,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "kategori" TEXT,
    "prioritas" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "petugasId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengaduan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengaduanLampiran" (
    "id" TEXT NOT NULL,
    "pengaduanId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PengaduanLampiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengaduanLog" (
    "id" TEXT NOT NULL,
    "pengaduanId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "deskripsi" TEXT,
    "oleh" TEXT NOT NULL DEFAULT 'Admin',
    "visibility" TEXT NOT NULL DEFAULT 'internal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PengaduanLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Periode_token_key" ON "Periode"("token");

-- CreateIndex
CREATE INDEX "Respon_fingerprintHash_idx" ON "Respon"("fingerprintHash");

-- CreateIndex
CREATE INDEX "Respon_periodeId_layananId_fingerprintHash_idx" ON "Respon"("periodeId", "layananId", "fingerprintHash");

-- CreateIndex
CREATE INDEX "Respon_responStatus_idx" ON "Respon"("responStatus");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_isActive_idx" ON "AdminUser"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FingerprintBlacklist_fingerprintHash_key" ON "FingerprintBlacklist"("fingerprintHash");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedIp_ip_key" ON "BlockedIp"("ip");

-- AddForeignKey
ALTER TABLE "Respon" ADD CONSTRAINT "Respon_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respon" ADD CONSTRAINT "Respon_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respon" ADD CONSTRAINT "Respon_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengaduan" ADD CONSTRAINT "Pengaduan_petugasId_fkey" FOREIGN KEY ("petugasId") REFERENCES "Pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengaduanLampiran" ADD CONSTRAINT "PengaduanLampiran_pengaduanId_fkey" FOREIGN KEY ("pengaduanId") REFERENCES "Pengaduan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengaduanLog" ADD CONSTRAINT "PengaduanLog_pengaduanId_fkey" FOREIGN KEY ("pengaduanId") REFERENCES "Pengaduan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

