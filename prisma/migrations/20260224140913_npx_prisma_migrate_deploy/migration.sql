-- CreateTable
CREATE TABLE "Periode" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Global Access',
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Periode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layanan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

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
    "saran" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Respon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Periode_token_key" ON "Periode"("token");

-- AddForeignKey
ALTER TABLE "Respon" ADD CONSTRAINT "Respon_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respon" ADD CONSTRAINT "Respon_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respon" ADD CONSTRAINT "Respon_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
