import Image from "next/image";
import { MapPin, Phone, Mail, BookOpen, Target, Shield, BarChart3, Users, Award } from "lucide-react";

export const metadata = {
  title: "Tentang Kami — SKM BKPSDM Anambas",
  description:
    "Profil Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas serta sistem Survei Kepuasan Masyarakat.",
};

export default function TentangPage() {
  return (
    <div className="text-slate-900 font-sans">

      {/* HERO */}
      <section className="bg-slate-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[600px] h-[600px] rounded-full bg-[#FAE705]/10 blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1">
            <p className="text-xs font-bold text-[#FAE705] uppercase tracking-widest mb-4">Tentang Kami</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
              BKPSDM<br />
              <span className="text-[#FAE705]">Kepulauan Anambas</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-lg">
              Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas
              berkomitmen memberikan pelayanan kepegawaian yang transparan, akuntabel, dan terukur.
            </p>
          </div>
          <div className="shrink-0">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-6">
              <Image
                src="/logo-bkpsdm.png"
                alt="BKPSDM Anambas"
                width={160}
                height={160}
                className="object-contain w-full h-full brightness-0 invert"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROFILE CARDS */}
      <section className="bg-slate-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Target className="w-5 h-5" />,
              title: "Visi",
              body: "Terwujudnya aparatur sipil negara yang profesional, kompeten, dan berintegritas di Kabupaten Kepulauan Anambas.",
            },
            {
              icon: <Award className="w-5 h-5" />,
              title: "Misi",
              body: "Meningkatkan kualitas sumber daya manusia ASN melalui pendidikan, pelatihan, dan pengembangan kompetensi yang berkelanjutan.",
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: "Nilai",
              body: "Integritas · Profesionalisme · Akuntabilitas · Inovasi · Pelayanan Prima sebagai landasan kerja seluruh jajaran BKPSDM.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 hover:shadow-md transition-shadow duration-300">
              <div className="w-11 h-11 rounded-xl bg-[#FAE705]/20 text-[#c4a800] flex items-center justify-center mb-5">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT SKM */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-[#c4a800] uppercase tracking-widest mb-3">Sistem SKM</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-5 leading-tight">
                Survei Kepuasan<br />Masyarakat Digital
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Sistem SKM ini merupakan platform digital yang dirancang untuk mengukur kepuasan masyarakat
                terhadap pelayanan publik yang diselenggarakan oleh BKPSDM. Setiap responden dapat mengisi
                survei dengan mudah melalui QR Code yang tersedia di loket pelayanan.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Hasil survei diolah secara otomatis menjadi Indeks Kepuasan Masyarakat (IKM) yang dapat
                dipantau secara real-time oleh pengelola layanan sebagai bahan evaluasi dan perbaikan
                berkelanjutan.
              </p>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <BarChart3 className="w-5 h-5" />, val: "9",    label: "Unsur Penilaian",    sub: "Sesuai standar nasional" },
                { icon: <Users className="w-5 h-5" />,    val: "IKM",  label: "Indeks Kepuasan",    sub: "Dihitung otomatis" },
                { icon: <Shield className="w-5 h-5" />,   val: "QR",   label: "Akses Mudah",        sub: "Pindai & isi survei" },
                { icon: <BookOpen className="w-5 h-5" />, val: "2017", label: "Permenpan RB No.14", sub: "Dasar hukum sistem" },
              ].map((s) => (
                <div key={s.label}
                  className="bg-slate-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-[#FAE705] flex items-center justify-center">
                    {s.icon}
                  </div>
                  <p className="text-2xl font-black text-slate-900">{s.val}</p>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LEGAL BASIS */}
      <section className="bg-slate-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-bold text-[#c4a800] uppercase tracking-widest mb-2">Dasar Hukum</p>
            <h2 className="text-2xl font-extrabold text-slate-900">Landasan Regulasi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                num: "01",
                title: "Permenpan RB No. 14 Tahun 2017",
                desc: "Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik — mengatur 9 unsur penilaian standar nasional.",
              },
              {
                num: "02",
                title: "UU No. 25 Tahun 2009",
                desc: "Undang-Undang tentang Pelayanan Publik yang mewajibkan setiap penyelenggara pelayanan publik melakukan evaluasi kinerja secara berkala.",
              },
              {
                num: "03",
                title: "PP No. 96 Tahun 2012",
                desc: "Peraturan Pemerintah tentang Pelaksanaan UU Pelayanan Publik, termasuk kewajiban pengukuran kepuasan masyarakat.",
              },
              {
                num: "04",
                title: "Perda Kab. Kepulauan Anambas",
                desc: "Peraturan daerah dan kebijakan Bupati terkait penyelenggaraan pelayanan kepegawaian dan pengembangan SDM di lingkungan Pemkab Anambas.",
              },
            ].map((item) => (
              <div key={item.num} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-5">
                <div className="text-3xl font-black text-slate-100 shrink-0 leading-none">{item.num}</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-bold text-[#c4a800] uppercase tracking-widest mb-2">Kontak</p>
            <h2 className="text-2xl font-extrabold text-slate-900">Hubungi Kami</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <MapPin className="w-5 h-5 text-blue-500" />,
                label: "Alamat",
                value: "Jl. Pasir Peti, Kec. Siantan, Kab. Anambas, Kepulauan Riau",
                href: null,
              },
              {
                icon: <Phone className="w-5 h-5 text-blue-500" />,
                label: "Telepon",
                value: "0812-6671-4935",
                href: "tel:+6281266714935",
              },
              {
                icon: <Mail className="w-5 h-5 text-blue-500" />,
                label: "Email",
                value: "bkpsdm@anambaskab.go.id",
                href: "mailto:bkpsdm@anambaskab.go.id",
              },
            ].map((c) => (
              <div key={c.label} className="bg-slate-50 rounded-2xl border border-gray-100 p-6 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors duration-200">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-700">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
