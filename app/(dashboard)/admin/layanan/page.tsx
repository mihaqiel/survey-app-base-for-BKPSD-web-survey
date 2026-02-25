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
      <div className="min-h-screen p-8 font-sans flex flex-col" style={{ backgroundColor: "#F0F4F8", color: "#132B4F" }}>
        <div className="max-w-6xl mx-auto w-full mb-8">
          <Link href="/admin/layanan" className="text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "#009CC5" }}>
            ← Kembali ke Layanan
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-3" style={{ color: "#132B4F" }}>Buat Layanan Baru</h1>
          <p className="text-sm font-medium mt-1 text-gray-500">Tambahkan layanan baru ke portal survei.</p>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* FORM */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: "#009CC5" }}>Detail Layanan</h3>
            <form action={createLayanan} className="flex flex-col flex-1 space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1 text-gray-400">Nama Layanan *</label>
                <input name="nama" type="text" required placeholder="e.g. Layanan Mutasi"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none font-bold transition focus:border-[#009CC5] focus:ring-2 focus:ring-[#009CC5]/20"
                  style={{ color: "#132B4F" }}
                />
              </div>
              <div className="flex-1" />
              <button type="submit"
                className="w-full py-4 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 text-xs"
                style={{ backgroundColor: "#132B4F" }}
              >
                + Buat Layanan Ini
              </button>
            </form>
          </div>

          {/* INFO PANEL */}
          <div className="p-8 rounded-2xl text-white flex flex-col space-y-6" style={{ backgroundColor: "#132B4F" }}>
            <div className="h-1 w-16 rounded-full mb-2" style={{ backgroundColor: "#FAE705" }} />
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#009CC5" }}>Tentang Fitur Ini</h3>
              <p className="text-sm font-medium leading-relaxed text-white/70">
                Layanan yang ditambahkan di sini akan langsung muncul di portal survei publik, memungkinkan responden memilihnya saat mengisi survei SKM.
              </p>
            </div>
            <div className="border-t border-white/10 pt-6 space-y-4 flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#FAE705" }}>Panduan</h4>
              {[
                "Gunakan nama layanan resmi sesuai dokumen Standar Pelayanan.",
                "Setiap layanan dilacak secara terpisah di analitik dengan skor IKM-nya sendiri.",
                "Menghapus layanan akan menghapus semua respons survei terkait secara permanen.",
                "Sistem mendukung hingga 22 layanan sesuai Permenpan RB 14/2017.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5" style={{ backgroundColor: "#009CC5", color: "white" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-xs font-medium text-white/60 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FAE705" }} />
              Perubahan otomatis disimpan
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 font-sans" style={{ backgroundColor: "#F0F4F8", color: "#132B4F" }}>
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest mb-4 block transition-opacity hover:opacity-70" style={{ color: "#009CC5" }}>
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: "#132B4F" }}>Manajemen Layanan</h1>
          <p className="text-sm font-medium mt-2 text-gray-500">Kelola daftar layanan yang tersedia di portal survei.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest" style={{ color: "#132B4F" }}>
            Total: {services.length} Layanan
          </div>
          <Link href="/admin/layanan?action=add"
            className="px-4 py-2 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 hover:opacity-90"
            style={{ backgroundColor: "#009CC5" }}
          >
            + Tambah Layanan
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* TABLE HEADER */}
        <div className="h-1" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />
        <table className="w-full text-left">
          <thead style={{ backgroundColor: "#F0F4F8" }}>
            <tr>
              <th className="py-4 pl-8 text-[10px] font-black uppercase tracking-widest w-8" style={{ color: "#009CC5" }}>#</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "#009CC5" }}>Nama Layanan</th>
              <th className="py-4 pr-8 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: "#009CC5" }}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {services.map((service, i) => (
              <tr key={service.id} className="group hover:bg-blue-50/30 transition-colors">
                <td className="py-4 pl-8 text-[10px] font-black text-gray-300">{String(i + 1).padStart(2, "0")}</td>
                <td className="py-4">
                  <Link href={`/admin/layanan/${service.id}`} className="block">
                    <span className="text-sm font-bold transition-colors hover:text-[#009CC5]" style={{ color: "#132B4F" }}>
                      {service.nama}
                    </span>
                  </Link>
                </td>
                <td className="py-4 pr-8 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/layanan/${service.id}`}
                      className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all text-white"
                      style={{ backgroundColor: "#009CC5" }}
                    >
                      Analitik
                    </Link>
                    <form action={deleteLayanan.bind(null, service.id)}>
                      <button type="submit"
                        className="px-3 py-2 bg-red-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white transition-all"
                      >
                        Hapus
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}