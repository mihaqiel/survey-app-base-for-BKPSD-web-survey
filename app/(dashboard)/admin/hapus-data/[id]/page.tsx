import { getLayananDetail } from "@/app/action/delete";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

export default async function HapusLayananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }    = await params;
  const layanan   = await getLayananDetail(id);

  if (!layanan) notFound();

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">

      {/* TOP NAV BAR */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0 shadow-sm">
        <div className="w-9 lg:hidden" />
        <div className="w-1 h-6 bg-red-500 animate-pulse" />
        <div className="animate-slide-left">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-400 hidden sm:block">
            Konfirmasi Penghapusan
          </p>
          <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none truncate max-w-xs lg:max-w-md">
            {layanan.nama}
          </h1>
        </div>
        <Link
          href="/admin/hapus-data"
          className="btn-shimmer group ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#132B4F] hover:bg-gray-100 px-3 py-2 transition-all duration-200 whitespace-nowrap"
        >
          <span className="flex items-center gap-1">
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            Kembali
          </span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-4">

        {/* DANGER ALERT — animated shimmer */}
        <div className="animate-fade-up relative bg-red-600 text-white p-4 lg:p-5 flex items-start gap-4 overflow-hidden">
          {/* shimmer sweep */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s ease infinite",
            }}
          />
          <div className="relative text-2xl shrink-0 animate-float">🗑</div>
          <div className="relative">
            <p className="text-[11px] font-black uppercase tracking-widest mb-1">
              Anda akan menghapus semua respon survei untuk layanan ini
            </p>
            <p className="text-xs font-medium text-red-100 leading-relaxed">
              Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Seluruh{" "}
              <strong>{layanan.totalCount} respon</strong> akan dihapus dari database.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="animate-slide-left bg-white border border-gray-200 overflow-hidden card-hover">
            <div className="h-1 bg-red-500" />
            <div className="p-4 lg:p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">
                Total Respon akan Dihapus
              </p>
              <p className="text-4xl font-black text-red-600 animate-count-up">{layanan.totalCount}</p>
            </div>
          </div>
          <div className="animate-slide-right bg-white border border-gray-200 overflow-hidden card-hover">
            <div className="h-1 bg-[#132B4F]" />
            <div className="p-4 lg:p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                Menampilkan Preview
              </p>
              <p className="text-4xl font-black text-[#132B4F] animate-count-up">{layanan.preview.length}</p>
              <p className="text-[9px] font-bold text-gray-400 mt-1">dari {layanan.totalCount} total</p>
            </div>
          </div>
        </div>

        {/* PREVIEW TABLE */}
        <div className="animate-fade-up delay-150 bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 bg-[#132B4F] animate-draw-line" />
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#132B4F]" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
              Preview 10 Respon Terbaru
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "#132B4F" }}>
                  {["#", "Nama Responden", "Pegawai Dinilai", "Tgl Layanan", "Avg Score", "JK"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {layanan.preview.map((r: { id: string; nama: string; pegawai: string; tglLayanan: Date; avgScore: number; jenisKelamin: string }, i: number) => (
                  <tr
                    key={r.id}
                    className={`transition-colors duration-150 hover:bg-red-50/30 animate-fade-up ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                  >
                    <td className="px-4 py-3 text-[10px] font-black text-gray-300">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-[#132B4F]">{r.nama}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{r.pegawai}</td>
                    <td className="px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                      {new Date(r.tglLayanan).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#009CC5]/10 text-[#009CC5] text-[9px] font-black">
                        {r.avgScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-medium">{r.jenisKelamin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {layanan.totalCount > 10 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                + {layanan.totalCount - 10} respon lainnya tidak ditampilkan
              </p>
            </div>
          )}
        </div>

        {/* DELETE CONFIRMATION */}
        <div className="animate-fade-up delay-225">
          <DeleteConfirmModal
            layananId={layanan.id}
            layananNama={layanan.nama}
            totalCount={layanan.totalCount}
          />
        </div>

      </div>
    </div>
  );
}