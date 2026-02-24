import { getServiceEmployeeStats } from "@/app/action/admin";
import EmployeeTable from "./EmployeeTable"; 

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ... existing fetching for activePeriod ...
  const employeeStats = await getServiceEmployeeStats(activePeriod.id, id);

  return (
    <div className="space-y-8">
      {/* ... Charts and Overview cards ... */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <EmployeeTable data={employeeStats} />
         
         <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] flex flex-col justify-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Informasi</h3>
            <p className="text-xl font-bold leading-snug">
              Data di samping menampilkan performa petugas khusus untuk layanan ini. Gunakan data ini untuk evaluasi berkala petugas loket.
            </p>
         </div>
      </div>
    </div>
  );
}