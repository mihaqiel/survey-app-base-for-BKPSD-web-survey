import type { Metadata } from "next";
import PengaduanClient from "./PengaduanClient";

export const metadata: Metadata = {
  title: "Pengaduan Masyarakat — BKPSDM Kab. Kepulauan Anambas",
  description:
    "Sampaikan pengaduan, saran, atau masukan Anda terkait pelayanan BKPSDM Kabupaten Kepulauan Anambas.",
};

export default function PengaduanPage() {
  return <PengaduanClient />;
}
