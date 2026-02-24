import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

// ✅ Updated Fix: Points to the file in the current folder
import SkmForm from "./SkmForm"; 

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Security Check
  const cookieStore = await cookies();
  if (!cookieStore.get("skm_token")) redirect("/enter");

  // 2. Fetch Service Details
  const service = await prisma.layanan.findUnique({
    where: { id }
  });

  if (!service) notFound();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <SkmForm 
        layananId={service.id} 
        layananName={service.nama} 
        agencyName="BKPSDM" 
        label="SURVEI KEPUASAN MASYARAKAT"
      />
    </div>
  );
}