"use client";

import { useState, useEffect, useTransition } from "react";
import { getAllPegawai, createPegawai, deletePegawai, getPegawaiDetail } from "@/app/action/admin";
import StatusBadge, { ikmColor, ikmLabel } from "@/components/ui/StatusBadge";
import {
  Search, X, Users, Plus, Star, BarChart3,
  ChevronRight, Trash2, User, Settings,
} from "lucide-react";

interface Employee { id: string; nama: string; }

// ── Star Rating Display ─────────────────────────────────────────────────────
function RatingIndicator({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className="w-4 h-4 transition-colors"
          style={{
            color: i < Math.round(value) ? "#FAE705" : "#e2e8f0",
            fill: i < Math.round(value) ? "#FAE705" : "none",
          }} />
      ))}
      <span className="text-[11px] font-black text-[#132B4F] ml-1">
        {value > 0 ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

// ── Employee Detail Panel ───────────────────────────────────────────────────
function PegawaiDetailPanel({ employee }: { employee: Employee }) {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "performa" | "responden">("ringkasan");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPegawaiDetail(employee.id).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [employee.id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <div className="w-5 h-5 border-2 border-[#009CC5]/20 border-t-[#009CC5] rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Memuat data...</p>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Data tidak ditemukan</p>
    </div>
  );

  const initials = employee.nama.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-[#132B4F]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FAE705] flex items-center justify-center shrink-0 text-sm font-black text-[#132B4F]">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Data Pegawai</p>
            <h2 className="text-sm font-black text-white truncate">{employee.nama}</h2>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black leading-none" style={{ color: data.ikm > 0 ? ikmColor(data.ikm) : "#94a3b8" }}>
              {data.ikm > 0 ? data.ikm.toFixed(1) : "—"}
            </p>
            <p className="text-[8px] font-black uppercase tracking-widest mt-0.5" style={{ color: data.ikm > 0 ? ikmColor(data.ikm) : "#94a3b8" }}>
              IKM
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { key: "ringkasan",  label: "Ringkasan",  icon: <User className="w-3 h-3" /> },
          { key: "performa",   label: "Performa",   icon: <BarChart3 className="w-3 h-3" /> },
          { key: "responden",  label: "Responden",  icon: <Users className="w-3 h-3" /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab.key ? "border-[#009CC5] text-[#009CC5]" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="p-5 space-y-5">
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Survei",       value: data.totalSurveys, color: "#009CC5" },
                { label: "IKM Rata-rata",       value: data.ikm > 0 ? `${data.ikm.toFixed(1)}%` : "—", color: ikmColor(data.ikm) },
                { label: "Layanan Ditangani",   value: data.layananStats.length, color: "#132B4F" },
                { label: "Feedback Negatif",    value: data.negFeedback, color: data.negFeedback > 0 ? "#dc2626" : "#16a34a" },
              ].map(c => (
                <div key={c.label} className="bg-[#F8FAFC] border border-gray-200 p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{c.label}</p>
                  <p className="text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Rating Indicator */}
            <div className="bg-white border border-gray-200 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Rating dari Responden</p>
              <RatingIndicator value={data.avgRating} />
              <p className="text-[9px] text-gray-400 mt-2">
                {data.avgRating > 0
                  ? `Rata-rata dari responden yang memberikan rating`
                  : "Belum ada rating dari responden"}
              </p>
            </div>

            {/* Status badge */}
            {data.ikm > 0 && (
              <div className="flex items-center justify-between bg-[#F8FAFC] border border-gray-200 px-4 py-3">
                <span className="text-[10px] font-bold text-[#132B4F]">Status Kinerja</span>
                <StatusBadge ikm={data.ikm} />
              </div>
            )}
          </div>
        )}

        {/* PERFORMA */}
        {activeTab === "performa" && (
          <div className="p-5 space-y-4">
            {data.layananStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <BarChart3 className="w-10 h-10 text-gray-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data performa</p>
              </div>
            ) : (
              <>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Performa per Layanan</p>
                <div className="border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-4 px-4 py-2 bg-[#F8FAFC] border-b border-gray-100">
                    {["Layanan", "Survei", "IKM", "Status"].map(h => (
                      <p key={h} className="text-[8px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                    ))}
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.layananStats.map((ls: any) => (
                      <div key={ls.layananId} className="grid grid-cols-4 items-center px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
                        <p className="text-[11px] font-bold text-[#132B4F] truncate pr-2">{ls.layananNama}</p>
                        <p className="text-[10px] text-gray-500">{ls.count}</p>
                        <p className="text-[10px] font-black" style={{ color: ikmColor(ls.ikm) }}>{ls.ikm.toFixed(2)}</p>
                        <StatusBadge ikm={ls.ikm} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar visualization */}
                <div className="space-y-2">
                  {data.layananStats.map((ls: any) => {
                    const pct = Math.min((ls.ikm / 100) * 100, 100);
                    return (
                      <div key={ls.layananId}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-[#132B4F] truncate max-w-[200px]">{ls.layananNama}</span>
                          <span className="text-[10px] font-black shrink-0 ml-2" style={{ color: ikmColor(ls.ikm) }}>{ls.ikm.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: ikmColor(ls.ikm) }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* RESPONDEN */}
        {activeTab === "responden" && (
          <div className="p-5 space-y-3">
            <div className="border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-5 px-4 py-2 bg-[#F8FAFC] border-b border-gray-100">
                {["Nama", "Layanan", "Tanggal", "IKM", "Rating"].map(h => (
                  <p key={h} className="text-[8px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {data.respondents.length === 0 ? (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada responden</p>
                  </div>
                ) : data.respondents.map((r: any) => (
                  <div key={r.id} className="grid grid-cols-5 items-center px-4 py-2.5 hover:bg-[#F8FAFC] transition-colors">
                    <p className="text-[11px] font-bold text-[#132B4F] truncate">{r.nama}</p>
                    <p className="text-[10px] text-gray-500 truncate">{r.layananNama}</p>
                    <p className="text-[10px] text-gray-400">{r.tglLayanan}</p>
                    <p className="text-[10px] font-black" style={{ color: ikmColor(r.ikm) }}>{r.ikm.toFixed(1)}</p>
                    <div className="flex items-center gap-0.5">
                      {r.rating ? (
                        <>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3"
                              style={{ color: i < r.rating ? "#FAE705" : "#e2e8f0", fill: i < r.rating ? "#FAE705" : "none" }} />
                          ))}
                        </>
                      ) : <span className="text-[9px] text-gray-300">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Employee Panel ──────────────────────────────────────────────────────
function AddPegawaiPanel({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => { await createPegawai(formData); onClose(); });
  };
  return (
    <div className="p-6 space-y-4 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-0.5 h-4 bg-[#009CC5]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Tambah Pegawai Baru</p>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input name="nama" type="text" required title="Nama Pegawai"
            placeholder="e.g. JOHN DOE, S.AP"
            className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all" />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full py-3 bg-[#009CC5] text-white font-black text-sm uppercase tracking-widest hover:bg-[#132B4F] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><Plus className="w-4 h-4" />Tambah Pegawai</>}
        </button>
      </form>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function DataPegawaiPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery]         = useState("");
  const [selected, setSelected]   = useState<Employee | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchEmployees = () => {
    startTransition(async () => {
      const data = await getAllPegawai() as Employee[];
      setEmployees(data);
    });
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter(e => e.nama.toLowerCase().includes(query.toLowerCase()));

  const getInitials = (nama: string) => nama.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className="font-sans bg-[#F0F4F8] flex flex-col" style={{ height: "100vh" }}>

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-0.5 h-6 bg-[#FAE705]" />
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#009CC5]">BKPSDM · Admin</p>
            <h1 className="text-base font-black uppercase tracking-tight text-[#132B4F] leading-none">Data Pegawai</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#F0F4F8] border border-gray-200 px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-[#009CC5]" />
            <span className="text-[10px] font-black text-[#132B4F]">{employees.length} Pegawai</span>
          </div>
          <button onClick={() => { setShowAdd(true); setSelected(null); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] transition-all">
            <Plus className="w-3.5 h-3.5" />Tambah
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT — employee list */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className={`flex items-center gap-2 border-2 px-3 py-2 transition-all ${
              query ? "border-[#009CC5]" : "border-gray-200 hover:border-gray-300"
            }`}>
              <Search className={`w-3.5 h-3.5 shrink-0 ${query ? "text-[#009CC5]" : "text-gray-300"}`} />
              <input type="text" placeholder="Cari pegawai..." value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-xs font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none" />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Hapus pencarian">
                  <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 gap-2">
                <Users className="w-8 h-8 text-gray-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">
                  {query ? "Tidak ditemukan" : "Belum ada pegawai"}
                </p>
              </div>
            ) : filtered.map((e) => (
              <button key={e.id} onClick={() => { setSelected(e); setShowAdd(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F0F4F8] transition-colors text-left group ${
                  selected?.id === e.id ? "bg-[#F0F8FF] border-r-2 border-[#009CC5]" : ""
                }`}>
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 text-[10px] font-black transition-all ${
                  selected?.id === e.id ? "bg-[#009CC5] text-white" : "bg-[#F0F4F8] text-[#132B4F] group-hover:bg-[#009CC5] group-hover:text-white"
                }`}>
                  {getInitials(e.nama)}
                </div>
                <p className={`flex-1 text-sm font-bold truncate transition-colors ${
                  selected?.id === e.id ? "text-[#009CC5]" : "text-[#132B4F] group-hover:text-[#009CC5]"
                }`}>
                  {e.nama}
                </p>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${selected?.id === e.id ? "text-[#009CC5]" : "text-gray-300"}`} />
              </button>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100">
            <p className="text-[9px] text-gray-400">{filtered.length} dari {employees.length} pegawai</p>
          </div>
        </div>

        {/* RIGHT — detail or add */}
        <div className="flex-1 overflow-y-auto bg-white">
          {showAdd ? (
            <AddPegawaiPanel onClose={() => { setShowAdd(false); fetchEmployees(); }} />
          ) : selected ? (
            <PegawaiDetailPanel key={selected.id} employee={selected} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-10">
              <div className="w-16 h-16 bg-[#F0F4F8] flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Pilih Pegawai</p>
                <p className="text-[11px] text-gray-400 max-w-xs">
                  Klik salah satu pegawai di panel kiri untuk melihat detail performa dan riwayat penilaian
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}