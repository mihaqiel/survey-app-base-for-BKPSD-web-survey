"use client";

import { useState, useEffect, useTransition } from "react";
import { getAllPegawai, createPegawai, deletePegawai, getPegawaiDetail } from "@/app/action/admin";
import StatusBadge, { ikmColor, ikmLabel } from "@/components/ui/StatusBadge";
import {
  Search, X, Users, Plus, Star, BarChart3,
  ChevronRight, Trash2, User, Settings,
} from "lucide-react";

interface Employee { id: string; nama: string; }

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

// ── Response quality constants (client-safe, mirrors lib/fingerprint.ts) ──
const RESP_STATUS_LABELS: Record<string, string> = {
  normal: "Valid", suspicious: "Mencurigakan",
  low_quality: "Kualitas Rendah", spam: "Spam",
};
const RESP_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  normal:      { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
  suspicious:  { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  low_quality: { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5" },
  spam:        { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" },
};
function QualityBadge({ status, weight }: { status?: string; weight?: number }) {
  const s = status ?? "normal";
  const w = weight ?? 1.0;
  const c = RESP_STATUS_COLORS[s] ?? RESP_STATUS_COLORS.normal;
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`,
        padding: "1px 6px", borderRadius: "99px", fontSize: "0.65rem", fontWeight: 700, whiteSpace: "nowrap" }}>
        {RESP_STATUS_LABELS[s] ?? s}
      </span>
      {w < 1.0 && (
        <span style={{ fontSize: "0.65rem", color: "#f59e0b", fontWeight: 600 }}>×{w.toFixed(1)}</span>
      )}
    </div>
  );
}

// ── Star Rating Display ─────────────────────────────────────────────────────
function RatingIndicator({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className="w-4 h-4 transition-colors"
          style={{
            color: i < Math.round(value) ? "#f59e0b" : "#e2e8f0",
            fill: i < Math.round(value) ? "#f59e0b" : "none",
          }} />
      ))}
      <span className="text-sm font-bold text-slate-900 ml-1">
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
  const [showAllRespondents, setShowAllRespondents] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPegawaiDetail(employee.id).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [employee.id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-400">Memuat data...</p>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-slate-400">Data tidak ditemukan</p>
    </div>
  );

  const initials = employee.nama.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-blue-600">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Data Pegawai</p>
            <h2 className="text-base font-semibold text-slate-900 truncate">{employee.nama}</h2>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold leading-none" style={{ color: data.ikm > 0 ? ikmColor(data.ikm) : "#94a3b8" }}>
              {data.ikm > 0 ? data.ikm.toFixed(1) : "—"}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">IKM</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        {[
          { key: "ringkasan",  label: "Ringkasan",  icon: <User className="w-3.5 h-3.5" /> },
          { key: "performa",   label: "Performa",   icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { key: "responden",  label: "Responden",  icon: <Users className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
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
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Survei",       value: data.totalSurveys, color: "#3b82f6" },
                { label: "IKM Rata-rata",       value: data.ikm > 0 ? `${data.ikm.toFixed(1)}%` : "—", color: ikmColor(data.ikm) },
                { label: "Layanan Ditangani",   value: data.layananStats.length, color: undefined },
                { label: "Responden Memberi Saran", value: data.negFeedback, color: data.negFeedback > 0 ? "#f59e0b" : "#10b981" },
              ].map(c => (
                <div key={c.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">{c.label}</p>
                  <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">Rating dari Responden</p>
              <RatingIndicator value={data.avgRating} />
              <p className="text-xs text-slate-400 mt-2">
                {data.avgRating > 0 ? "Rata-rata dari responden yang memberikan rating" : "Belum ada rating dari responden"}
              </p>
            </div>

            {data.ikm > 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Status Kinerja</span>
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
                <BarChart3 className="w-10 h-10 text-slate-200" />
                <p className="text-sm text-slate-400">Belum ada data performa</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-500">Performa per Layanan</p>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {["Layanan", "Survei", "IKM", "Status"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.layananStats.map((ls: any) => (
                        <tr key={ls.layananId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 truncate pr-2">{ls.layananNama}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{ls.count}</td>
                          <td className="px-4 py-3 text-sm font-bold" style={{ color: ikmColor(ls.ikm) }}>{ls.ikm.toFixed(2)}</td>
                          <td className="px-4 py-3"><StatusBadge ikm={ls.ikm} size="sm" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  {data.layananStats.map((ls: any) => {
                    const pct = Math.min((ls.ikm / 100) * 100, 100);
                    return (
                      <div key={ls.layananId}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{ls.layananNama}</span>
                          <span className="text-xs font-bold shrink-0 ml-2" style={{ color: ikmColor(ls.ikm) }}>{ls.ikm.toFixed(1)}</span>
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
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {["Nama", "Layanan", "Tanggal", "IKM", "Rating", "Kualitas"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.respondents.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">Belum ada responden</td></tr>
                  ) : (showAllRespondents ? data.respondents : data.respondents.slice(0, 20)).map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900 truncate">{r.nama}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-500 truncate">{r.layananNama}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-400">{r.tglLayanan}</td>
                      <td className="px-4 py-2.5 text-sm font-bold" style={{ color: ikmColor(r.ikm) }}>{r.ikm.toFixed(1)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-0.5">
                          {r.rating ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3"
                                style={{ color: i < r.rating ? "#f59e0b" : "#e2e8f0", fill: i < r.rating ? "#f59e0b" : "none" }} />
                            ))
                          ) : <span className="text-xs text-slate-300">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <QualityBadge status={r.responStatus} weight={r.weight} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.respondents.length > 20 && (
              <button
                onClick={() => setShowAllRespondents(v => !v)}
                className="w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {showAllRespondents
                  ? "Tampilkan lebih sedikit"
                  : `Lihat semua ${data.respondents.length} responden`}
              </button>
            )}
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
    <div className="p-6 space-y-4">
      <div>
        <p className="text-xs font-semibold text-blue-600 mb-1">Pegawai Baru</p>
        <h3 className="text-base font-semibold text-slate-900">Tambah Pegawai</h3>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input name="nama" type="text" required title="Nama Pegawai" placeholder="e.g. JOHN DOE, S.AP" className={inputClass} />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full py-3 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
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
    <div className="font-sans bg-gray-50/50 flex flex-col" style={{ height: "100vh" }}>

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Data Pegawai</h1>
          <p className="text-xs text-slate-500">Kelola data pegawai dan kinerja</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">{employees.length} Pegawai</span>
          </div>
          <button onClick={() => { setShowAdd(true); setSelected(null); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
            <Plus className="w-3.5 h-3.5" />Tambah
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${
              query ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
            }`}>
              <Search className={`w-3.5 h-3.5 shrink-0 ${query ? "text-blue-600" : "text-slate-300"}`} />
              <input type="text" placeholder="Cari pegawai..." value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-xs font-medium text-slate-900 placeholder-gray-300 bg-transparent outline-none" />
              {query && <button onClick={() => setQuery("")} aria-label="Hapus pencarian"><X className="w-3 h-3 text-slate-400 hover:text-red-400" /></button>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 gap-2">
                <Users className="w-8 h-8 text-slate-200" />
                <p className="text-sm text-slate-400 text-center">
                  {query ? "Tidak ditemukan" : "Belum ada pegawai"}
                </p>
              </div>
            ) : filtered.map((e) => (
              <button key={e.id} onClick={() => { setSelected(e); setShowAdd(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group ${
                  selected?.id === e.id ? "bg-blue-50 border-r-2 border-blue-600" : ""
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                  selected?.id === e.id ? "bg-blue-600 text-white" : "bg-gray-50 text-slate-700 group-hover:bg-blue-600 group-hover:text-white"
                }`}>
                  {getInitials(e.nama)}
                </div>
                <p className={`flex-1 text-sm font-medium truncate transition-colors ${
                  selected?.id === e.id ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
                }`}>
                  {e.nama}
                </p>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${selected?.id === e.id ? "text-blue-600" : "text-slate-300"}`} />
              </button>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100">
            <p className="text-xs text-slate-400">{filtered.length} dari {employees.length} pegawai</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 overflow-y-auto bg-white">
          {showAdd ? (
            <AddPegawaiPanel onClose={() => { setShowAdd(false); fetchEmployees(); }} />
          ) : selected ? (
            <PegawaiDetailPanel key={selected.id} employee={selected} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-10">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Pilih Pegawai</p>
                <p className="text-sm text-slate-400 max-w-xs">Klik salah satu pegawai di panel kiri untuk melihat detail performa dan riwayat penilaian</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
