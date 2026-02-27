export const dynamic = "force-dynamic";

import { getAllLayanan, createLayanan, deleteLayanan } from "@/app/action/admin";
import Link from "next/link";

export default async function ServiceManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const services = await getAllLayanan();
  const { action } = await searchParams;
  const showAddForm = action === "add";

  if (showAddForm) {
    return (
      <div className="min-h-screen font-sans bg-[#F0F4F8]">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-7 bg-[#FAE705]" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Layanan</p>
              <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F] leading-none">Buat Layanan Baru</h1>
            </div>
          </div>
          <Link href="/admin/layanan"
            className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
            ← Kembali ke Layanan
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORM */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-[#009CC5]" />
            <div className="p-8">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-6">Detail Layanan</p>
              <form action={createLayanan} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Nama Layanan <span className="text-red-400">*</span>
                  </label>
                  <input name="nama" type="text" required placeholder="e.g. Layanan Mutasi"
                    className="w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-colors"
                  />
                </div>
                <button type="submit"
                  className="w-full py-4 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] transition-colors">
                  + Buat Layanan Ini
                </button>
              </form>
            </div>
          </div>

          {/* INFO */}
          <div className="bg-[#132B4F] border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />
            <div className="p-8 space-y-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-2">Tentang Fitur Ini</p>
                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Layanan yang ditambahkan akan langsung muncul di portal survei publik, memungkinkan responden memilihnya saat mengisi survei SKM.
                </p>
              </div>
              <div className="border-t border-white/10 pt-6 space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">Panduan</p>
                {[
                  "Gunakan nama layanan resmi sesuai dokumen Standar Pelayanan.",
                  "Setiap layanan dilacak terpisah di analitik dengan skor IKM-nya sendiri.",
                  "Menghapus layanan akan menghapus semua respons terkait secara permanen.",
                  "Sistem mendukung hingga 22 layanan sesuai Permenpan RB 14/2017.",
                ].map((text, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 bg-[#009CC5] flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <p className="text-xs font-medium text-white/60 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FAE705]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Perubahan otomatis disimpan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-7 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Portal Survei</p>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F] leading-none">Manajemen Layanan</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin"
            className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
            ← Dashboard
          </Link>
          <div className="px-4 py-2 bg-[#F0F4F8] border border-gray-200 text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
            {services.length} Layanan
          </div>
          <Link href="/admin/layanan?action=add"
            className="px-4 py-2 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] transition-colors">
            + Tambah Layanan
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#132B4F]">
                <th className="py-3 pl-8 pr-4 text-[9px] font-black uppercase tracking-widest text-white w-12">#</th>
                <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white">Nama Layanan</th>
                <th className="py-3 pr-8 text-[9px] font-black uppercase tracking-widest text-white text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada layanan</p>
                  </td>
                </tr>
              ) : (
                services.map((service: { id: string; nama: string }, i: number) => (
                  <tr key={service.id} className={`group transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/50"} hover:bg-[#F0F4F8]`}>
                    <td className="py-4 pl-8 pr-4">
                      <span className="text-[10px] font-black text-gray-300">{String(i + 1).padStart(2, "0")}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Link href={`/admin/layanan/${service.id}`}>
                        <div className="flex items-center gap-3 group/link">
                          <div className="w-0.5 h-5 bg-[#009CC5] shrink-0" />
                          <span className="text-sm font-bold text-[#132B4F] group-hover/link:text-[#009CC5] transition-colors">
                            {service.nama}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 pr-8">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/layanan/${service.id}`}
                          className="px-3 py-1.5 bg-[#009CC5] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#132B4F] transition-colors">
                          Analitik
                        </Link>
                        <form action={deleteLayanan.bind(null, service.id)}>
                          <button type="submit"
                            className="px-3 py-1.5 bg-red-50 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
