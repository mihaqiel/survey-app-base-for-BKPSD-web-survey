import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import SkmForm from "./SkmForm";

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Security Check — cookie must exist and reference an active period
  const cookieStore = await cookies();
  const periodeId = cookieStore.get("skm_token")?.value;
  if (!periodeId) redirect("/enter");

  // Verify the period in the cookie is still active (prevents use of stale sessions)
  const activePeriod = await prisma.periode.findFirst({
    where: { id: periodeId, status: "AKTIF" },
    select: { id: true },
  });
  if (!activePeriod) redirect("/enter");

  // 2. Fetch Service Details
  const service = await prisma.layanan.findUnique({
    where: { id },
  });

  if (!service) notFound();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <SkmForm
        layananId={service.id}
        layananName={service.nama}
        agencyName="Badan Kepegawaian dan Pengembangan Sumber Daya Manusia"
      />
    </div>
  );
}