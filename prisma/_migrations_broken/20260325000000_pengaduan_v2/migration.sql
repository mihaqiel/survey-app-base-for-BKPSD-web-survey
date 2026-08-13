-- AddColumn: nomorUrut as SERIAL — PostgreSQL auto-backfills all existing rows
ALTER TABLE "Pengaduan" ADD COLUMN "nomorUrut" SERIAL NOT NULL;

-- AddColumn: kategori (optional)
ALTER TABLE "Pengaduan" ADD COLUMN "kategori" TEXT;

-- AddColumn: prioritas with default
ALTER TABLE "Pengaduan" ADD COLUMN "prioritas" TEXT NOT NULL DEFAULT 'NORMAL';

-- AddColumn: petugasId (optional FK → Pegawai)
ALTER TABLE "Pengaduan" ADD COLUMN "petugasId" TEXT;
ALTER TABLE "Pengaduan" ADD CONSTRAINT "Pengaduan_petugasId_fkey"
  FOREIGN KEY ("petugasId") REFERENCES "Pegawai"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: PengaduanLog (audit trail)
CREATE TABLE "PengaduanLog" (
  "id"          TEXT         NOT NULL,
  "pengaduanId" TEXT         NOT NULL,
  "aksi"        TEXT         NOT NULL,
  "deskripsi"   TEXT,
  "oleh"        TEXT         NOT NULL DEFAULT 'Admin',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PengaduanLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PengaduanLog_pengaduanId_fkey"
    FOREIGN KEY ("pengaduanId") REFERENCES "Pengaduan"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PengaduanLog_pengaduanId_idx" ON "PengaduanLog"("pengaduanId");
