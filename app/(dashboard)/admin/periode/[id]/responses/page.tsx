import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Responses with Feedback
  const periode = await prisma.periode.findUnique({
    where: { id },
    include: {
      layanan: { select: { nama: true } },
      respon: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!periode) return notFound();

  // Filter only responses with text feedback for the top section
  const feedbackList = periode.respon.filter(r => r.saran && r.saran.trim() !== "");

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href={`/admin/periode/${id}/analysis`} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-4 block transition-colors">
            ← Back to Analysis
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Citizen Feedback</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            {periode.layanan.nama} • {periode.label}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400">
          {feedbackList.length} Comments
        </div>
      </div>

      {/* FEEDBACK GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbackList.length === 0 ? (
          <div className="col-span-2 text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No Feedback Yet</h3>
            <p className="text-xs text-gray-300 mt-2">Citizens haven't left any written comments.</p>
          </div>
        ) : (
          feedbackList.map((res) => {
            // Calculate individual score avg
            const total = res.u1+res.u2+res.u3+res.u4+res.u5+res.u6+res.u7+res.u8+res.u9;
            const avg = (total / 9).toFixed(1);
            
            return (
              <div key={res.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                   <span className="text-[10px] font-mono text-gray-400 uppercase">
                     {new Date(res.createdAt).toLocaleDateString("id-ID")}
                   </span>
                   <span className={`px-2 py-1 rounded text-[9px] font-black ${
                     Number(avg) >= 3 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                   }`}>
                     AVG: {avg}
                   </span>
                </div>
                <p className="text-sm font-bold text-gray-800 italic">"{res.saran}"</p>
                {res.ipAddress && (
                   <p className="mt-4 text-[9px] font-mono text-gray-300 uppercase">IP: {res.ipAddress}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}