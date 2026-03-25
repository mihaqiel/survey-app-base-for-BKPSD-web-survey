import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/app/action/auth";
import { redirect } from "next/navigation";
import PengaduanDashboard from "./PengaduanDashboard";

export const metadata = {
  title: "Pengaduan Masyarakat — Admin BKPSDM",
  description: "Kelola dan tindak lanjuti pengaduan masyarakat yang masuk.",
};

export default async function PengaduanAdminPage() {
  const ok = await isAdmin();
  if (!ok) redirect("/login");

  const pengaduan = await prisma.pengaduan.findMany({
    select: {
      id: true,
      nomorUrut: true,
      nama: true,
      email: true,
      telepon: true,
      judul: true,
      isi: true,
      kategori: true,
      prioritas: true,
      status: true,
      petugasId: true,
      createdAt: true,
      lampiran: {
        select: { id: true, mimeType: true, nama: true, urutan: true },
        orderBy: { urutan: "asc" },
      },
      petugas: { select: { id: true, nama: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <PengaduanDashboard initialData={pengaduan} />;
}
