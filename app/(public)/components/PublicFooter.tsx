import Image from "next/image";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#132B4F] text-white mt-auto">
      {/* TOP ACCENT */}
      <div className="h-1" style={{ background: "linear-gradient(to right, #FAE705 33%, #009CC5 33% 66%, #132B4F 66%)" }} />

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* LEFT: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/logo-bkpsdm.png"
                alt="BKPSDM"
                width={48}
                height={36}
                className="object-contain h-9 w-auto brightness-0 invert"
              />
              <div className="w-px h-7 bg-white/20" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">BKPSDM</p>
                <p className="text-[10px] font-bold text-white/50">Kab. Kepulauan Anambas</p>
              </div>
            </div>
            <p className="text-[11px] text-white/40 font-medium leading-relaxed max-w-xs border-l-2 border-[#009CC5] pl-3">
              Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
            </p>
          </div>

          {/* RIGHT: Contact */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FAE705]">Hubungi Kami</h4>
            <div className="space-y-2">
              <p className="text-[11px] text-white/50 font-medium">📍 Jl. [Nama Jalan], Tarempa, Kepulauan Anambas</p>
              <p className="text-[11px] text-white/50 font-medium">📞 (0753) xxx-xxxx</p>
              <p className="text-[11px] text-white/50 font-medium">✉️ bkpsdm@anambaskab.go.id</p>
            </div>
            <div className="flex gap-2 pt-1">
              {[
                { label: "IG", title: "Instagram" },
                { label: "FB", title: "Facebook" },
                { label: "YT", title: "YouTube" },
              ].map((s) => (
                <div
                  key={s.label}
                  title={s.title}
                  className="w-7 h-7 border border-white/20 flex items-center justify-center text-[9px] font-black text-white/40 hover:bg-[#009CC5] hover:border-[#009CC5] hover:text-white transition-all cursor-pointer"
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] text-white/30 font-medium">
              © {year} BKPSDM Kabupaten Kepulauan Anambas — Sistem Survei Kepuasan Masyarakat
            </p>
            <p className="text-[10px] text-white/30 font-medium">
              Teks hak cipta kedua di sini
            </p>
            <p className="text-[10px] text-white/30 font-medium">
              Teks hak cipta ketiga di sini
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-4 h-1.5 bg-[#FAE705]" />
            <div className="w-4 h-1.5 bg-[#009CC5]" />
            <div className="w-4 h-1.5 bg-white/20" />
          </div>
        </div>
      </div>
    </footer>
  );
}