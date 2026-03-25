import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/app/action/auth";
import { redirect, notFound } from "next/navigation";
import PengaduanDetailClient from "./PengaduanDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.pengaduan.findUnique({
    where: { id },
    select: { judul: true, nomorUrut: true, createdAt: true },
  });
  if (!p) return { title: "Pengaduan tidak ditemukan" };
  const year = new Date(p.createdAt).getFullYear();
  const ticket = `PGD-${year}-${String(p.nomorUrut).padStart(5, "0")}`;
  return { title: `${ticket} — ${p.judul}` };
}

export default async function PengaduanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ok = await isAdmin();
  if (!ok) redirect("/login");
  const { id } = await params;

  const pengaduan = await prisma.pengaduan.findUnique({
    where: { id },
    include: {
      lampiran: {
        select: { id: true, mimeType: true, nama: true, urutan: true },
        orderBy: { urutan: "asc" },
      },
      log: { orderBy: { createdAt: "asc" } },
      petugas: { select: { id: true, nama: true } },
    },
  });
  if (!pengaduan) notFound();

  // Fetch all pegawai for assignment dropdown
  const pegawaiList = await prisma.pegawai.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: "asc" },
  });

  // Strip binary lampiran data (not serializable to client)
  const safeData = {
    ...pengaduan,
    lampiran: pengaduan.lampiran.map(({ id, mimeType, nama, urutan }) => ({
      id,
      mimeType,
      nama,
      urutan,
    })),
  };

  return <PengaduanDetailClient data={safeData} pegawaiList={pegawaiList} />;
}
