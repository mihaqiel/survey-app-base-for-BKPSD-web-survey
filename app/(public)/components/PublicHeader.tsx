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
      className={`bg-white border-b-4 border-[#009CC5] sticky top-0 z-50 animate-fade-down transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_20px_rgba(19,43,79,0.12)]" : ""
      }`}
    >
      {/* TOP STRIPE */}
      <div className="h-2 bg-[#132B4F]" />
      <div
        className="h-1"
        style={{
          background:
            "linear-gradient(to right, #FAE705 33%, #009CC5 33% 66%, #132B4F 66%)",
        }}
      />

      {/* LOGO ROW */}
      <Link href="/" className="block group">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-center gap-8 md:gap-16">

          <div className="animate-fade-up delay-75 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo-anambas.png"
              alt="Lambang Kepulauan Anambas"
              width={64}
              height={72}
              className="object-contain h-16 w-auto"
            />
          </div>

          <div className="w-px h-12 bg-gray-200 hidden sm:block" />

          <div className="animate-fade-up delay-150 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo-anambas-maju.png"
              alt="Anambas Maju - Energi Baru"
              width={140}
              height={64}
              className="object-contain h-14 w-auto"
            />
          </div>

          <div className="w-px h-12 bg-gray-200 hidden sm:block" />

          <div className="animate-fade-up delay-225 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo-bkpsdm.png"
              alt="BKPSDM Anambas"
              width={100}
              height={64}
              className="object-contain h-14 w-auto"
            />
          </div>
        </div>
      </Link>

      {/* TITLE BAR */}
      <div className="bg-[#132B4F]">
        <div className="max-w-4xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in delay-300">
            <div className="w-2.5 h-2.5 bg-[#FAE705] shrink-0 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
              Portal Survei Kepuasan Masyarakat (SKM)
            </p>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 hidden sm:block animate-fade-in delay-375">
            Permenpan RB No. 14 Tahun 2017
          </p>
        </div>
      </div>
    </header>
  );
}