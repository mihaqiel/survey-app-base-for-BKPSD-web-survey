import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PortalPage() {
  // 1. Security Check (Middleware usually handles this, but double check)
  const cookieStore = await cookies();
  const token = cookieStore.get("skm_token");
  if (!token) redirect("/enter");

  // 2. Fetch Services
  const services = await prisma.layanan.findMany({
    orderBy: { nama: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Portal SKM Terpadu
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black mb-4">
            Pilih Layanan
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">
            Silakan pilih jenis layanan yang baru saja Anda terima untuk memulai survei kepuasan.
          </p>
        </div>

        {/* 22 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Link 
              key={service.id} 
              href={`/portal/${service.id}`}
              className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {service.nama.charAt(0)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-blue-600">
                  Isi Survei →
                </span>
              </div>
              <h3 className="font-bold text-gray-800 leading-tight group-hover:text-black">
                {service.nama}
              </h3>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
           <p className="text-xs text-gray-400">
             Tidak menemukan layanan? Hubungi petugas kami.
           </p>
        </div>

      </div>
    </div>
  );
}