"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);

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

      {/* TITLE BAR */}
      <div className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 py-2 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-white">
            Portal Survei Kepuasan Masyarakat (SKM)
          </p>
          <p className="text-xs font-medium text-white/50 hidden sm:block">
            Permenpan RB No. 14 Tahun 2017
          </p>
        </div>
      </div>
    </header>
  );
}
