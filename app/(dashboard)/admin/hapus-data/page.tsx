import { getLayananWithResponseCount, getPegawaiWithResponseCount } from "@/app/action/delete";
import Link from "next/link";
import EntityDeleteModal from "@/app/(dashboard)/admin/components/EntityDeleteModal";
import DeleteConfirmModal from "@/app/(dashboard)/admin/components/DeleteConfirmModal";
import DangerSearch from "@/app/(dashboard)/admin/components/DangerSearchInput";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default async function HapusDataPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; success?: string }>;
}) {
  const { tab = "respon", success } = await searchParams;

  const [layananList, pegawaiList] = await Promise.all([
    getLayananWithResponseCount(),
    getPegawaiWithResponseCount(),
  ]);

  const tabs = [
    { key: "respon",  label: "Hapus Respon" },
    { key: "layanan", label: "Hapus Layanan" },
    { key: "pegawai", label: "Hapus Pegawai" },
  ];

  const instructions: Record<string, { title: string; steps: string[]; note: string }> = {
    respon: {
      title: "Hapus Respon Layanan",
      steps: [
        "Pilih layanan dari daftar di sebelah kiri menggunakan kolom pencarian.",
        "Klik tombol 'Hapus Respon' pada layanan yang ingin dihapus responnya.",
        "Anda akan dibawa ke halaman konfirmasi dengan preview data sebelum penghapusan.",
        "Masukkan Admin PIN, ketik frasa 'HAPUS', lalu konfirmasi penghapusan.",
      ],
      note: "Layanan tidak akan ikut terhapus — hanya data respon survei yang dihapus.",
    },
    layanan: {
      title: "Hapus Layanan",
      steps: [
        "Pilih layanan dari daftar di sebelah kiri.",
        "Klik tombol 'Hapus Permanen' pada baris layanan yang dituju.",
        "Modal konfirmasi 3 langkah akan muncul.",
        "Masukkan Admin PIN → ketik frasa 'HAPUS' → konfirmasi akhir.",
      ],
      note: "Menghapus layanan akan menghapus seluruh respon terkait secara permanen.",
    },
    pegawai: {
      title: "Hapus Pegawai",
      steps: [
        "Pilih pegawai dari daftar di sebelah kiri.",
        "Klik tombol 'Hapus Permanen' pada baris pegawai yang dituju.",
        "Modal konfirmasi 3 langkah akan muncul.",
        "Masukkan Admin PIN → ketik frasa 'HAPUS' → konfirmasi akhir.",
      ],
      note: "Menghapus pegawai akan menghapus semua respon yang terhubung dengan pegawai tersebut.",
    },
  };

  const activeInstructions = instructions[tab];
  const listData    = tab === "pegawai" ? pegawaiList : layananList;
  const entityLabel = tab === "pegawai" ? "Pegawai" : "Layanan";

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans flex flex-col">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div>
          <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Hapus Data Survei" }]} />
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">Pusat Penghapusan Data</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
            <span className="text-xs font-semibold text-red-500">Danger Zone</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-8 py-6 gap-4">

        {/* SUCCESS BANNER */}
        {success === "1" && (
          <div className="bg-green-50 border border-green-100 rounded-lg px-5 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-green-700">Data berhasil dihapus secara permanen.</p>
          </div>
        )}

        {/* WARNING BANNER */}
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
          <div className="w-1 self-stretch bg-red-500 rounded-full shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-600 mb-1">Danger Zone — Semua Tindakan Bersifat Permanen</p>
            <p className="text-sm text-red-500 leading-relaxed">
              Data yang dihapus tidak dapat dipulihkan. Pastikan Anda sudah melakukan ekspor data sebelum melanjutkan.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-lg overflow-hidden">
          {tabs.map((t) => (
            <Link key={t.key} href={`/admin/hapus-data?tab=${t.key}`}
              className={`px-6 py-3 text-xs font-semibold transition-all whitespace-nowrap ${
                tab === t.key
                  ? "border-b-2 border-red-500 text-red-600 bg-red-50"
                  : "border-b-2 border-transparent text-slate-400 hover:text-slate-700 hover:bg-gray-50"
              }`}>
              {t.label}
            </Link>
          ))}
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="flex gap-5 flex-1 min-h-0" style={{ height: "calc(100vh - 320px)" }}>

          {/* LEFT: LIST */}
          <div className="w-[55%] flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <DangerSearch placeholder={`Cari ${entityLabel.toLowerCase()}...`} />
            </div>

            <div className="shrink-0">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="text-left pl-5 pr-2 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
                    <th className="text-left px-2 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama {entityLabel}</th>
                    <th className="text-left px-2 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Respon</th>
                    <th className="text-left px-2 pr-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">Aksi</th>
                  </tr>
                </thead>
              </table>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-50">
                  {listData.map((item: { id: string; nama: string; count: number }, i: number) => (
                    <tr key={item.id} data-entity-row data-name={item.nama.toLowerCase()}
                      className="transition-colors duration-150 hover:bg-red-50/40">
                      <td className="pl-5 pr-2 py-3 text-xs font-medium text-slate-400 w-8">{i + 1}</td>
                      <td className="px-2 py-3 text-sm font-medium text-slate-900">{item.nama}</td>
                      <td className="px-2 py-3 w-28">
                        {item.count > 0
                          ? <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">{item.count}</span>
                          : <span className="px-2.5 py-0.5 bg-gray-100 text-slate-400 text-xs font-semibold rounded-full">0</span>
                        }
                      </td>
                      <td className="px-2 pr-4 py-3 w-36">
                        {tab === "respon" ? (
                          item.count > 0
                            ? <Link href={`/admin/hapus-data/${item.id}`}
                                className="inline-block px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-all">
                                Hapus Respon &rarr;
                              </Link>
                            : <span className="px-3 py-1.5 bg-gray-100 text-slate-300 text-xs font-semibold rounded-lg inline-block cursor-not-allowed">
                                Kosong
                              </span>
                        ) : (
                          <EntityDeleteModal
                            entityId={item.id}
                            entityNama={item.nama}
                            entityType={tab as "layanan" | "pegawai"}
                            linkedCount={item.count}
                            linkedLabel="respon"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 shrink-0">
              <p className="text-xs text-slate-400">{listData.length} {entityLabel.toLowerCase()} terdaftar</p>
            </div>
          </div>

          {/* RIGHT: INSTRUCTIONS */}
          <div className="flex-1 flex flex-col gap-4">

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="px-6 py-5 border-b border-gray-100">
                <p className="text-sm font-semibold text-slate-900">Cara Menggunakan</p>
              </div>
              <div className="px-6 py-5 flex flex-col gap-5 flex-1">
                <div>
                  <p className="text-xs font-semibold text-blue-600 mb-3">{activeInstructions.title}</p>
                  <div className="space-y-3">
                    {activeInstructions.steps.map((s, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 shrink-0 mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto border-t border-gray-100 pt-4">
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-3">
                    <div className="w-1 self-stretch bg-red-400 rounded-full shrink-0" />
                    <p className="text-sm text-red-600 leading-relaxed">{activeInstructions.note}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-slate-400 mb-3">Alur Konfirmasi</p>
                  <div className="flex items-center gap-2">
                    {[
                      { label: "Admin PIN",   color: "#3b82f6" },
                      { label: "Ketik HAPUS", color: "#d97706" },
                      { label: "Eksekusi",    color: "#dc2626" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 flex-1">
                        <div className="flex-1 px-2 py-2 text-center border rounded-lg"
                          style={{ borderColor: s.color + "40", backgroundColor: s.color + "10" }}>
                          <p className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</p>
                        </div>
                        {i < 2 && <span className="text-slate-300 font-bold shrink-0">&rarr;</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats summary */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 grid grid-cols-3 divide-x divide-gray-100">
                {[
                  { label: "Total Layanan", val: layananList.length, color: "text-slate-900" },
                  { label: "Total Pegawai", val: pegawaiList.length, color: "text-slate-900" },
                  { label: "Total Respon",  val: layananList.reduce((s: number, l: { count: number }) => s + l.count, 0), color: "text-red-600" },
                ].map((stat, i) => (
                  <div key={stat.label} className={i === 0 ? "pr-4" : i === 1 ? "px-4" : "pl-4"}>
                    <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
