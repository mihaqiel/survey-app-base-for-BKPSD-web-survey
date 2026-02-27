export const dynamic = "force-dynamic";

"use client";

import { createPegawai, deletePegawai } from "@/app/action/admin";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Employee { id: string; nama: string; }

function getInitials(nama: string) {
  return nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function PegawaiGrid({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState("");
  const filtered = employees.filter((e) => e.nama.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* SEARCH */}
      <div className="flex items-center gap-3 bg-white border-2 border-transparent focus-within:border-[#009CC5] px-4 py-3.5 transition-colors">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input type="text" placeholder="Cari nama pegawai..." value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-sm font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")}
            className="text-[10px] font-black text-gray-300 hover:text-[#132B4F] uppercase tracking-widest transition-colors">
            ✕
          </button>
        )}
      </div>

      {/* COUNT */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#009CC5]">
          {query ? `${filtered.length} hasil untuk "${query}"` : `${employees.length} Pegawai Terdaftar`}
        </p>
        {query && filtered.length > 0 && (
          <p className="text-[10px] font-medium text-gray-400">{filtered.length} ditemukan</p>
        )}
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-16 flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Tidak ada pegawai ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div key={emp.id}
              className="group relative bg-white border border-gray-200 border-l-4 flex items-center gap-4 px-5 py-4 hover:bg-[#F0F4F8] transition-colors"
              style={{ borderLeftColor: "#009CC5" }}
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-[#132B4F] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-black text-[#FAE705]">{getInitials(emp.nama)}</span>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-[#132B4F] leading-snug pr-4">{emp.nama}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Pegawai BKPSDM</p>
              </div>

              {/* Delete */}
              <form action={deletePegawai.bind(null, emp.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="submit" title="Hapus"
                  className="w-6 h-6 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black">
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeManagementPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch("/api/pegawai").then((r) => r.json()).then(setEmployees).catch(() => {});
  }, []);

  if (showAddForm) {
    return (
      <div className="min-h-screen font-sans bg-[#F0F4F8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-7 bg-[#FAE705]" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Pegawai</p>
              <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F] leading-none">Tambah Pegawai Baru</h1>
            </div>
          </div>
          <button onClick={() => setShowAddForm(false)}
            className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
            ← Kembali
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-[#009CC5]" />
            <div className="p-8">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-6">Detail Pegawai</p>
              <form action={createPegawai} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input name="nama" type="text" required placeholder="e.g. Rina Sapariyani, S.Kom"
                    className="w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-colors"
                  />
                  <p className="text-[10px] text-gray-400 font-medium mt-2">Sertakan gelar akademik jika ada (e.g. S.Kom, S.IP, M.Si)</p>
                </div>
                <button type="submit"
                  className="w-full py-4 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] transition-colors">
                  + Tambah Pegawai
                </button>
              </form>
            </div>
          </div>

          <div className="bg-[#132B4F] border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />
            <div className="p-8 space-y-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-2">Tentang Fitur Ini</p>
                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Pegawai yang didaftarkan akan muncul di dropdown pencarian saat responden mengisi formulir survei SKM.
                </p>
              </div>
              <div className="border-t border-white/10 pt-6 space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">Panduan</p>
                {[
                  "Masukkan nama lengkap sesuai dokumen resmi, termasuk gelar akademik.",
                  "Nama pegawai dapat dicari secara real-time di formulir survei publik.",
                  "Menghapus pegawai tidak akan menghapus respons survei historis mereka.",
                  "Setiap respons terhubung permanen ke pegawai yang dipilih saat pengisian.",
                ].map((text, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 bg-[#009CC5] flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <p className="text-xs font-medium text-white/60 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FAE705]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Tersedia di formulir survei segera setelah disimpan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-7 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · SDM</p>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F] leading-none">Manajemen Pegawai</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin"
            className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
            ← Dashboard
          </Link>
          <div className="px-4 py-2 bg-[#F0F4F8] border border-gray-200 text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
            {employees.length} Pegawai
          </div>
          <button onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] transition-colors">
            + Tambah Pegawai
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6">
        <PegawaiGrid employees={employees} />
      </div>
    </div>
  );
}
