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
