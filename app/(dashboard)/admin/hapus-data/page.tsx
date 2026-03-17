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
        "Klik tombol 'Hapus Respon →' pada layanan yang ingin dihapus responnya.",
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
    <div className="min-h-screen bg-[#F0F4F8] font-sans flex flex-col">

      {/* GLOBAL HEADER */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-red-500 animate-pulse" />
          <div className="animate-slide-left">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Hapus Data Survei" }]} />
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none mt-0.5">
              Pusat Penghapusan Data
            </h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 animate-fade-in delay-150">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200">
            <span className="text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse">⚠ Danger Zone</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-8 py-6 gap-4">

        {/* SUCCESS BANNER */}
        {success === "1" && (
          <div className="animate-fade-down bg-green-50 border border-green-200 px-5 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-green-600 shrink-0 animate-bounce-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[10px] font-black uppercase tracking-widest text-green-700">
              Data berhasil dihapus secara permanen.
            </p>
          </div>
        )}

        {/* WARNING BANNER — animated pulse border */}
        <div className="animate-fade-up delay-75 relative bg-red-50 border border-red-200 p-4 flex items-start gap-3 overflow-hidden">
          {/* animated left accent */}
          <div className="w-1 self-stretch bg-red-500 shrink-0 animate-pulse" />
          {/* subtle shimmer overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(239,68,68,0.04) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease infinite",
            }}
          />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1 flex items-center gap-2">
              <span className="animate-pulse">⚠</span>
              Danger Zone — Semua Tindakan Bersifat Permanen
            </p>
            <p className="text-xs text-red-500 font-medium leading-relaxed">
              Data yang dihapus tidak dapat dipulihkan. Pastikan Anda sudah melakukan ekspor data sebelum melanjutkan.
            </p>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="animate-fade-up delay-150 flex border-b border-gray-200 bg-white -mx-0">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/hapus-data?tab=${t.key}`}
              className={`relative px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap overflow-hidden group ${
                tab === t.key
                  ? "border-b-2 border-red-500 text-red-600 bg-red-50"
                  : "border-b-2 border-transparent text-gray-400 hover:text-[#132B4F] hover:bg-gray-50"
              }`}
            >
              {/* tab hover fill */}
              {tab !== t.key && (
                <span className="absolute inset-0 bg-gray-100 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200" />
              )}
              <span className="relative">{t.label}</span>
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-red-500 animate-draw-line" />
              )}
            </Link>
          ))}
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="flex gap-5 flex-1 min-h-0" style={{ height: "calc(100vh - 320px)" }}>

          {/* ── LEFT: LIST ── */}
          <div className="animate-slide-left w-[55%] flex flex-col bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-red-500 via-[#132B4F] to-[#009CC5]" />

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100 bg-[#F0F4F8]">
              <DangerSearch placeholder={`Cari ${entityLabel.toLowerCase()}...`} />
            </div>

            {/* Column headers */}
            <div className="shrink-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#132B4F]">
                    <th className="text-left pl-5 pr-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-white w-8">#</th>
                    <th className="text-left px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-white">
                      Nama {entityLabel}
                    </th>
                    <th className="text-left px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-white w-28">Respon</th>
                    <th className="text-left px-2 pr-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white w-36">Aksi</th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-100">
                  {listData.map((item: { id: string; nama: string; count: number }, i: number) => (
                    <tr
                      key={item.id}
                      data-entity-row
                      data-name={item.nama.toLowerCase()}
                      className={`transition-colors duration-150 hover:bg-red-50/40 animate-fade-up ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                      style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                    >
                      <td className="pl-5 pr-2 py-3 text-[10px] font-black text-gray-300 w-8">{i + 1}</td>
                      <td className="px-2 py-3 font-bold text-[#132B4F] text-xs">{item.nama}</td>
                      <td className="px-2 py-3 w-28">
                        {item.count > 0
                          ? <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black">{item.count}</span>
                          : <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-black">0</span>
                        }
                      </td>
                      <td className="px-2 pr-4 py-3 w-36">
                        {tab === "respon" ? (
                          item.count > 0
                            ? <Link
                                href={`/admin/hapus-data/${item.id}`}
                                className="btn-shimmer inline-block px-3 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 hover:scale-[1.04] transition-all duration-200 active:scale-[0.97]"
                              >
                                Hapus Respon →
                              </Link>
                            : <span className="px-3 py-1.5 bg-gray-100 text-gray-300 text-[9px] font-black uppercase tracking-widest inline-block cursor-not-allowed">
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

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-gray-100 bg-[#F0F4F8] shrink-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                {listData.length} {entityLabel.toLowerCase()} terdaftar
              </p>
            </div>
          </div>

          {/* ── RIGHT: INSTRUCTIONS ── */}
          <div className="animate-slide-right flex-1 flex flex-col gap-4">

            {/* How to use */}
            <div className="bg-[#132B4F] border border-gray-200 overflow-hidden flex flex-col flex-1">
              <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5] animate-draw-line" />
              <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
                <div className="w-0.5 h-4 bg-[#FAE705]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Cara Menggunakan</p>
              </div>
              <div className="px-6 py-5 flex flex-col gap-5 flex-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] mb-3">
                    {activeInstructions.title}
                  </p>
                  <div className="space-y-3">
                    {activeInstructions.steps.map((s, i) => (
                      <div
                        key={i}
                        className="flex gap-3 items-start animate-fade-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="w-6 h-6 bg-[#009CC5] flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5 transition-transform duration-200 hover:scale-110">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <p className="text-xs font-medium text-white/70 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div className="mt-auto border-t border-white/10 pt-4">
                  <div className="animate-fade-up flex items-start gap-3 bg-red-900/30 border border-red-500/30 p-3">
                    <div className="w-1 self-stretch bg-red-400 shrink-0 animate-pulse" />
                    <p className="text-[10px] font-medium text-red-300 leading-relaxed">
                      {activeInstructions.note}
                    </p>
                  </div>
                </div>

                {/* Confirmation flow */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Alur Konfirmasi</p>
                  <div className="flex items-center gap-2">
                    {[
                      { label: "Admin PIN",   color: "#009CC5" },
                      { label: "Ketik HAPUS", color: "#d97706" },
                      { label: "Eksekusi",    color: "#dc2626" },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 flex-1 animate-fade-up"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div
                          className="flex-1 px-2 py-2 text-center border transition-all duration-200 hover:scale-[1.04] cursor-default"
                          style={{ borderColor: s.color + "40", backgroundColor: s.color + "15" }}
                        >
                          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: s.color }}>
                            {s.label}
                          </p>
                        </div>
                        {i < 2 && <span className="text-white/20 font-bold shrink-0">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats summary */}
            <div className="animate-fade-up delay-300 bg-white border border-gray-200 overflow-hidden">
              <div className="h-0.5 bg-[#009CC5]" />
              <div className="px-5 py-4 grid grid-cols-3 divide-x divide-gray-100">
                {[
                  { label: "Total Layanan", val: layananList.length,                               color: "text-[#132B4F]", accent: "" },
                  { label: "Total Pegawai", val: pegawaiList.length,                               color: "text-[#132B4F]", accent: "" },
                  { label: "Total Respon",  val: layananList.reduce((s: number, l: { count: number }) => s + l.count, 0),     color: "text-red-600",   accent: "text-red-400" },
                ].map((stat, i) => (
                  <div key={stat.label} className={`animate-count-up ${i === 0 ? "pr-4" : i === 1 ? "px-4" : "pl-4"}`} style={{ animationDelay: `${i * 80}ms` }}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${stat.accent || "text-gray-400"}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
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