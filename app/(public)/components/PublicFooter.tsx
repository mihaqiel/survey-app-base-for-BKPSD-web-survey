import Image from "next/image";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#132B4F] text-white mt-auto">
      {/* TOP ACCENT */}
      <div className="h-1 bg-gradient-to-r from-[#FAE705] via-[#009CC5] to-[#132B4F]" />

      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* LOGOS COLUMN */}
          <div className="md:col-span-1 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Image src="/logo-bkpsdm.png" alt="BKPSDM" width={70} height={44} className="object-contain h-10 w-auto brightness-0 invert" />
            </div>
            <p className="text-xs text-white/50 font-medium leading-relaxed">
              Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
            </p>
          </div>

          {/* TENTANG */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#009CC5] mb-4">Tentang</h4>
            <ul className="space-y-2.5">
              {["Profil BKPSDM", "Visi & Misi", "Struktur Organisasi", "Dasar Hukum"].map(item => (
                <li key={item}>
                  <span className="text-xs text-white/60 font-medium hover:text-white transition-colors cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* LAYANAN */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#009CC5] mb-4">Layanan SKM</h4>
            <ul className="space-y-2.5">
              {["Informasi Survei", "Cara Pengisian", "Hasil Survei", "Laporan IKM"].map(item => (
                <li key={item}>
                  <span className="text-xs text-white/60 font-medium hover:text-white transition-colors cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* KONTAK */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#009CC5] mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex gap-2.5 items-start">
                <span className="text-[#FAE705] mt-0.5 shrink-0">📍</span>
                <span className="text-xs text-white/60 font-medium leading-relaxed">
                  Jl. [Nama Jalan], Tarempa,<br />Kepulauan Anambas, Riau
                </span>
              </li>
              <li className="flex gap-2.5 items-center">
                <span className="text-[#FAE705] shrink-0">📞</span>
                <span className="text-xs text-white/60 font-medium">(0753) xxx-xxxx</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <span className="text-[#FAE705] shrink-0">✉️</span>
                <span className="text-xs text-white/60 font-medium">bkpsdm@anambaskab.go.id</span>
              </li>
            </ul>

            {/* SOCIAL MEDIA */}
            <div className="mt-5 flex gap-3">
              {[
                { label: "IG", title: "Instagram" },
                { label: "FB", title: "Facebook" },
                { label: "YT", title: "YouTube" },
              ].map(s => (
                <div key={s.label} title={s.title}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[9px] font-black text-white/60 hover:bg-[#009CC5] hover:text-white transition-colors cursor-pointer">
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-white/30 font-medium">
            © {year} BKPSDM Kabupaten Kepulauan Anambas. Sistem Survei Kepuasan Masyarakat.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FAE705]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#009CC5]" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </footer>
  );
}