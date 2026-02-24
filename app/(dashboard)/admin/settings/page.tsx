import { prisma } from "@/lib/prisma";
import QrSection from "@/app/(dashboard)/admin/components/QrSection"; Reusing your component

export default async function SettingsPage() {
  // Fetch the Global Active Token
  const globalPeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" }
  });

  if (!globalPeriod) return <div>No Active Global Period Found. Please seed the database.</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">System Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 📱 GENERIC QR CODE CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-6">Global Access QR</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            This QR Code is <strong>Generic</strong>. It points to the main portal. 
            Respondents scan this, then select their service manually.
            One code for all 22 services.
          </p>
          
          <div className="h-[400px]">
            <QrSection 
              token={globalPeriod.token} 
              label={globalPeriod.label} 
              serviceName="PORTAL SKM TERPADU" // Generic Name
            />
          </div>
        </div>

        {/* ⚙️ PERIOD MANAGEMENT */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Active Session</h2>
          <div className="space-y-4">
             <div>
               <label className="text-[10px] font-bold uppercase text-gray-400">Current Token</label>
               <input readOnly value={globalPeriod.token} className="w-full mt-2 p-4 bg-gray-50 rounded-xl font-mono font-bold text-center border border-gray-200" />
             </div>
             <div>
               <label className="text-[10px] font-bold uppercase text-gray-400">Session Name</label>
               <input readOnly value={globalPeriod.label} className="w-full mt-2 p-4 bg-gray-50 rounded-xl font-bold border border-gray-200" />
             </div>
             <div className="pt-4">
               <button className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-colors">
                 Reset / Generate New Token
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}