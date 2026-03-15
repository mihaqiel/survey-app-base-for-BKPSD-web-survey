"use client";

import { useState, useEffect, useTransition } from "react";
import { getAllLayanan, createLayanan, deleteLayanan } from "@/app/action/admin";
import Link from "next/link";
import {
  BarChart3, Layers, Plus, Trash2,
  Info, X, ChevronRight, Search, TrendingUp, Bell,
} from "lucide-react";

// ── types ──────────────────────────────────────────────────────────────────
interface Service { id: string; nama: string; }

// ── IKM helpers ────────────────────────────────────────────────────────────
function ikmColor(ikm: number) {
  if (ikm === 0)    return "#94a3b8";
  if (ikm >= 88.31) return "#16a34a";
  if (ikm >= 76.61) return "#009CC5";
  if (ikm >= 65)    return "#d97706";
  return "#dc2626";
}
function ikmLabel(ikm: number) {
  if (ikm === 0)    return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65)    return "Kurang Baik";
  return "Tidak Baik";
}
function ikmBg(ikm: number) {
  if (ikm === 0)    return "bg-gray-100 text-gray-400";
  if (ikm >= 88.31) return "bg-green-50 text-green-700";
  if (ikm >= 76.61) return "bg-sky-50 text-sky-700";
  if (ikm >= 65)    return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

// ── Add form panel ─────────────────────────────────────────────────────────
function AddPanel({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createLayanan(formData);
      onClose();
    });
  };

  return (
    <div className="h-full flex flex-col animate-slide-right">
      {/* Panel header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-[#132B4F]">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#FAE705]" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white">Tambah Layanan Baru</p>
        </div>
        <button onClick={onClose} title="Tutup panel" aria-label="Tutup panel"
          className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Nama Layanan <span className="text-red-400">*</span>
            </label>
            <input
              name="nama" type="text" required title="Nama Layanan"
              placeholder="e.g. Layanan Mutasi Pegawai"
              className="input-glow w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200 hover:border-gray-300"
            />
          </div>
          <button
            type="submit" disabled={isPending}
            className="btn-shimmer group w-full py-3.5 bg-[#009CC5] text-white font-black text-sm uppercase tracking-widest hover:bg-[#132B4F] hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(0,156,197,0.25)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
            ) : (
              <><Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />Buat Layanan Ini</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Guidelines */}
        <div className="bg-[#132B4F] p-5 space-y-4">
          <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5] -mx-5 -mt-5 mb-4" />
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5]">Panduan</p>
          {[
            "Gunakan nama layanan resmi sesuai dokumen Standar Pelayanan.",
            "Setiap layanan dilacak terpisah di analitik dengan skor IKM-nya sendiri.",
            "Menghapus layanan akan menghapus semua respons terkait secara permanen.",
            "Sistem mendukung hingga 22 layanan sesuai Permenpan RB 14/2017.",
          ].map((text, i) => (
            <div key={i} className="flex gap-3 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-6 h-6 bg-[#009CC5] flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-xs font-medium text-white/60 leading-relaxed">{text}</p>
            </div>
          ))}
          <div className="border-t border-white/10 pt-3 flex items-center gap-2">
            <Info className="w-3 h-3 text-[#FAE705]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Perubahan otomatis disimpan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Overview chart (right panel default) ──────────────────────────────────
function OverviewPanel({ services }: { services: Service[] }) {
  // We show a simple static bar overview here using CSS bars
  // For the full interactive chart, users navigate to the service detail page
  const total = services.length;

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#009CC5]" />
          <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Ringkasan Layanan SKM</p>
        </div>
        <p className="text-[9px] text-gray-400 font-medium mt-1 pl-6">Pilih layanan di kiri untuk melihat analitik detail</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Layanan",    val: total,                                    color: "#132B4F" },
            { label: "Aktif Dinilai",    val: services.length,                          color: "#009CC5" },
            { label: "Sesuai Standar",   val: `≤22`,                                   color: "#16a34a" },
          ].map((s, i) => (
            <div key={s.label} className="bg-[#F0F4F8] border border-gray-200 p-4 animate-count-up card-hover" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Service list with accent bars */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Daftar Layanan Terdaftar</p>
          <div className="space-y-2">
            {services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Layers className="w-8 h-8 text-gray-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada layanan</p>
              </div>
            ) : services.map((s, i) => (
              <Link
                key={s.id}
                href={`/admin/layanan/${s.id}`}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 hover:border-[#009CC5] hover:shadow-[0_2px_8px_rgba(0,156,197,0.12)] transition-all duration-200 group animate-fade-up card-hover"
                style={{ animationDelay: `${Math.min(i * 25, 400)}ms` }}
              >
                <div className="w-6 h-6 flex items-center justify-center text-[9px] font-black shrink-0"
                  style={{ backgroundColor: i < 3 ? ["#FAE705", "#132B4F", "#F0F4F8"][i] : "#F0F4F8", color: i === 1 ? "white" : "#132B4F" }}>
                  {i + 1}
                </div>
                <div className="w-0.5 h-5 bg-[#009CC5] shrink-0" />
                <p className="flex-1 text-sm font-bold text-[#132B4F] group-hover:text-[#009CC5] transition-colors truncate">{s.nama}</p>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#009CC5] transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Permenpan note */}
        <div className="border border-gray-200 bg-white p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#009CC5] shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#132B4F] mb-1">Standar Permenpan RB 14/2017</p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Sistem ini mendukung hingga 22 jenis layanan. Setiap layanan diukur menggunakan 9 unsur SKM standar nasional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ServiceManagementPage() {
  const [services, setServices]     = useState<Service[]>([]);
  const [query, setQuery]           = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchServices = () => {
    startTransition(async () => {
      const data = await getAllLayanan() as Service[];
      setServices(data);
    });
  };

  useEffect(() => { fetchServices(); }, []);

  const filtered = services.filter(s =>
    s.nama.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteLayanan(id);
      fetchServices();
    });
  };

  return (
    <div className="font-sans bg-[#F0F4F8] flex flex-col" style={{ height: "100vh" }}>

      {/* GLOBAL HEADER */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div className="animate-slide-left">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Portal Survei</p>
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none">Layanan</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 animate-slide-right">
          <div className="hidden md:flex items-center gap-2 bg-[#F0F4F8] border border-gray-200 px-3 py-1.5 w-44">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-400 font-medium">Search Global...</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F4F8] border border-gray-200">
            <Layers className="w-3.5 h-3.5 text-[#009CC5]" />
            <span className="text-[10px] font-black text-[#132B4F]">{services.length} Layanan</span>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="btn-shimmer group flex items-center gap-2 px-3 py-1.5 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]">
            <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
            Tambah Layanan
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 shrink-0">
        <div className="flex items-center">
          {["Performa Layanan", "Daftar Responden", "Pengaturan"].map((tab, i) => (
            <button key={tab} className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-150 whitespace-nowrap ${i === 0 ? "border-[#009CC5] text-[#009CC5]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SPLIT PANELS */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT PANEL — service list */}
        <div className="w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col animate-slide-left">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 bg-[#FAE705]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Daftar Layanan</p>
            </div>
            {/* Search */}
            <div className={`flex items-center gap-2 border-2 px-3 py-2 transition-all duration-200 ${
              query ? "border-[#009CC5] shadow-[0_0_0_3px_rgba(0,156,197,0.12)]" : "border-gray-200 hover:border-gray-300"
            }`}>
              <Search className={`w-3.5 h-3.5 shrink-0 transition-colors ${query ? "text-[#009CC5]" : "text-gray-300"}`} />
              <input
                type="text" placeholder="Cari layanan..." value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-xs font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} title="Hapus pencarian" aria-label="Hapus pencarian"
                  className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-all duration-150">
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 gap-2">
                <Layers className="w-8 h-8 text-gray-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">
                  {query ? "Tidak ditemukan" : "Belum ada layanan"}
                </p>
              </div>
            ) : filtered.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F0F4F8] transition-colors group animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 25, 400)}ms` }}
              >
                <span className="text-[9px] font-black text-gray-300 w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <Link href={`/admin/layanan/${s.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-4 bg-[#009CC5] shrink-0" />
                    <p className="text-sm font-bold text-[#132B4F] group-hover:text-[#009CC5] transition-colors truncate">{s.nama}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                  <Link href={`/admin/layanan/${s.id}`}
                    className="flex items-center gap-1 px-2 py-1 bg-[#009CC5] text-white text-[8px] font-black uppercase tracking-widest hover:bg-[#132B4F] transition-colors">
                    <BarChart3 className="w-2.5 h-2.5" />
                    Detail
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    title={`Hapus ${s.nama}`}
                    aria-label={`Hapus ${s.nama}`}
                    className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-150">
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer count */}
          <div className="px-4 py-3 border-t border-gray-100 shrink-0">
            <p className="text-[9px] font-bold text-gray-400">
              {filtered.length} dari {services.length} layanan
            </p>
          </div>
        </div>

        {/* RIGHT PANEL — add form OR overview */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
          <div className="h-full bg-white">
            {showAdd ? (
              <AddPanel onClose={() => { setShowAdd(false); fetchServices(); }} />
            ) : (
              <OverviewPanel services={services} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}