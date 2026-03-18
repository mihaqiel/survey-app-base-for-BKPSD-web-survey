"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";

/* ── Fonts ──────────────────────────────────────── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--ftr-display",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--ftr-body",
});

/* ── Nav links (keeps footer navigation current) ── */
const NAV_LINKS = [
  { href: "/",        label: "Beranda"     },
  { href: "/tentang", label: "Tentang Kami" },
];

/* ── Social icon helper ─────────────────────────── */
function SocialIcon({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className="ftr-social"
    >
      {children}
    </a>
  );
}

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @keyframes ftrGrad {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        .ftr-grad-bar {
          background: linear-gradient(-45deg, #FAE705, #38bdf8, #0d2d58, #FAE705);
          background-size: 300% 300%;
          animation: ftrGrad 6s ease infinite;
        }
        .ftr-social {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.35);
          transition: color 0.25s, border-color 0.25s, background 0.25s, transform 0.25s;
        }
        .ftr-social:hover {
          color: #38bdf8;
          border-color: rgba(56,189,248,0.4);
          background: rgba(56,189,248,0.08);
          transform: translateY(-2px);
        }
        .ftr-nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          transition: color 0.25s, gap 0.25s;
          font-family: var(--ftr-body);
        }
        .ftr-nav-link:hover {
          color: rgba(255,255,255,0.9);
          gap: 10px;
        }
        .ftr-nav-link .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #FAE705;
          opacity: 0.5;
          flex-shrink: 0;
          transition: opacity 0.25s;
        }
        .ftr-nav-link:hover .dot { opacity: 1; }
        .ftr-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          line-height: 1.5;
          transition: color 0.25s;
          font-family: var(--ftr-body);
        }
        a.ftr-contact-item:hover { color: rgba(255,255,255,0.85); }
        .ftr-section-heading {
          font-family: var(--ftr-body);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(250,231,5,0.5);
          margin-bottom: 16px;
        }
        .ftr-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
        }
      `}</style>

      <footer className={`${playfair.variable} ${dmSans.variable}`} style={{ background: "#0d1b2a" }}>

        {/* ── TOP GRADIENT ACCENT ─────────────────────── */}
        <div className="ftr-grad-bar" style={{ height: 3 }} />

        {/* ── MAIN CONTENT ────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">

            {/* ── COL 1: Brand ─── */}
            <div className="flex flex-col gap-5">
              {/* Logo + name */}
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-bkpsdm.png"
                  alt="BKPSDM"
                  width={44}
                  height={44}
                  className="object-contain brightness-0 invert"
                  style={{ height: 38, width: "auto" }}
                />
                <div
                  className="w-px self-stretch"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                />
                <div>
                  <p
                    className="text-base font-semibold tracking-wide text-white"
                    style={{ fontFamily: "var(--ftr-display)" }}
                  >
                    BKPSDM
                  </p>
                  <p
                    className="text-[11px] text-white/40 leading-tight mt-0.5"
                    style={{ fontFamily: "var(--ftr-body)" }}
                  >
                    Kab. Kepulauan Anambas
                  </p>
                </div>
              </div>

              {/* Tagline block */}
              <div
                className="text-sm leading-relaxed pl-3"
                style={{
                  fontFamily: "var(--ftr-body)",
                  color: "rgba(255,255,255,0.35)",
                  borderLeft: "2px solid #38bdf8",
                }}
              >
                Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
              </div>

              {/* Social icons */}
              <div className="flex gap-2">
                <SocialIcon title="Instagram" href="#">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </SocialIcon>
                <SocialIcon title="Facebook" href="#">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </SocialIcon>
                <SocialIcon title="YouTube" href="#">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </SocialIcon>
              </div>
            </div>

            {/* ── COL 2: Navigation ─── */}
            <div>
              <p className="ftr-section-heading">Halaman</p>
              <nav className="flex flex-col gap-2.5">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="ftr-nav-link">
                    <span className="dot" />
                    {link.label}
                  </Link>
                ))}
              </nav>

            </div>

            {/* ── COL 3: Contact ─── */}
            <div>
              <p className="ftr-section-heading">Hubungi Kami</p>
              <div className="flex flex-col gap-4">

                <div className="ftr-contact-item">
                  <MapPin
                    className="shrink-0 mt-0.5"
                    style={{ width: 15, height: 15, color: "#38bdf8", opacity: 0.8 }}
                  />
                  <span>
                    Jl. Pasir Peti, Kec. Siantan,<br />
                    Kab. Anambas, Kepulauan Riau
                  </span>
                </div>

                <a href="tel:+6281266714935" className="ftr-contact-item">
                  <Phone
                    className="shrink-0 mt-0.5"
                    style={{ width: 15, height: 15, color: "#38bdf8", opacity: 0.8 }}
                  />
                  0812-6671-4935
                </a>

                <a href="mailto:bkpsdm@anambaskab.go.id" className="ftr-contact-item">
                  <Mail
                    className="shrink-0 mt-0.5"
                    style={{ width: 15, height: 15, color: "#38bdf8", opacity: 0.8 }}
                  />
                  bkpsdm@anambaskab.go.id
                </a>

              </div>

            </div>

          </div>
        </div>

        {/* ── BOTTOM DIVIDER ───────────────────────────── */}
        <div className="ftr-divider" />

        {/* ── BOTTOM BAR ───────────────────────────────── */}
        <div style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p
              className="text-[11px]"
              style={{ fontFamily: "var(--ftr-body)", color: "rgba(255,255,255,0.2)" }}
            >
              &copy; {year} BKPSDM Kabupaten Kepulauan Anambas &mdash; Sistem Survei Kepuasan Masyarakat
            </p>
            <div />
          </div>
        </div>

        {/* ── BOTTOM GRADIENT ACCENT ───────────────────── */}
        <div className="ftr-grad-bar" style={{ height: 3 }} />

      </footer>
    </>
  );
}
