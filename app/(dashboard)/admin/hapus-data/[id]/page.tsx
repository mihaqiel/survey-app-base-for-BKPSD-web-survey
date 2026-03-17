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
    <div className="min-h-screen bg-gray-50/50 flex flex-col">

      {/* TOP NAV BAR */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center gap-3 shrink-0 shadow-sm">
        <div>
          <p className="text-xs font-semibold text-red-500">Konfirmasi Penghapusan</p>
          <h1 className="text-lg font-bold text-slate-900 truncate max-w-xs lg:max-w-md">{layanan.nama}</h1>
        </div>
        <Link href="/admin/hapus-data"
          className="group ml-auto text-xs font-medium text-slate-400 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all whitespace-nowrap">
          <span className="flex items-center gap-1">
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">&larr;</span>
            Kembali
          </span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-4">

        {/* DANGER ALERT */}
        <div className="bg-red-600 text-white rounded-xl p-4 lg:p-5 flex items-start gap-4">
          <div className="text-2xl shrink-0">&#128465;</div>
          <div>
            <p className="text-sm font-semibold mb-1">
              Anda akan menghapus semua respon survei untuk layanan ini
            </p>
            <p className="text-sm text-red-100 leading-relaxed">
              Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Seluruh{" "}
              <strong>{layanan.totalCount} respon</strong> akan dihapus dari database.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-5">
            <p className="text-xs font-medium text-red-500 mb-1">Total Respon akan Dihapus</p>
            <p className="text-4xl font-bold text-red-600">{layanan.totalCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-5">
            <p className="text-xs font-medium text-slate-500 mb-1">Menampilkan Preview</p>
            <p className="text-4xl font-bold text-slate-900">{layanan.preview.length}</p>
            <p className="text-xs text-slate-400 mt-1">dari {layanan.totalCount} total</p>
          </div>
        </div>

        {/* PREVIEW TABLE */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-slate-900">Preview 10 Respon Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {["#", "Nama Responden", "Pegawai Dinilai", "Tgl Layanan", "Avg Score", "JK"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {layanan.preview.map((r: { id: string; nama: string; pegawai: string; tglLayanan: Date; avgScore: number; jenisKelamin: string }, i: number) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{r.nama}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.pegawai}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(r.tglLayanan).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{r.avgScore}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.jenisKelamin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {layanan.totalCount > 10 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-slate-400">+ {layanan.totalCount - 10} respon lainnya tidak ditampilkan</p>
            </div>
          )}
        </div>

        {/* DELETE CONFIRMATION */}
        <DeleteConfirmModal
          layananId={layanan.id}
          layananNama={layanan.nama}
          totalCount={layanan.totalCount}
        />
      </div>
    </div>
  );
}
