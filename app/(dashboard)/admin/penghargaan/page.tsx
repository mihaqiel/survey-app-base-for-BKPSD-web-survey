import type { Metadata } from "next";
import PenghargaanClient from "./PenghargaanClient";

export const metadata: Metadata = { title: "Penghargaan — Admin SIMBA" };

export default function PenghargaanPage() {
  return <PenghargaanClient />;
}
