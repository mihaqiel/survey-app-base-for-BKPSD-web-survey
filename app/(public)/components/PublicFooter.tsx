"use client";

import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Image src="/logo-bkpsdm.png" alt="BKPSDM" width={48} height={36}
                className="object-contain h-9 w-auto brightness-0 invert" />
              <div className="w-px h-7 bg-white/20" />
              <div>
                <p className="text-xs font-semibold text-white">BKPSDM</p>
                <p className="text-xs text-white/50">Kab. Kepulauan Anambas</p>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs border-l-2 border-blue-500 pl-3">
              Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
            </p>
          </div>

          {/* RIGHT: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">Hubungi Kami</h4>
            <div className="space-y-2">
              <p className="flex items-start gap-2 text-sm text-white/50">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                Jl. Pasir Peti, Kec. Siantan, Kab. Anambas, Kepulauan Riau
              </p>
              <a href="tel:+6275321xxxx"
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200">
                <Phone className="w-4 h-4 shrink-0 text-blue-400" />
                0812-6671-4935
              </a>
              <a href="mailto:bkpsdm@anambaskab.go.id"
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200">
                <Mail className="w-4 h-4 shrink-0 text-blue-400" />
                bkpsdm@anambaskab.go.id
              </a>
            </div>

            {/* SOCIAL ICONS */}
            <div className="flex gap-2 pt-1">
              <a href="#" target="_blank" rel="noopener noreferrer" title="Instagram"
                className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" title="Facebook"
                className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" title="YouTube"
                className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-white/30">
              &copy; {year} BKPSDM Kabupaten Kepulauan Anambas &mdash; Sistem Survei Kepuasan Masyarakat
            </p>
            <p className="text-xs text-white/30">
              Berdasarkan Permenpan RB Nomor 14 Tahun 2017 tentang Pedoman Penyusunan SKM
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
