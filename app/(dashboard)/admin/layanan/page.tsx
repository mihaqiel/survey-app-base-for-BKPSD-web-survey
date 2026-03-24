import type { Metadata } from "next";
import LayananClient from "./LayananClient";

export const metadata: Metadata = {
  title: "Layanan SKM — Admin BKPSDM Anambas",
  description: "Kelola daftar layanan, lihat performa, dan data responden survei kepuasan.",
};

export default function LayananPage() {
  return <LayananClient />;
}
