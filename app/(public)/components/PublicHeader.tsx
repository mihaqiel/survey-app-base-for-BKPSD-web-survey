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
  { href: "/",                label: "Beranda"          },
  { href: "/tentang",         label: "Tentang Kami"     },
  { href: "/pengaduan",       label: "Pengaduan"        },
  { href: "/pengaduan/lacak", label: "Lacak Pengaduan"  },
];

/* ── Theme detection ────────────────────────────── */
/**
 * Probes the element stack just below the header's bottom edge.
 * - gradient background → dark (all gradients in this app are dark)
 * - solid colour → ITU-R BT.601 luminance < 0.45 → dark
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

    if (st.backgroundImage !== "none" && st.backgroundImage.includes("gradient")) {
      return "dark";
    }

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

      // After 80 px: hide on scroll-down, show nav-only on scroll-up
      if (y > 80) {
        setHidden(dir === "down");
      } else {
        setHidden(false);
      }

      // Throttled theme probe
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

  // Active / inactive link colours adapt to detected section theme
  const navActiveColor   = isDark ? "#FAE705"                : "#0d2d58";
  const navInactiveColor = isDark ? "rgba(255,255,255,0.75)" : "rgba(13,45,88,0.60)";

  // Separator in logo row (only visible when not scrolled, theme always light there)
  const sepGradient =
    "linear-gradient(to bottom, transparent, rgba(13,45,88,0.2) 30%, rgba(13,45,88,0.2) 70%, transparent)";

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
          filter: drop-shadow(0 0 10px rgba(56,189,248,0.4));
          transform: scale(1.04);
        }

        /* Nav links — transparent pill style */
        .hdr-nav-item {
          position: relative;
          border-radius: 999px;
          transition: color 0.25s ease, background 0.25s ease;
        }
        .hdr-nav-item:hover {
          background: rgba(255,255,255,0.08);
        }

        /* Yellow underline indicator */
        .hdr-nav-item::after {
          content: '';
          position: absolute;
          bottom: 6px; left: 1rem; right: 1rem;
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
          // At top: solid white. When scrolled: fully transparent — nav floats over content.
          background:  scrolled ? "transparent" : "#ffffff",
          transform:   hidden   ? "translateY(-100%)" : "translateY(0)",
          transition:  "transform 0.4s cubic-bezier(0.4,0,0.2,1), background 0.35s ease",
          boxShadow:   "none",
        }}
      >
        {/* ── TOP ACCENT — only at page top ──────────── */}
        <div
          className="hdr-grad-bar overflow-hidden"
          style={{
            height:     scrolled ? 0 : 3,
            transition: "height 0.3s ease",
          }}
        />

        {/* ── LOGO ROW — collapses when scrolled ─────── */}
        <div
          style={{
            maxHeight:   scrolled ? 0   : 200,
            opacity:     scrolled ? 0   : 1,
            overflow:    "hidden",
            pointerEvents: scrolled ? "none" : "auto",
            transition:  "max-height 0.35s ease, opacity 0.25s ease",
          }}
        >
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

              <div
                className="hidden sm:block"
                style={{ width: 1, height: 36, background: sepGradient }}
              />

              {/* Centre logo + unit name */}
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
                    color:         "rgba(13,45,88,0.55)",
                    letterSpacing: "0.22em",
                  }}
                >
                  Kabupaten Kepulauan Anambas
                </p>
              </div>

              <div
                className="hidden sm:block"
                style={{ width: 1, height: 36, background: sepGradient }}
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
        </div>

        {/* ── NAV BAR — always in DOM, transparent when scrolled ── */}
        <div
          style={{
            // Thin separator only when the logo row is visible
            borderTop:  scrolled ? "none" : "1px solid rgba(13,45,88,0.08)",
            transition: "border-color 0.35s ease",
            // Slight padding increase when floating (logo gone, give the nav more air)
            paddingTop:    scrolled ? 4 : 0,
            paddingBottom: scrolled ? 4 : 0,
          }}
        >
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-1">

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hdr-nav-item${isActive ? " active" : ""} px-5 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase`}
                  style={{
                    fontFamily: "var(--hdr-body)",
                    color:      isActive ? navActiveColor : navInactiveColor,
                    // Subtle text-shadow so text stays legible over any background
                    textShadow: scrolled
                      ? isDark
                        ? "0 1px 4px rgba(0,0,0,0.5)"
                        : "0 1px 3px rgba(255,255,255,0.6)"
                      : "none",
                    transition: "color 0.35s ease, text-shadow 0.35s ease",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}

          </div>
        </div>

        {/* ── BOTTOM ACCENT — only at page top ───────── */}
        <div
          className="hdr-grad-bar overflow-hidden"
          style={{
            height:     scrolled ? 0 : 2,
            transition: "height 0.3s ease",
          }}
        />
      </header>
    </>
  );
}
