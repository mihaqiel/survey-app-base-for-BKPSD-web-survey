"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Playfair_Display, DM_Sans } from "next/font/google";

/* ── Fonts ──────────────────────────────────────── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal"],
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

/* ── Theme detection ────────────────────────────── */
/**
 * Probes the element stack just below the header's bottom edge and returns
 * 'dark' or 'light' based on the background of the first real element found.
 * - gradient backgrounds → dark (all gradients in this app are dark)
 * - solid color → ITU-R BT.601 luminance < 0.45 → dark
 */
function detectTheme(headerEl: HTMLElement): "light" | "dark" {
  const rect = headerEl.getBoundingClientRect();
  const cx   = window.innerWidth / 2;
  const py   = rect.bottom + 2;
  if (py >= window.innerHeight) return "light";

  const els = document.elementsFromPoint(cx, py);
  for (const el of els) {
    if (!(el instanceof HTMLElement)) continue;
    if (headerEl.contains(el)) continue;
    if (el === document.documentElement || el === document.body) continue;

    const st = window.getComputedStyle(el);

    // Gradient backgrounds are always dark in this app
    if (st.backgroundImage !== "none" && st.backgroundImage.includes("gradient")) {
      return "dark";
    }

    // Solid background — luminance test
    const m = st.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
      return lum < 0.45 ? "dark" : "light";
    }
  }
  return "light";
}

export default function PublicHeader() {
  const [scrolled,  setScrolled]  = useState(false);
  const [hidden,    setHidden]    = useState(false);
  const [theme,     setTheme]     = useState<"light" | "dark">("light");
  const pathname    = usePathname();
  const headerRef   = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const themeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y   = window.scrollY;
      const dir = y > lastScrollY.current ? "down" : "up";
      lastScrollY.current = y;

      setScrolled(y > 20);

      // Auto-hide: only engage after scrolling 80px to avoid jitter near top
      if (y > 80) {
        setHidden(dir === "down");
      } else {
        setHidden(false);
      }

      // Throttled theme probe — 120ms is fast enough to feel responsive
      if (themeTimer.current) clearTimeout(themeTimer.current);
      themeTimer.current = setTimeout(() => {
        if (headerRef.current) setTheme(detectTheme(headerRef.current));
      }, 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (themeTimer.current) clearTimeout(themeTimer.current);
    };
  }, []);

  /* ── Derived style values ───────────────────── */
  const isDark = theme === "dark";

  const headerBg = !scrolled
    ? "#ffffff"
    : isDark
      ? "rgba(13, 29, 56, 0.88)"
      : "rgba(255, 255, 255, 0.92)";

  const navActiveColor   = isDark ? "#FAE705"                 : "#0d2d58";
  const navInactiveColor = isDark ? "rgba(255,255,255,0.70)"  : "rgba(13,45,88,0.55)";
  const subtitleColor    = isDark ? "rgba(255,255,255,0.55)"  : "rgba(13,45,88,0.55)";
  const borderColor      = isDark ? "rgba(255,255,255,0.08)"  : "rgba(13,45,88,0.08)";
  const sepGradient      = isDark
    ? "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.2) 70%, transparent 100%)"
    : "linear-gradient(to bottom, transparent 0%, rgba(13,45,88,0.2) 30%, rgba(13,45,88,0.2) 70%, transparent 100%)";

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
          filter: drop-shadow(0 0 10px rgba(56,189,248,0.45));
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
      `}</style>

      <header
        ref={headerRef}
        className={`${playfair.variable} ${dmSans.variable} sticky top-0 z-50`}
        style={{
          background:           headerBg,
          backdropFilter:       scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          transform:            hidden   ? "translateY(-100%)" : "translateY(0)",
          transition:           "transform 0.4s cubic-bezier(0.4,0,0.2,1), background 0.35s ease, box-shadow 0.35s ease",
          boxShadow:            scrolled && !hidden ? "0 4px 24px rgba(13,45,88,0.12)" : "none",
        }}
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
                style={{ height: 52, transition: "height 0.3s ease" }}
              />
            </div>

            <div
              className="hidden sm:block"
              style={{
                width: 1,
                height: 36,
                background: sepGradient,
                transition: "background 0.35s ease",
              }}
            />

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
                  fontFamily:    "var(--hdr-body)",
                  color:         subtitleColor,
                  letterSpacing: "0.22em",
                  transition:    "color 0.35s ease",
                }}
              >
                Kabupaten Kepulauan Anambas
              </p>
            </div>

            <div
              className="hidden sm:block"
              style={{
                width: 1,
                height: 36,
                background: sepGradient,
                transition: "background 0.35s ease",
              }}
            />

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
            background:  "transparent",
            borderTop:   `1px solid ${borderColor}`,
            transition:  "border-color 0.35s ease",
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
                    color:      isActive ? navActiveColor : navInactiveColor,
                    transition: "color 0.35s ease",
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
