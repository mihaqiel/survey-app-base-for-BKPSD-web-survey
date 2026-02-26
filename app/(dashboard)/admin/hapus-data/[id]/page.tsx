import { getLayananDetail } from "@/app/action/delete";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

export default async function HapusLayananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const layanan = await getLayananDetail(id);

  if (!layanan) notFound();

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">

      {/* TOP NAV BAR */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 lg:hidden" />
        <div className="w-1 h-6 bg-red-500" />
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-400 hidden sm:block">
            Konfirmasi Penghapusan
          </p>
          <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none truncate max-w-xs lg:max-w-md">
            {layanan.nama}
          </h1>
        </div>
        <Link
          href="/admin/hapus-data"
          className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#132B4F] transition-colors whitespace-nowrap"
        >
          ← Kembali
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-4">

        {/* DANGER ALERT */}
        <div className="bg-red-600 text-white p-4 lg:p-5 flex items-start gap-4">
          <div className="text-2xl shrink-0">🗑</div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest mb-1">
              Anda akan menghapus semua respon survei untuk layanan ini
            </p>
            <p className="text-xs font-medium text-red-100 leading-relaxed">
              Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Seluruh{" "}
              <strong>{layanan.totalCount} respon</strong> akan dihapus dari database.
            </p>
          </div>
        </div>

        {/* STAT */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-1 bg-red-500" />
            <div className="p-4 lg:p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">
                Total Respon akan Dihapus
              </p>
              <p className="text-4xl font-black text-red-600">{layanan.totalCount}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-1 bg-[#132B4F]" />
            <div className="p-4 lg:p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                Menampilkan Preview
              </p>
              <p className="text-4xl font-black text-[#132B4F]">{layanan.preview.length}</p>
              <p className="text-[9px] font-bold text-gray-400 mt-1">dari {layanan.totalCount} total</p>
            </div>
          </div>
        </div>

        {/* PREVIEW TABLE */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 bg-[#132B4F]" />
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
                {layanan.preview.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 text-[10px] font-black text-gray-300">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-[#132B4F]">{r.nama}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{r.pegawai}</td>
                    <td className="px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                      {new Date(r.tglLayanan).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
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

        {/* DELETE CONFIRMATION COMPONENT */}
        <DeleteConfirmModal layananId={layanan.id} layananNama={layanan.nama} totalCount={layanan.totalCount} />

      </div>
    </div>
  );
}