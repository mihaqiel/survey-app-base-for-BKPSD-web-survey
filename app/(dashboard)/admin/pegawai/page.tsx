import type { Metadata } from "next";
import PegawaiClient from "./PegawaiClient";

export const metadata: Metadata = {
  title: "Data Pegawai — Admin BKPSDM Anambas",
  description: "Kelola daftar pegawai dan lihat skor IKM kinerja layanan.",
};

export default function PegawaiPage() {
  return <PegawaiClient />;
}
