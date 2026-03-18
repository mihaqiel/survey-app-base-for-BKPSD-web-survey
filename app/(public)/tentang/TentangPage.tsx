"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, ChevronDown } from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";

/* ── Fonts ─────────────────────────────────────────────── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

/* ── Data ──────────────────────────────────────────────── */
const GALLERY = [
  {
    src: "/foto-1.jpg",
    alt: "Hari Raya Bersama BKPSDM",
    tag: "Budaya",
    label: "Hari Raya Bersama",
    desc: "Kebersamaan jajaran BKPSDM dalam balutan busana adat Melayu Kepulauan Anambas",
    tall: true,
  },
  {
    src: "/foto-2.jpg",
    alt: "Kegiatan Lapangan BKPSDM",
    tag: "Pengabdian",
    label: "Gotong Royong",
    desc: "Aksi nyata BKPSDM membangun lingkungan masyarakat sekitar bersama",
    tall: false,
  },
  {
    src: "/foto-3.jpg",
    alt: "Kebersamaan Tim BKPSDM",
    tag: "Kebersamaan",
    label: "Keakraban Tim",
    desc: "Momen keakraban yang mempererat hubungan antar ASN BKPSDM",
    tall: false,
  },
  {
    src: "/foto-4.jpg",
    alt: "Pelatihan ASN BKPSDM",
    tag: "Kompetensi",
    label: "Pelatihan ASN",
    desc: "Pengembangan kompetensi aparatur sipil negara secara berkala dan terstruktur",
    tall: true,
  },
];

const STATS = [
  { value: "2008", label: "Tahun Berdiri",    sub: "Bersama Kab. Anambas"     },
  { value: "9",    label: "Unsur SKM",         sub: "Standar Permenpan RB"     },
  { value: "5+",   label: "Unit Layanan",      sub: "Kepegawaian & SDM"        },
  { value: "100%", label: "Terdigitalisasi",   sub: "Layanan berbasis digital" },
];

const PILLARS = [
  {
    num: "01",
    title: "Visi",
    body: "Terwujudnya aparatur sipil negara yang profesional, kompeten, dan berintegritas di Kabupaten Kepulauan Anambas.",
  },
  {
    num: "02",
    title: "Misi",
    body: "Meningkatkan kualitas sumber daya manusia ASN melalui pendidikan, pelatihan, dan pengembangan kompetensi yang berkelanjutan.",
  },
  {
    num: "03",
    title: "Nilai",
    body: "Integritas · Profesionalisme · Akuntabilitas · Inovasi · Pelayanan Prima sebagai landasan kerja seluruh jajaran BKPSDM.",
  },
];

const LEGAL = [
  {
    code: "Permenpan RB",
    num: "No. 14 / 2017",
    desc: "Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik — mengatur 9 unsur penilaian standar nasional.",
  },
  {
    code: "Undang-Undang",
    num: "No. 25 / 2009",
    desc: "Undang-Undang Pelayanan Publik — mewajibkan evaluasi kinerja pelayanan secara berkala oleh setiap penyelenggara pelayanan publik.",
  },
  {
    code: "Peraturan Pemerintah",
    num: "No. 96 / 2012",
    desc: "Pelaksanaan UU Pelayanan Publik, termasuk kewajiban pengukuran indeks kepuasan masyarakat secara periodik.",
  },
  {
    code: "Undang-Undang",
    num: "No. 5 / 2014",
    desc: "Aparatur Sipil Negara — landasan profesionalisme, kompetensi, dan pengembangan SDM ASN Kabupaten Kepulauan Anambas.",
  },
];

/* ── Component ─────────────────────────────────────────── */
export default function TentangPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`${playfair.variable} ${dmSans.variable} text-slate-900`}
      style={{ fontFamily: "var(--font-body, sans-serif)" }}>

      {/* Keyframes + utility overrides */}
      <style>{`
        @keyframes heroGradient {
          0%   { background-position: 0%   60%; }
          33%  { background-position: 100% 40%; }
          66%  { background-position: 60%  100%;}
          100% { background-position: 0%   60%; }
        }
        @keyframes orbA {
          0%,100% { transform: translate(0,0) scale(1);     }
          40%     { transform: translate(28px,-18px) scale(1.09); }
          70%     { transform: translate(-16px,24px) scale(0.93); }
        }
        @keyframes orbB {
          0%,100% { transform: translate(0,0) scale(1);     }
          35%     { transform: translate(-22px,20px) scale(1.06); }
          75%     { transform: translate(28px,-12px) scale(0.94); }
        }
        @keyframes orbC {
          0%,100% { transform: translate(0,0) scale(1);     }
          50%     { transform: translate(16px,28px) scale(1.1);  }
        }
        @keyframes bounce {
          0%,100% { transform: translateY(0);  }
          50%     { transform: translateY(9px); }
        }
        @keyframes revealUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .hero-gradient {
          background: linear-gradient(-45deg, #061220, #0d2d58, #0a4060, #130a20);
          background-size: 400% 400%;
          animation: heroGradient 20s ease infinite;
        }
        .orb-a { animation: orbA 10s ease-in-out infinite; }
        .orb-b { animation: orbB 13s ease-in-out infinite; animation-delay:-5s; }
        .orb-c { animation: orbC 8s  ease-in-out infinite; animation-delay:-3s; }
        .bounce { animation: bounce 2.2s ease-in-out infinite; }

        .reveal   { animation: revealUp 0.75s cubic-bezier(.22,1,.36,1) both; opacity:0; }
        .delay-1  { animation-delay: 0.1s;  }
        .delay-2  { animation-delay: 0.25s; }
        .delay-3  { animation-delay: 0.42s; }
        .delay-4  { animation-delay: 0.58s; }

        .serif { font-family: var(--font-display, Georgia, serif); }

        .gold-text {
          background: linear-gradient(110deg, #b8962e 0%, #e8c87a 40%, #b8962e 70%, #c9a43f 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        /* Photo card */
        .photo-card { overflow: hidden; border-radius: 1rem; position: relative; }
        .photo-card img { transition: transform 0.7s cubic-bezier(.25,.1,.25,1); }
        .photo-card:hover img { transform: scale(1.07); }
        .photo-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(6,18,32,.92) 0%, rgba(6,18,32,.35) 55%, transparent 100%);
          opacity: 0; transition: opacity 0.4s ease;
        }
        .photo-card:hover .photo-overlay { opacity: 1; }
        .photo-caption { transform: translateY(14px); transition: transform 0.4s ease; }
        .photo-card:hover .photo-caption { transform: translateY(0); }

        /* Dot-grid pattern */
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 38px 38px;
        }

        /* Horizontal rule gold */
        .hr-gold { height:1px; background:linear-gradient(90deg,transparent,#b8962e 30%,#b8962e 70%,transparent); }
      `}</style>

      {/* ── Progress bar ──────────────────────────────── */}
      <div
        className="fixed top-0 left-0 z-50 h-[2px] transition-all duration-75"
        style={{ width: `${progress}%`, background: "linear-gradient(90deg,#b8962e,#e8c87a)" }}
      />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="hero-gradient relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pb-16">

        {/* Floating orbs */}
        <div className="orb-a pointer-events-none absolute top-1/4 left-[8%]  w-[480px] h-[480px] rounded-full bg-blue-500/10  blur-[100px]" />
        <div className="orb-b pointer-events-none absolute bottom-1/4 right-[10%] w-[380px] h-[380px] rounded-full bg-teal-400/10  blur-[120px]" />
        <div className="orb-c pointer-events-none absolute top-[55%] right-[25%] w-[320px] h-[320px] rounded-full bg-indigo-500/10 blur-[80px]"  />

        {/* Dot grid */}
        <div className="dot-grid pointer-events-none absolute inset-0" />

        {/* Watermark */}
        <div
          className="serif pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <span className="text-[15vw] font-bold text-white/[0.025] tracking-widest whitespace-nowrap">
            BKPSDM
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl w-full text-center">
          <div className="reveal delay-1 inline-flex items-center gap-3 mb-8">
            <span className="block w-8 h-px bg-[#b8962e]" />
            <span className="text-[10px] font-semibold tracking-[0.35em] text-[#b8962e] uppercase">
              Tentang Kami
            </span>
            <span className="block w-8 h-px bg-[#b8962e]" />
          </div>

          <h1 className="serif reveal delay-2 text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.08] mb-5">
            Badan Kepegawaian &amp;<br />
            <em className="font-normal text-white/75">Pengembangan SDM</em>
          </h1>

          <p className="reveal delay-3 text-[10px] sm:text-xs tracking-[0.25em] text-white/45 uppercase mb-10">
            Kabupaten Kepulauan Anambas
          </p>

          <p className="reveal delay-4 text-white/55 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Berkomitmen mewujudkan aparatur sipil negara yang profesional, transparan,
            dan berdedikasi dalam melayani masyarakat Kepulauan Anambas secara berkelanjutan.
          </p>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[9px] tracking-[0.3em] uppercase">Gulir</span>
          <div className="bounce"><ChevronDown className="w-4 h-4" /></div>
        </div>

        {/* Bottom gradient bleed */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#f8f7f3]" />
      </section>

      {/* ══════════════════════════════════════════════
          GALLERY
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f8f7f3] py-24 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-px bg-[#b8962e] block" />
                <span className="text-[10px] font-semibold tracking-[0.35em] text-[#b8962e] uppercase">
                  Galeri Kegiatan
                </span>
              </div>
              <h2 className="serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Bersatu, Bergerak,<br />
                <em className="font-normal text-slate-500">Bertumbuh.</em>
              </h2>
            </div>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Dokumentasi kegiatan dan kebersamaan jajaran BKPSDM Kabupaten Kepulauan Anambas
              dalam melayani dan mengabdi.
            </p>
          </div>

          {/* Asymmetric photo grid — desktop: 3-col; mobile: 2-col */}
          <div
            className="hidden md:grid gap-3"
            style={{
              gridTemplateColumns: "1.3fr 1fr 1.3fr",
              gridTemplateRows:    "290px 290px",
            }}
          >
            {/* Photo 1 — tall left */}
            <div className="photo-card" style={{ gridRow: "1 / 3" }}>
              <Image src={GALLERY[0].src} alt={GALLERY[0].alt} fill sizes="35vw" className="object-cover" priority />
              <div className="photo-overlay">
                <div className="photo-caption absolute bottom-0 left-0 right-0 p-6">
                  <span className="block text-[#b8962e] text-[9px] font-bold tracking-[0.3em] uppercase mb-1">
                    {GALLERY[0].tag}
                  </span>
                  <p className="serif text-white text-xl font-semibold leading-tight">{GALLERY[0].label}</p>
                  <p className="text-white/55 text-xs mt-1.5 leading-relaxed">{GALLERY[0].desc}</p>
                </div>
              </div>
            </div>

            {/* Photo 2 — top centre */}
            <div className="photo-card">
              <Image src={GALLERY[1].src} alt={GALLERY[1].alt} fill sizes="25vw" className="object-cover" />
              <div className="photo-overlay">
                <div className="photo-caption absolute bottom-0 left-0 right-0 p-5">
                  <span className="block text-[#b8962e] text-[9px] font-bold tracking-[0.3em] uppercase mb-1">
                    {GALLERY[1].tag}
                  </span>
                  <p className="serif text-white font-semibold leading-tight">{GALLERY[1].label}</p>
                </div>
              </div>
            </div>

            {/* Photo 4 — tall right */}
            <div className="photo-card" style={{ gridRow: "1 / 3" }}>
              <Image src={GALLERY[3].src} alt={GALLERY[3].alt} fill sizes="35vw" className="object-cover" />
              <div className="photo-overlay">
                <div className="photo-caption absolute bottom-0 left-0 right-0 p-6">
                  <span className="block text-[#b8962e] text-[9px] font-bold tracking-[0.3em] uppercase mb-1">
                    {GALLERY[3].tag}
                  </span>
                  <p className="serif text-white text-xl font-semibold leading-tight">{GALLERY[3].label}</p>
                  <p className="text-white/55 text-xs mt-1.5 leading-relaxed">{GALLERY[3].desc}</p>
                </div>
              </div>
            </div>

            {/* Photo 3 — bottom centre */}
            <div className="photo-card">
              <Image src={GALLERY[2].src} alt={GALLERY[2].alt} fill sizes="25vw" className="object-cover" />
              <div className="photo-overlay">
                <div className="photo-caption absolute bottom-0 left-0 right-0 p-5">
                  <span className="block text-[#b8962e] text-[9px] font-bold tracking-[0.3em] uppercase mb-1">
                    {GALLERY[2].tag}
                  </span>
                  <p className="serif text-white font-semibold leading-tight">{GALLERY[2].label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: 2x2 grid */}
          <div className="md:hidden grid grid-cols-2 gap-2.5" style={{ gridTemplateRows: "200px 200px" }}>
            {GALLERY.map((photo) => (
              <div key={photo.src} className="photo-card">
                <Image src={photo.src} alt={photo.alt} fill sizes="50vw" className="object-cover" />
                <div className="photo-overlay">
                  <div className="photo-caption absolute bottom-0 left-0 right-0 p-4">
                    <span className="block text-[#b8962e] text-[8px] font-bold tracking-widest uppercase mb-0.5">
                      {photo.tag}
                    </span>
                    <p className="serif text-white text-sm font-semibold leading-tight">{photo.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════ */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 md:px-8 py-6 text-center">
              <p className="serif gold-text text-5xl md:text-6xl font-bold leading-none">{s.value}</p>
              <p className="text-xs font-semibold text-slate-800 mt-3 tracking-wide">{s.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PILLARS — Visi Misi Nilai
      ══════════════════════════════════════════════ */}
      <section className="bg-[#061220] py-24 px-6 relative overflow-hidden">
        {/* Radial glows */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(13,45,88,.6) 0%, transparent 65%)," +
              "radial-gradient(ellipse at 80% 50%, rgba(10,64,96,.5) 0%, transparent 65%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-14">
            <span className="w-6 h-px bg-[#b8962e] block" />
            <span className="text-[10px] font-semibold tracking-[0.35em] text-[#b8962e] uppercase">
              Profil Organisasi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {PILLARS.map((p) => (
              <div key={p.num} className="border-t border-white/10 pt-8">
                <span className="serif text-[5rem] font-bold text-white/[0.06] leading-none block mb-5">
                  {p.num}
                </span>
                <h3 className="serif text-2xl font-bold text-white mb-3">{p.title}</h3>
                <span className="block w-8 h-px bg-[#b8962e] mb-5" />
                <p className="text-white/45 text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ABOUT THE SKM SYSTEM
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f8f7f3] py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-px bg-[#b8962e] block" />
              <span className="text-[10px] font-semibold tracking-[0.35em] text-[#b8962e] uppercase">
                Sistem SKM
              </span>
            </div>
            <h2 className="serif text-4xl font-bold text-slate-900 mb-6 leading-tight">
              Survei Kepuasan<br />
              <em className="font-normal text-slate-500">Masyarakat Digital</em>
            </h2>
            <p className="text-slate-500 leading-relaxed text-sm mb-4">
              Platform digital dirancang untuk mengukur kepuasan masyarakat terhadap pelayanan
              publik BKPSDM secara transparan, akuntabel, dan mudah diakses.
            </p>
            <p className="text-slate-500 leading-relaxed text-sm">
              Hasil survei diolah otomatis menjadi Indeks Kepuasan Masyarakat (IKM) yang
              dipantau real-time sebagai bahan evaluasi dan perbaikan berkelanjutan.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { val: "9",    label: "Unsur Penilaian", sub: "Sesuai standar nasional Permenpan RB" },
              { val: "IKM",  label: "Indeks Kepuasan", sub: "Dihitung dan ditampilkan otomatis"    },
              { val: "QR",   label: "Akses QR Code",   sub: "Pindai & isi survei langsung di loket" },
            ].map((f) => (
              <div key={f.label}
                className="flex items-center gap-5 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="serif w-14 h-14 shrink-0 rounded-lg bg-[#061220] flex items-center justify-center text-[#b8962e] text-xl font-bold">
                  {f.val}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{f.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LEGAL BASIS
      ══════════════════════════════════════════════ */}
      <section className="bg-white border-t border-gray-100 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-[#b8962e] block" />
            <span className="text-[10px] font-semibold tracking-[0.35em] text-[#b8962e] uppercase">
              Dasar Hukum
            </span>
          </div>
          <h2 className="serif text-4xl font-bold text-slate-900 mb-12">Landasan Regulasi</h2>

          <div className="space-y-0 divide-y divide-gray-100">
            {LEGAL.map((l, i) => (
              <div key={l.num}
                className="group flex gap-8 md:gap-12 py-8 hover:bg-slate-50/60 -mx-4 px-4 rounded-xl transition-colors duration-200">
                <div className="shrink-0 w-12 pt-0.5">
                  <span className="serif text-5xl font-bold leading-none text-slate-100 group-hover:text-[#b8962e]/15 transition-colors duration-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <span className="text-[9px] font-bold tracking-[0.3em] text-[#b8962e] uppercase">{l.code}</span>
                    <span className="text-sm font-bold text-slate-800">{l.num}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════ */}
      <section className="bg-[#061220] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <span className="w-6 h-px bg-[#b8962e] block" />
            <span className="text-[10px] font-semibold tracking-[0.35em] text-[#b8962e] uppercase">
              Hubungi Kami
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-4 h-4 text-[#b8962e]" />,
                label: "Alamat",
                value: "Jl. Pasir Peti, Kec. Siantan, Kab. Anambas, Kepulauan Riau",
                href: null,
              },
              {
                icon: <Phone className="w-4 h-4 text-[#b8962e]" />,
                label: "Telepon",
                value: "0812-6671-4935",
                href: "tel:+6281266714935",
              },
              {
                icon: <Mail className="w-4 h-4 text-[#b8962e]" />,
                label: "Email",
                value: "bkpsdm@anambaskab.go.id",
                href: "mailto:bkpsdm@anambaskab.go.id",
              },
            ].map((c) => (
              <div key={c.label} className="border-t border-white/10 pt-7">
                <div className="flex items-center gap-2 mb-3">
                  {c.icon}
                  <span className="text-[9px] font-semibold tracking-[0.3em] text-white/40 uppercase">{c.label}</span>
                </div>
                {c.href ? (
                  <a href={c.href} className="text-white/60 text-sm hover:text-white transition-colors duration-200">
                    {c.value}
                  </a>
                ) : (
                  <p className="text-white/60 text-sm leading-relaxed">{c.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="hr-gold mt-16" />
          <p className="text-white/20 text-[10px] tracking-widest mt-6 text-center">
            BKPSDM KABUPATEN KEPULAUAN ANAMBAS &nbsp;·&nbsp; SURVEI KEPUASAN MASYARAKAT
          </p>
        </div>
      </section>

    </div>
  );
}
