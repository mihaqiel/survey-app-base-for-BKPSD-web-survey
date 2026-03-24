import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalForm from "./PortalForm";

export const metadata: Metadata = {
  title: "Portal Survei Kepuasan — BKPSDM Kab. Kepulauan Anambas",
  description: "Isi survei kepuasan masyarakat terhadap layanan BKPSDM Kabupaten Kepulauan Anambas.",
};

export default async function PortalPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("skm_token");
  if (!token) redirect("/enter");
  return <PortalForm />;
}