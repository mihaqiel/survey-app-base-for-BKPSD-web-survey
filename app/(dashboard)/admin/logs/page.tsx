import type { Metadata } from "next";
import LogsClient from "./LogsClient";

export const metadata: Metadata = {
  title: "Audit Log — Admin BKPSDM Anambas",
  description: "Riwayat seluruh aktivitas sistem: pembuatan, pembaruan, penghapusan, dan pengarsipan data.",
};

export default function LogsPage() {
  return <LogsClient />;
}
