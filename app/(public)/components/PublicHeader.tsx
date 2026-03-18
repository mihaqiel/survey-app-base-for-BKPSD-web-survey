"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",        label: "Beranda" },
  { href: "/tentang", label: "Tentang Kami" },
];

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      {/* LOGO ROW */}
      <Link href="/" className="block group">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center gap-8 md:gap-16">
          <div className="transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo-anambas.png"
              alt="Lambang Kepulauan Anambas"
              width={64}
              height={72}
              className="object-contain h-14 w-auto"
            />
          </div>

          <div className="w-px h-10 bg-gray-200 hidden sm:block" />

          <div className="transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo-anambas-maju.png"
              alt="Anambas Maju - Energi Baru"
              width={140}
              height={64}
              className="object-contain h-12 w-auto"
            />
          </div>

          <div className="w-px h-10 bg-gray-200 hidden sm:block" />

          <div className="transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo-bkpsdm.png"
              alt="BKPSDM Anambas"
              width={100}
              height={64}
              className="object-contain h-12 w-auto"
            />
          </div>
        </div>
      </Link>

      {/* NAV BAR */}
      <div className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors duration-200 ${
                  isActive
                    ? "text-[#FAE705]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#FAE705] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
