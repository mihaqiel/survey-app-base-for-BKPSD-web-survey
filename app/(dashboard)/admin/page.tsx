import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GlobalExportButton from "./GlobalExportButton"; // 👈 Import here

export default async function AdminDashboard() {
  // ... (Keep existing fetch logic) ...
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" },
    include: { _count: { select: { respon: true } } }
  });
  
  // (Assuming you have the rest of the code from previous step)

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Service Monitor</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            {activePeriod?.label || "Loading..."}
          </p>
        </div>
        
        {/* 🟢 NEW EXPORT BUTTON */}
        <GlobalExportButton />
      </div>

      {/* ... (Rest of your Dashboard Grid) ... */}
    </div>
  );
}