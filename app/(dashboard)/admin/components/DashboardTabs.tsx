"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Download, Filter, LogOut, X, FileText, Table,
  ChevronDown, Check, Loader2, TrendingUp, BarChart2,
} from "lucide-react";
import {
  getPeriodeComparisonData,
  getGlobalExportData,
  getLayananPeriodeComparison,
} from "@/app/action/admin";

interface Pill { label: string; value: number | string; color: string; dot: boolean; }
interface PeriodeOption { id: string; label: string; status: string; }
interface LayananOption { id: string; nama: string; }

interface Props {
  pills: Pill[];
  periodLabel: string;
  periodes: PeriodeOption[];
  layananList: LayananOption[];
  selectedPeriodeId?: string;
  logoutAction: () => Promise<void>;
  ringkasanContent: React.ReactNode;
  performaContent: React.ReactNode;
}

const TABS = ["Ringkasan", "Performa", "Riwayat"] as const;
type Tab = typeof TABS[number];

const ikmColor = (ikm: number) => {
  if (ikm === 0)    return "#94a3b8";
  if (ikm >= 88.31) return "#10b981";
  if (ikm >= 76.61) return "#3b82f6";
  if (ikm >= 65)    return "#f59e0b";
  return "#ef4444";
};

const ikmLabel = (ikm: number) => {
  if (ikm === 0)    return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65)    return "Kurang Baik";
  return "Tidak Baik";
};

const ikmBadgeClass = (ikm: number) =>
  ikm >= 88.31 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
  ikm >= 76.61 ? "bg-blue-50 text-blue-700 border border-blue-100" :
  ikm >= 65    ? "bg-amber-50 text-amber-700 border border-amber-100" :
  ikm > 0      ? "bg-red-50 text-red-700 border border-red-100" :
                 "bg-gray-100 text-gray-500 border border-gray-200";

// ── Popover wrapper ─────────────────────────────────────────────────────────
function Popover({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("click", h, true), 0);
    return () => { clearTimeout(t); document.removeEventListener("click", h, true); };
  }, [open]);
  return (
    <div ref={containerRef} className="relative" style={{ overflow: "visible" }}>
      <div onClickCapture={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className="absolute top-full right-0 mt-2 z-[9999]" style={{ overflow: "visible" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Metric pill ─────────────────────────────────────────────────────────────
function MetricPill({ pill }: { pill: Pill }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const labels: Record<string, string> = {
    Responden:  "Total Responden",
    Layanan:    "Total Layanan SKM",
    IKM:        "Overall IKM Score",
    Pengaduan:  "Pengaduan Belum Ditangani",
  };
  const subs: Record<string, string> = {
    Responden:  "Responden terkumpul",
    Layanan:    "Layanan terdaftar",
    IKM:        "Indeks Kepuasan Masyarakat",
    Pengaduan:  "Status: Baru · perlu tindak lanjut",
  };
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3.5 py-1.5 border rounded-full text-xs font-semibold transition-all duration-150 shadow-sm ${
          open ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white border-gray-200 text-slate-600 hover:border-gray-300 hover:bg-gray-50/50"
        }`}>
        {pill.dot && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
        <span>{pill.label}</span>
        <span className="font-bold ml-1 rounded-md px-1.5" style={{ color: open ? "#1d4ed8" : pill.color, backgroundColor: `${pill.color}15` }}>{pill.value}</span>
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 bg-white border border-gray-100 shadow-xl rounded-xl w-48 animate-fade-down overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: pill.color }} />
          <div className="p-5">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">{labels[pill.label]}</p>
            <p className="text-3xl font-bold tracking-tight mb-1">{pill.value}</p>
            <p className="text-xs text-slate-400 font-medium">{subs[pill.label]}</p>
            {pill.dot && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Polling</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MultiComboBox ───────────────────────────────────────────────────────────
function MultiComboBox({
  options, selected, onChange, placeholder,
}: {
  options: PeriodeOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 min-w-[220px] px-3.5 py-2.5 rounded-lg border shadow-sm cursor-pointer transition-all ${
          open ? "border-blue-400 ring-2 ring-blue-400/20" : "border-gray-200 hover:border-gray-300"
        } bg-white`}>
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {selected.length === 0 ? (
            <span className="text-sm text-slate-400">{placeholder}</span>
          ) : selected.map(id => {
            const opt = options.find(o => o.id === id);
            return (
              <div key={id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-xs font-semibold">
                {opt?.label ?? id}
                <button type="button" onClick={e => { e.stopPropagation(); toggle(id); }} className="hover:text-blue-900 transition-colors ml-1">&times;</button>
              </div>
            );
          })}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute top-full right-0 z-50 w-full min-w-[260px] bg-white border border-gray-100 shadow-xl rounded-xl mt-2 animate-fade-down overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Pilih Periode</p>
          </div>
          <div className="max-h-60 overflow-y-auto w-full">
            {options.map(opt => {
              const isSelected = selected.includes(opt.id);
              return (
                <button key={opt.id} type="button" onClick={() => toggle(opt.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50/50 last:border-0 ${isSelected ? "bg-blue-50/50" : ""}`}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-blue-900" : "text-slate-700"}`}>{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${opt.status === "AKTIF" ? "bg-emerald-500" : "bg-slate-300"}`} />
                      {opt.status === "AKTIF" ? "Aktif" : "Nonaktif"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">{selected.length} dipilih</span>
              <button type="button" onClick={() => onChange([])} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Bersihkan</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Period filter dropdown (toolbar) ─────────────────────────────────────────
function PeriodFilter({ periodes, selectedPeriodeId }: { periodes: PeriodeOption[]; selectedPeriodeId?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const selected = periodes.find(p => p.id === selectedPeriodeId);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-md border text-xs font-semibold transition-all shadow-sm ${
          selected ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-slate-600 hover:border-gray-300"
        }`}>
        <Filter className="w-3 h-3 shrink-0" />
        <span className="max-w-[120px] truncate">{selected?.label ?? "Semua Periode"}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-current opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-100 shadow-xl rounded-xl w-60 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Dashboard</p>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            <button
              onClick={() => { router.push("/admin"); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${!selected ? "bg-blue-50/50" : ""}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${!selected ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                {!selected && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div>
                <p className={`text-sm font-medium ${!selected ? "text-blue-700" : "text-slate-700"}`}>Semua Periode</p>
                <p className="text-xs text-slate-400">Gabungan seluruh data</p>
              </div>
            </button>
            {periodes.map(p => (
              <button key={p.id}
                onClick={() => { router.push(`/admin?periode=${p.id}`); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${selectedPeriodeId === p.id ? "bg-blue-50/50" : ""}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPeriodeId === p.id ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                  {selectedPeriodeId === p.id && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedPeriodeId === p.id ? "text-blue-700" : "text-slate-700"}`}>{p.label}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${p.status === "AKTIF" ? "bg-emerald-500" : "bg-slate-300"}`} />
                    {p.status === "AKTIF" ? "Aktif · sedang berjalan" : "Selesai"}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {selected && (
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
              <button onClick={() => { router.push("/admin"); setOpen(false); }}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                × Reset ke Semua Periode
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Layanan single select ────────────────────────────────────────────────────
function LayananSelect({
  layananList, selectedId, onChange,
}: {
  layananList: LayananOption[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = search ? layananList.filter(l => l.nama.toLowerCase().includes(search.toLowerCase())) : layananList;
  const selected = layananList.find(l => l.id === selectedId);
  return (
    <div ref={ref} className="relative min-w-[220px]">
      <div onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border shadow-sm cursor-pointer transition-all bg-white ${
          open ? "border-blue-400 ring-2 ring-blue-400/20" : "border-gray-200 hover:border-gray-300"
        }`}>
        <span className={`flex-1 text-sm truncate ${selected ? "font-medium text-slate-900" : "text-slate-400"}`}>
          {selected?.nama ?? "Pilih layanan..."}
        </span>
        {selected && (
          <button type="button" onClick={e => { e.stopPropagation(); onChange(""); }}
            className="text-gray-400 hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute top-full left-0 z-50 w-full min-w-[280px] bg-white border border-gray-100 shadow-xl rounded-xl mt-2 overflow-hidden">
          <div className="p-2 border-b border-gray-50">
            <input
              type="text"
              placeholder="Cari layanan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 text-sm text-slate-900 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">Tidak ditemukan</p>
            ) : filtered.map(l => (
              <button key={l.id} type="button" onClick={() => { onChange(l.id); setSearch(""); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50/50 last:border-0 ${selectedId === l.id ? "bg-blue-50/60" : ""}`}>
                <div className={`w-1.5 h-4 rounded-full shrink-0 ${selectedId === l.id ? "bg-blue-500" : "bg-gray-200"}`} />
                <span className={`text-sm font-medium flex-1 ${selectedId === l.id ? "text-blue-700" : "text-slate-700"}`}>{l.nama}</span>
                {selectedId === l.id && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Riwayat tab ──────────────────────────────────────────────────────────────
function RiwayatTab({ periodes, layananList }: { periodes: PeriodeOption[]; layananList: LayananOption[] }) {
  // Section A: Period comparison
  const [selectedIds, setSelectedIds]   = useState<string[]>([]);
  const [compData, setCompData]         = useState<any[]>([]);
  const [loadingComp, setLoadingComp]   = useState(false);

  // Section B: Layanan comparison
  const [layananId, setLayananId]           = useState("");
  const [layananPeriodeIds, setLayananPeriodeIds] = useState<string[]>([]);
  const [layananResult, setLayananResult]   = useState<{ layananNama: string; data: any[] } | null>(null);
  const [loadingLayanan, setLoadingLayanan] = useState(false);

  const handleComparePeriodes = async () => {
    if (!selectedIds.length) return;
    setLoadingComp(true);
    setCompData(await getPeriodeComparisonData(selectedIds));
    setLoadingComp(false);
  };

  const handleCompareLayanan = async () => {
    if (!layananId || !layananPeriodeIds.length) return;
    setLoadingLayanan(true);
    setLayananResult(await getLayananPeriodeComparison(layananId, layananPeriodeIds));
    setLoadingLayanan(false);
  };

  return (
    <div className="space-y-6">

      {/* ── SECTION A: Period overview comparison ─────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Perbandingan Antar Periode</h3>
              <p className="text-sm text-slate-500 mt-0.5">Bandingkan IKM keseluruhan lintas periode survei</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MultiComboBox options={periodes} selected={selectedIds} onChange={setSelectedIds} placeholder="Pilih periode..." />
            <button onClick={handleComparePeriodes} disabled={selectedIds.length === 0 || loadingComp}
              className="flex items-center justify-center min-w-[110px] gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loadingComp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bandingkan"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {compData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <TrendingUp className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-400">
                {periodes.length === 0 ? "Belum ada periode tersimpan" : "Pilih periode untuk melihat perbandingan IKM"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {compData.map((d, i) => (
                  <div key={d.periodeId}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative"
                    style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="h-1 w-full" style={{ backgroundColor: ikmColor(d.ikm) }} />
                    <div className="p-5">
                      <p className="text-sm font-semibold text-slate-500 mb-3 truncate">{d.label}</p>
                      <p className="text-4xl font-bold tracking-tight mb-2" style={{ color: ikmColor(d.ikm) }}>
                        {d.ikm > 0 ? d.ikm.toFixed(2) : "—"}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ikmBadgeClass(d.ikm)}`}>
                        {ikmLabel(d.ikm)}
                      </span>
                      {/* Mini bar */}
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>IKM Score</span><span>{d.count} responden</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(d.ikm / 100) * 100}%`, backgroundColor: ikmColor(d.ikm) }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Table */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {["Periode", "Skor IKM", "Kategori", "Responden"].map(h => (
                        <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...compData].sort((a, b) => b.ikm - a.ikm).map(d => (
                      <tr key={d.periodeId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-slate-900 max-w-[200px] truncate">{d.label}</td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-bold" style={{ color: ikmColor(d.ikm) }}>{d.ikm > 0 ? d.ikm.toFixed(2) : "—"}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ikmBadgeClass(d.ikm)}`}>{ikmLabel(d.ikm)}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION B: Layanan comparison across periods ──────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Tren Layanan Lintas Periode</h3>
              <p className="text-sm text-slate-500 mt-0.5">Pilih satu layanan dan bandingkan performanya di berbagai periode</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <LayananSelect layananList={layananList} selectedId={layananId} onChange={setLayananId} />
            <MultiComboBox options={periodes} selected={layananPeriodeIds} onChange={setLayananPeriodeIds} placeholder="Pilih periode..." />
            <button onClick={handleCompareLayanan} disabled={!layananId || layananPeriodeIds.length === 0 || loadingLayanan}
              className="flex items-center justify-center min-w-[110px] gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loadingLayanan ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tren"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {!layananResult ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center mb-3">
                <BarChart2 className="w-7 h-7 text-violet-200" />
              </div>
              <p className="text-sm font-medium text-slate-400">
                {layananList.length === 0
                  ? "Belum ada layanan tersimpan"
                  : "Pilih layanan dan periode untuk melihat tren IKM-nya"}
              </p>
            </div>
          ) : layananResult.data.length === 0 ? (
            <p className="text-center py-10 text-sm text-slate-400">Tidak ada data untuk kombinasi ini</p>
          ) : (
            <div className="space-y-6">
              {/* Layanan name header */}
              <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-5 py-3">
                <div className="w-2 h-6 rounded-full bg-violet-500" />
                <div>
                  <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide">Layanan yang Dianalisis</p>
                  <p className="text-sm font-bold text-slate-900">{layananResult.layananNama}</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-violet-600 bg-white border border-violet-200 px-2.5 py-1 rounded-full">
                  {layananResult.data.length} periode
                </span>
              </div>

              {/* Bar visualization */}
              <div className="space-y-3">
                {[...layananResult.data].sort((a, b) => {
                  // sort by original selection order
                  return layananPeriodeIds.indexOf(a.periodeId) - layananPeriodeIds.indexOf(b.periodeId);
                }).map(d => (
                  <div key={d.periodeId} className="flex items-center gap-4">
                    <div className="w-36 shrink-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{d.label}</p>
                      <p className="text-xs text-slate-400">{d.count} responden</p>
                    </div>
                    <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max((d.ikm / 100) * 100, d.ikm > 0 ? 8 : 0)}%`, backgroundColor: ikmColor(d.ikm) }}>
                        {d.ikm > 30 && (
                          <span className="text-xs font-bold text-white">{d.ikm.toFixed(1)}</span>
                        )}
                      </div>
                      {d.ikm <= 30 && d.ikm > 0 && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: ikmColor(d.ikm) }}>{d.ikm.toFixed(1)}</span>
                      )}
                      {d.ikm === 0 && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Belum ada data</span>
                      )}
                    </div>
                    <span className={`w-20 shrink-0 text-center inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold ${ikmBadgeClass(d.ikm)}`}>
                      {ikmLabel(d.ikm)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Comparison table */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {["Periode", "Skor IKM", "Δ vs Sebelumnya", "Kategori", "Responden"].map(h => (
                        <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {layananResult.data.map((d, i) => {
                      const prev = i > 0 ? layananResult!.data[i - 1].ikm : null;
                      const delta = prev !== null && d.ikm > 0 && prev > 0 ? d.ikm - prev : null;
                      return (
                        <tr key={d.periodeId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-slate-900 max-w-[180px] truncate">{d.label}</td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-bold" style={{ color: ikmColor(d.ikm) }}>
                              {d.ikm > 0 ? d.ikm.toFixed(2) : "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {delta !== null ? (
                              <span className={`text-xs font-bold flex items-center gap-1 ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(2)}
                              </span>
                            ) : <span className="text-xs text-slate-300">—</span>}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ikmBadgeClass(d.ikm)}`}>{ikmLabel(d.ikm)}</span>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-600">{d.count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function DashboardTabs({
  pills, periodLabel, periodes, layananList, selectedPeriodeId,
  logoutAction, ringkasanContent, performaContent,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Ringkasan");
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await getGlobalExportData();
      if (!result) { alert("Tidak ada periode aktif."); return; }
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Data SKM");
      ws.addRow(["Layanan", "Nama", "Tanggal", "JK", "Pendidikan", "Pekerjaan", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9", "Saran"]);
      result.data.forEach((svc: any) => {
        svc.rawResponses.forEach((r: any) => {
          ws.addRow([svc.serviceName, r.Nama, r.Tanggal, r.JK, r.Pendidikan, r.Pekerjaan, r.U1, r.U2, r.U3, r.U4, r.U5, r.U6, r.U7, r.U8, r.U9, r.Saran]);
        });
      });
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `SKM_${result.periodLabel}.xlsx`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Gagal export."); }
    finally { setExporting(false); }
  };

  return (
    <>
      {/* TABS + TOOLBAR ROW */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] sm:top-[76px] z-30 shadow-sm" style={{ overflow: "visible" }}>
        <div className="flex flex-col sm:flex-row sm:items-center px-4 sm:px-6 gap-3 sm:gap-6 pt-3 sm:pt-0" style={{ overflow: "visible" }}>

          {/* Tabs */}
          <div className="flex items-stretch shrink-0 overflow-x-auto no-scrollbar scroll-smooth">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3.5 text-sm font-semibold transition-all duration-200 whitespace-nowrap relative ${
                  activeTab === tab ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                }`}>
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-100 shrink-0" />

          {/* Controls */}
          <div className="flex items-center gap-3 flex-1 justify-between sm:justify-start pb-3 sm:pb-0" style={{ overflow: "visible" }}>

            {/* Period filter (only on Ringkasan / Performa tabs) */}
            {(activeTab === "Ringkasan" || activeTab === "Performa") && toolbarOpen && (
              <PeriodFilter periodes={periodes} selectedPeriodeId={selectedPeriodeId} />
            )}

            {/* Period label badge when filtered */}
            {selectedPeriodeId && toolbarOpen && (activeTab === "Ringkasan" || activeTab === "Performa") && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5 max-w-[160px] truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {periodLabel}
              </span>
            )}

            {/* Metric pills */}
            <div className={`flex items-center gap-2 transition-all duration-300 ${
              toolbarOpen ? "opacity-100 min-w-max" : "w-0 opacity-0 pointer-events-none"
            }`}>
              {pills.map(pill => <MetricPill key={pill.label} pill={pill} />)}
            </div>

            {/* Toolbar buttons */}
            <div className={`flex items-center gap-2 transition-all duration-300 ml-auto bg-gray-50/80 p-1.5 rounded-lg border border-gray-100/50 ${
              toolbarOpen ? "opacity-100 shrink-0" : "opacity-0 pointer-events-none w-0"
            }`} style={{ overflow: "visible" }}>
              <button aria-label="Notifikasi"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all">
                <Bell className="w-4 h-4" />
              </button>

              <Popover trigger={
                <button className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-md bg-white border border-gray-200 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                  {exporting ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <Download className="w-4 h-4 text-slate-500" />}
                  Export
                </button>
              }>
                <div className="bg-white border border-gray-100 shadow-xl rounded-xl w-48 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Unduh Laporan</p>
                  </div>
                  <div className="py-2">
                    <button onClick={handleExport} disabled={exporting}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left disabled:opacity-50">
                      <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <Table className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Tabel Excel</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left opacity-60 cursor-not-allowed">
                      <div className="w-7 h-7 rounded-md bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Dokumen PDF</span>
                    </button>
                  </div>
                </div>
              </Popover>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              <form action={logoutAction}>
                <button className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-md border border-red-200 text-red-600 text-sm font-medium bg-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <LogOut className="w-4 h-4" />Keluar
                </button>
              </form>
            </div>

            {/* Toggle */}
            <button onClick={() => setToolbarOpen(o => !o)} aria-label={toolbarOpen ? "Tutup ringkasan" : "Buka ringkasan"}
              className={`w-8 h-8 flex items-center justify-center rounded-md border shadow-sm transition-colors shrink-0 sticky right-0 z-10 ${
                toolbarOpen ? "bg-white border-gray-200 text-slate-400 hover:text-slate-600" : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
              }`}>
              {toolbarOpen ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* TAB BODY */}
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-8">
        <div className="animate-fade-in animate-duration-300">
          {activeTab === "Ringkasan" && ringkasanContent}
          {activeTab === "Performa"  && performaContent}
          {activeTab === "Riwayat"   && <RiwayatTab periodes={periodes} layananList={layananList} />}
        </div>
      </div>
    </>
  );
}
