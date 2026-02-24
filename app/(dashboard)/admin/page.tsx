import { getDashboardData, createLayanan, createPeriode, deletePeriode } from "@/app/action/master";
import { logout } from "@/app/action/auth"; 
import Link from "next/link";

export default async function AdminDashboard() {
  const agency = await getDashboardData();

  if (!agency) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400 font-mono text-xs uppercase tracking-widest">
          Initializing System Data...
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-8 font-sans">
      
      {/* 🟢 HEADER SECTION */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-7xl mx-auto">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Secure Admin Portal</h4>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">{agency.nama}</h1>
          <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest border-l-2 border-gray-200 pl-3">
            Audit Log Active • Soft Delete Enabled
          </p>
        </div>
        
        <div className="flex gap-3">
             {/* VIEW LOGS BUTTON */}
             <Link href="/admin/logs" className="flex items-center px-4 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-black transition shadow-sm active:scale-95">
                View Logs
             </Link>

             {/* LOGOUT BUTTON */}
             <form action={logout}>
                <button className="h-full px-6 py-3 bg-white border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition shadow-sm active:scale-95">
                  Log Out
                </button>
             </form>

            {/* ADD SERVICE FORM */}
            <form action={createLayanan} className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <input type="hidden" name="perangkatId" value={agency.id} />
              <input 
                name="nama" 
                placeholder="New Service Name..." 
                required 
                className="px-4 py-2 text-xs font-bold outline-none text-gray-600 bg-transparent w-48" 
              />
              <button className="bg-black text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition active:scale-95">
                + Add
              </button>
            </form>
        </div>
      </header>

      {/* 📂 LAYANAN LIST */}
      <div className="space-y-12 max-w-7xl mx-auto">
        {agency.layanan.length === 0 ? (
           <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No Services Found</h3>
             <p className="text-xs text-gray-300 mt-2">Add a service above to get started.</p>
           </div>
        ) : (
          agency.layanan.map((svc) => (
            <div key={svc.id} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100/50">
              
              {/* SERVICE HEADER */}
              <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">{svc.nama}</h2>
                
                {/* CREATE PERIOD FORM */}
                <form action={createPeriode} className="flex gap-2 items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <span className="text-[9px] font-bold uppercase text-gray-400 pl-2">New Period:</span>
                  <input type="hidden" name="layananId" value={svc.id} />
                  
                  <input name="label" placeholder="e.g. Sem 1" required className="w-24 px-2 py-1 text-xs font-bold border border-gray-200 rounded-lg" />
                  <input name="tglMulai" type="date" required className="px-2 py-1 text-xs border border-gray-200 rounded-lg" />
                  <span className="text-[10px] text-gray-300">➜</span>
                  <input name="tglSelesai" type="date" required className="px-2 py-1 text-xs border border-gray-200 rounded-lg" />
                  
                  <button className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-500/30">
                    +
                  </button>
                </form>
              </div>

              {/* PERIODS GRID */}
              {svc.periode.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No Active Periods</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {svc.periode.map((p) => (
                    <div key={p.id} className="group relative bg-[#FAFAFA] hover:bg-white hover:shadow-xl transition-all duration-300 p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-between">
                      
                      {/* Top: Status & DELETE BUTTON */}
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          p.status === 'AKTIF' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {p.status}
                        </span>
                        
                        {/* 🗑️ FIXED DELETE BUTTON (Now Always Visible) */}
                        <form action={deletePeriode.bind(null, p.id)}>
                           <button 
                             className="text-gray-300 hover:text-red-500 transition-colors p-2" 
                             title="Archive this Period"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                           </button>
                        </form>
                      </div>
                      
                      {/* Middle: Label & Token */}
                      <div className="mb-8">
                        <h3 className="text-lg font-black italic mb-1">{p.label}</h3>
                        <div className="inline-block bg-black text-white px-2 py-1 rounded text-[10px] font-mono tracking-widest uppercase">
                          Token: {p.token || "GENERATING..."}
                        </div>
                      </div>

                      {/* Bottom: Link */}
                      <Link 
                        href={`/admin/periode/${p.id}/analysis`} 
                        className="block w-full bg-white border border-gray-200 text-black py-4 rounded-xl text-center hover:bg-black hover:text-white transition shadow-sm active:scale-95"
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest">View Report & QR →</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}