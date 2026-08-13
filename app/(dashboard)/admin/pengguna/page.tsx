import type { Metadata } from "next";
import PenggunaClient from "./PenggunaClient";

export const metadata: Metadata = {
  title: "Pengguna Dashboard — Admin BKPSDM Anambas",
  description: "Kelola akun yang memiliki akses ke dashboard admin.",
};

export default function PenggunaPage() {
  return <PenggunaClient />;
}
