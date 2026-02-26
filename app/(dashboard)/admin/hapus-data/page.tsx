import { getLayananWithResponseCount } from "@/app/action/delete";
import Link from "next/link";

export default async function HapusDataPage() {
  const layananList = await getLayananWithResponseCount();
  const success = false; // handled client-side via searchParams if needed

  const totalRespons = layananList.reduce((acc, l) => acc + l.count, 0);
  const withData = layananList.filter((l) => l.count > 0);

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">

      {/* TOP NAV BAR */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 lg:hidden" />
        <div className="w-1 h-6 bg-red-500" />
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-400 hidden sm:block">
            BKPSDM Kepulauan Anambas
          </p>
          <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none">
            Hapus Data Survei
          </h1>
        </div>
        <Link
          href="/admin"
          className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#132B4F] transition-colors"
        >
          ← Kembali
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-4">

        {/* WARNING BANNER */}
        <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <div className="w-1 self-stretch bg-red-500 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">
              ⚠ Peringatan: Tindakan Tidak Dapat Dibatalkan
            </p>
            <p className="text-xs text-red-500 font-medium leading-relaxed">
              Menghapus data survei akan menghapus seluruh respon secara permanen dari database.
              Data yang telah dihapus <strong>tidak dapat dipulihkan</strong>. Pastikan Anda sudah melakukan ekspor data sebelum melanjutkan.
            </p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-1 bg-[#009CC5]" />
            <div className="p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Total Layanan</p>
              <p className="text-3xl font-black text-[#132B4F]">{layananList.length}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-1 bg-[#FAE705]" />
            <div className="p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Layanan Berdata</p>
              <p className="text-3xl font-black text-[#132B4F]">{withData.length}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 overflow-hidden col-span-2 lg:col-span-1">
            <div className="h-1 bg-red-400" />
            <div className="p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">Total Respon (Semua)</p>
              <p className="text-3xl font-black text-[#132B4F]">{totalRespons}</p>
            </div>
          </div>
        </div>

        {/* LAYANAN TABLE */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-red-500 via-[#132B4F] to-[#009CC5]" />
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <div className="w-0.5 h-4 bg-red-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
              Pilih Layanan untuk Dihapus
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "#132B4F" }}>
                  {["#", "Nama Layanan", "Jumlah Respon", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {layananList.map((layanan, i) => (
                  <tr key={layanan.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 text-[10px] font-black text-gray-300">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-[#132B4F]">{layanan.nama}</td>
                    <td className="px-4 py-3">
                      {layanan.count > 0 ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black">
                          {layanan.count} respon
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-black">
                          Kosong
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {layanan.count > 0 ? (
                        <Link
                          href={`/admin/hapus-data/${layanan.id}`}
                          className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors inline-block"
                        >
                          Hapus Data →
                        </Link>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-300 text-[9px] font-black uppercase tracking-widest inline-block cursor-not-allowed">
                          Tidak Ada Data
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}