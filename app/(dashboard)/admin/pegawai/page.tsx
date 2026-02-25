"use client";

import { createPegawai, deletePegawai } from "@/app/action/admin";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Employee { id: string; nama: string; }

function PegawaiGrid({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState("");
  const filtered = employees.filter((e) => e.nama.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input type="text" placeholder="Cari nama pegawai..."
          value={query} onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:outline-none shadow-sm transition"
          style={{ color: "#132B4F" }}
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition text-xs font-black">✕</button>
        )}
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#009CC5" }}>
        {query ? `${filtered.length} hasil untuk "${query}"` : `Menampilkan semua ${employees.length} pegawai`}
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-sm font-bold text-gray-300">Tidak ada pegawai yang cocok dengan "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((emp) => (
            <div key={emp.id} className="group relative bg-white rounded-2xl border border-gray-100 px-4 py-4 hover:shadow-md transition-all"
              style={{ borderLeftWidth: "3px", borderLeftColor: "#009CC5" }}
            >
              <p className="text-xs font-black leading-snug pr-6" style={{ color: "#132B4F" }}>{emp.nama}</p>
              <form action={deletePegawai.bind(null, emp.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="submit" title="Hapus" className="w-5 h-5 flex items-center justify-center bg-red-50 rounded-md text-red-400 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black">✕</button>
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
      <div className="min-h-screen p-8 font-sans flex flex-col" style={{ backgroundColor: "#F0F4F8", color: "#132B4F" }}>
        <div className="max-w-6xl mx-auto w-full mb-8">
          <button onClick={() => setShowAddForm(false)} className="text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "#009CC5" }}>
            ← Kembali ke Pegawai
          </button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-3" style={{ color: "#132B4F" }}>Tambah Pegawai Baru</h1>
          <p className="text-sm font-medium mt-1 text-gray-500">Daftarkan pegawai baru untuk seleksi survei.</p>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: "#009CC5" }}>Detail Pegawai</h3>
            <form action={createPegawai} className="flex flex-col flex-1 space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Nama Lengkap *</label>
                <input name="nama" type="text" required placeholder="e.g. Rina Sapariyani, S.Kom"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none font-bold"
                  style={{ color: "#132B4F" }}
                />
                <p className="text-[10px] text-gray-400 font-medium mt-2 ml-1">Sertakan gelar akademik jika ada (e.g. S.Kom, S.IP, M.Si)</p>
              </div>
              <div className="flex-1" />
              <button type="submit" className="w-full py-4 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 text-xs" style={{ backgroundColor: "#132B4F" }}>
                + Tambah Pegawai
              </button>
            </form>
          </div>

          <div className="p-8 rounded-2xl text-white flex flex-col space-y-6" style={{ backgroundColor: "#132B4F" }}>
            <div className="h-1 w-16 rounded-full" style={{ backgroundColor: "#FAE705" }} />
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#009CC5" }}>Tentang Fitur Ini</h3>
              <p className="text-sm font-medium leading-relaxed text-white/70">Pegawai yang didaftarkan di sini akan muncul di dropdown pencarian saat responden mengisi formulir survei SKM.</p>
            </div>
            <div className="border-t border-white/10 pt-6 space-y-4 flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#FAE705" }}>Panduan</h4>
              {[
                "Masukkan nama lengkap sesuai dokumen resmi, termasuk gelar akademik.",
                "Nama pegawai dapat dicari secara real-time di formulir survei publik.",
                "Menghapus pegawai tidak akan menghapus respons survei historis mereka.",
                "Setiap respons terhubung permanen ke pegawai yang dipilih saat pengisian.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5" style={{ backgroundColor: "#009CC5" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-xs font-medium text-white/60 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FAE705" }} />
              Tersedia di formulir survei segera setelah disimpan
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 font-sans" style={{ backgroundColor: "#F0F4F8", color: "#132B4F" }}>
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest mb-4 block hover:opacity-70 transition-opacity" style={{ color: "#009CC5" }}>
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: "#132B4F" }}>Manajemen Pegawai</h1>
          <p className="text-sm font-medium mt-2 text-gray-500">Kelola daftar pegawai yang tersedia untuk pemilihan survei.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest" style={{ color: "#132B4F" }}>
            Total: {employees.length} Pegawai
          </div>
          <button onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 hover:opacity-90"
            style={{ backgroundColor: "#009CC5" }}
          >
            + Tambah Pegawai
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <PegawaiGrid employees={employees} />
      </div>
    </div>
  );
}