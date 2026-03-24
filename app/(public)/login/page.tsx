import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Masuk Dashboard — SKM BKPSDM Anambas",
  description: "Halaman masuk untuk administrator dashboard Sistem Survei Kepuasan Masyarakat BKPSDM Kabupaten Kepulauan Anambas.",
};

export default function LoginPage() {
  return <LoginClient />;
}
