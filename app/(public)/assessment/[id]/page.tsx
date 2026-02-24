import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SkmForm from "./SkmForm"; // Check this file exists in the same folder
import { verifyToken } from "@/app/action/check-token";

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Period Data
  const periode = await prisma.periode.findUnique({
    where: { id },
    include: {
      layanan: { include: { perangkatDaerah: true } }
    }
  });

  if (!periode) return notFound();

  // 2. Render The Form
  return (
    <main className="min-h-screen bg-white">
      <SkmForm 
        periodeId={periode.id} 
        layananName={periode.layanan.nama}
        agencyName={periode.layanan.perangkatDaerah.nama}
        label={periode.label}
      />
    </main>
  );
}