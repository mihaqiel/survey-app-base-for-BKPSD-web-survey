"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Playfair_Display, DM_Sans } from "next/font/google";

/* ── Fonts ──────────────────────────────────────── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--hdr-display",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--hdr-body",
});

const NAV_LINKS = [
  { href: "/",           label: "Beranda"      },
  { href: "/tentang",    label: "Tentang Kami" },
  { href: "/pengaduan",  label: "Pengaduan"    },
];

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname  = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes hdrGrad {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        .hdr-grad-bar {
          background: linear-gradient(-45deg, #FAE705, #38bdf8, #0d2d58, #FAE705);
          background-size: 300% 300%;
          animation: hdrGrad 6s ease infinite;
        }
        .hdr-logo-wrap {
          transition: filter 0.35s ease, transform 0.35s ease;
        }
        .hdr-logo-link:hover .hdr-logo-wrap {
          filter: drop-shadow(0 0 10px rgba(56,189,248,0.35));
          transform: scale(1.04);
        }
        .hdr-nav-item {
          position: relative;
          transition: color 0.25s ease;
        }
        .hdr-nav-item::after {
          content: '';
          position: absolute;
          bottom: 0; left: 1rem; right: 1rem;
          height: 2px;
          border-radius: 1px;
          background: #FAE705;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.28s ease;
        }
        .hdr-nav-item:hover::after { transform: scaleX(1); }
        .hdr-nav-item.active::after { transform: scaleX(1); }
        .hdr-sep {
          width: 1px;
          height: 36px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(13,45,88,0.2) 30%,
            rgba(13,45,88,0.2) 70%,
            transparent 100%
          );
        }
      `}</style>

      <header
        className={`
          ${playfair.variable} ${dmSans.variable}
          sticky top-0 z-50
          transition-all duration-500
          ${scrolled ? "shadow-[0_4px_24px_rgba(13,45,88,0.12)]" : ""}
        `}
        style={{ background: "#ffffff" }}
      >
        {/* ── TOP ACCENT ─────────────────────────────── */}
        <div className="hdr-grad-bar" style={{ height: 3 }} />

        {/* ── LOGO ROW ───────────────────────────────── */}
        <Link href="/" className="hdr-logo-link block">
          <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-center gap-8 md:gap-12">

            {/* Lambang Anambas */}
            <div className="hdr-logo-wrap">
              <Image
                src="/logo-anambas.png"
                alt="Lambang Kepulauan Anambas"
                width={56}
                height={64}
                className="object-contain w-auto"
                style={{ height: 52 }}
              />
            </div>

            <div className="hdr-sep hidden sm:block" />

            {/* Logo + unit name center block */}
            <div className="flex flex-col items-center gap-1">
              <div className="hdr-logo-wrap">
                <Image
                  src="/logo-anambas-maju.png"
                  alt="Anambas Maju – Energi Baru"
                  width={130}
                  height={56}
                  className="object-contain w-auto"
                  style={{ height: 44 }}
                />
              </div>
              <p
                className="text-[9px] tracking-[0.22em] uppercase"
                style={{
                  fontFamily: "var(--hdr-body)",
                  color: "rgba(13,45,88,0.55)",
                  letterSpacing: "0.22em",
                }}
              >
                Kabupaten Kepulauan Anambas
              </p>
            </div>

            <div className="hdr-sep hidden sm:block" />

            {/* BKPSDM logo */}
            <div className="hdr-logo-wrap">
              <Image
                src="/logo-bkpsdm.png"
                alt="BKPSDM Anambas"
                width={90}
                height={56}
                className="object-contain w-auto"
                style={{ height: 48 }}
              />
            </div>

          </div>
        </Link>

        {/* ── NAV BAR ────────────────────────────────── */}
        <div
          style={{
            background: "#ffffff",
            borderTop: "1px solid rgba(13,45,88,0.08)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-center">

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hdr-nav-item${isActive ? " active" : ""} px-5 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase`}
                  style={{
                    fontFamily: "var(--hdr-body)",
                    color: isActive ? "#0d2d58" : "rgba(13,45,88,0.55)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}

          </div>
        </div>

        {/* ── BOTTOM ACCENT ──────────────────────────── */}
        <div className="hdr-grad-bar" style={{ height: 2 }} />
      </header>
    </>
  );
}
