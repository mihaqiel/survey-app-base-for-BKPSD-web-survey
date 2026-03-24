import type { Metadata } from "next";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
  title: "Survei Terkirim — SKM BKPSDM Anambas",
  description: "Terima kasih telah berpartisipasi dalam Survei Kepuasan Masyarakat BKPSDM Kabupaten Kepulauan Anambas.",
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return <SuccessClient status={status || "success"} />;
}
