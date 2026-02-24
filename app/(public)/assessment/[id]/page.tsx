import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SkmForm from "./SkmForm";

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const periode = await prisma.periode.findUnique({
    where: { id },
    include: {
      layanan: { include: { perangkatDaerah: true } }
    }
  });

  if (!periode) return notFound();

  // 🛠️ DATE FIX: Compare dates using start/end of day logic
  const now = new Date();
  const start = new Date(periode.tglMulai);
  start.setHours(0, 0, 0, 0); // Start of day
  
  const end = new Date(periode.tglSelesai);
  end.setHours(23, 59, 59, 999); // End of day

  const isExpired = now < start || now > end;
  const isClosed = periode.status !== "AKTIF" || isExpired;

  if (isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white p-10">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black tracking-widest uppercase border border-red-500/30">
            • Portal Closed
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            {periode.label} <br /> <span className="text-red-500">Has Ended</span>
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            Sistem Survei Kepuasan Masyarakat
          </p>
        </div>
      </div>
    );
  }

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