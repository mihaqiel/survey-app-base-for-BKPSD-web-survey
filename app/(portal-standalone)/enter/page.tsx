import type { Metadata } from "next";
import EnterClient from "./EnterClient";

export const metadata: Metadata = {
  title: "Masukkan Token Akses — SKM BKPSDM Anambas",
  description: "Masukkan token akses untuk memulai survei kepuasan masyarakat BKPSDM Kabupaten Kepulauan Anambas.",
};

export default function EnterPage() {
  return <EnterClient />;
}
