"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Download, Filter, LogOut, X, FileText, Table, ChevronDown, Check, Loader2 } from "lucide-react";
import { getPeriodeComparisonData, getGlobalExportData } from "@/app/action/admin";

interface Pill { label: string; value: number | string; color: string; dot: boolean; }
interface PeriodeOption { id: string; label: string; status: string; }

interface Props {
  pills: Pill[];
  periodLabel: string;
  periodes: PeriodeOption[];
  logoutAction: () => Promise<void>;
  ringkasanContent: React.ReactNode;
  performaContent: React.ReactNode;
}

const TABS = ["Ringkasan", "Performa", "Riwayat"] as const;
type Tab = typeof TABS[number];

// ── Popover wrapper ─────────────────────────────────────────────────────────
function Popover({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">{trigger}</div>
      {open && <div className="absolute top-full right-0 mt-2 z-50 animate-fade-down">{children}</div>}
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

  const labels: Record<string, string> = { Survei: "Total Survei Aktif", Layanan: "Total Layanan SKM", Responden: "Total Responden", IKM: "Overall IKM Score" };
  const subs:   Record<string, string> = { Survei: "Survei berjalan", Layanan: "Layanan terdaftar", Responden: "Responden terkumpul", IKM: "Indeks Kepuasan Masyarakat" };

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

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 min-w-[220px] px-3.5 py-2.5 rounded-lg border shadow-sm cursor-pointer transition-all ${
          open ? "border-blue-400 ring-2 ring-blue-400/20" : "border-gray-200 hover:border-gray-300"
        } bg-white`}
      >
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {selected.length === 0 ? (
            <span className="text-sm text-slate-400">{placeholder}</span>
          ) : selected.map(id => {
            const opt = options.find(o => o.id === id);
            return (
              <div key={id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-xs font-semibold">
                {opt?.label ?? id}
                <button type="button" onClick={e => { e.stopPropagation(); toggle(id); }}
                  className="hover:text-blue-900 transition-colors ml-1">&times;</button>
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
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                  }`}>
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
              <button type="button" onClick={() => onChange([])}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                Bersihkan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Riwayat tab content ─────────────────────────────────────────────────────
function RiwayatTab({ periodes }: { periodes: PeriodeOption[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compData, setCompData]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(false);

  const handleCompare = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    const data = await getPeriodeComparisonData(selectedIds);
    setCompData(data);
    setLoading(false);
  };

  const ikmColor = (ikm: number) => {
    if (ikm === 0)    return "#94a3b8";
    if (ikm >= 88.31) return "#10b981"; // emerald
    if (ikm >= 76.61) return "#3b82f6"; // blue
    if (ikm >= 65)    return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const ikmLabel = (ikm: number) => {
    if (ikm === 0)    return "No Data";
    if (ikm >= 88.31) return "Sangat Baik";
    if (ikm >= 76.61) return "Baik";
    if (ikm >= 65)    return "Kurang Baik";
    return "Tidak Baik";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Perbandingan Riwayat Periode</h3>
            <p className="text-sm text-slate-500 mt-1">Pilih beberapa periode evaluasi untuk dibandingkan performa IKM-nya</p>
          </div>
          <div className="flex items-center gap-3">
            <MultiComboBox
              options={periodes}
              selected={selectedIds}
              onChange={setSelectedIds}
              placeholder="Pilih periode..."
            />
            <button onClick={handleCompare} disabled={selectedIds.length === 0 || loading}
              className="flex items-center justify-center min-w-[120px] gap-2 px-5 py-2.5 bg-[#132B4F] text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : "Bandingkan"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {compData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                <Table className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {periodes.length === 0 ? "Belum ada periode tersimpan" : "Pilih periode untuk melihat perbandingan trend metrik"}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {compData.map((d, i) => (
                  <div key={d.periodeId} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative animate-fade-up"
                    style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: ikmColor(d.ikm) }} />
                    <div className="p-6">
                      <p className="text-sm font-semibold text-slate-500 mb-4 truncate">{d.label}</p>
                      
                      <div className="flex items-baseline gap-2 mb-2">
                         <p className="text-4xl font-bold tracking-tight" style={{ color: ikmColor(d.ikm) }}>
                           {d.ikm > 0 ? d.ikm.toFixed(2) : "—"}
                         </p>
                      </div>
                      
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        d.ikm >= 88.31 ? "bg-emerald-50 text-emerald-700" :
                        d.ikm >= 76.61 ? "bg-blue-50 text-blue-700" :
                        d.ikm >= 65    ? "bg-amber-50 text-amber-700" :
                        d.ikm > 0      ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-500"
                      }`}>{ikmLabel(d.ikm)}</span>

                      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Jumlah Responden</span>
                        <div className="flex items-center gap-1.5">
                           <span className="text-base font-bold text-slate-900">{d.count}</span>
                           <span className="text-xs text-slate-400">Orang</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison table */}
              <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-gray-50/50 border-b border-gray-100">
                         <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Periode</th>
                         <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skor IKM</th>
                         <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                         <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Responden</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                       {compData.sort((a, b) => b.ikm - a.ikm).map((d) => (
                         <tr key={d.periodeId} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-[250px] truncate">{d.label}</td>
                           <td className="px-6 py-4">
                              <span className="text-sm font-bold" style={{ color: ikmColor(d.ikm) }}>
                                 {d.ikm > 0 ? d.ikm.toFixed(2) : "—"}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                               d.ikm >= 88.31 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                               d.ikm >= 76.61 ? "bg-blue-50 text-blue-700 border border-blue-100" :
                               d.ikm >= 65    ? "bg-amber-50 text-amber-700 border border-amber-100" :
                               d.ikm > 0      ? "bg-red-50 text-red-700 border border-red-100" : "bg-gray-100 text-gray-500 border border-gray-200"
                             }`}>{ikmLabel(d.ikm)}</span>
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-600">{d.count}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function DashboardTabs({
  pills, periodLabel, periodes, logoutAction,
  ringkasanContent, performaContent,
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
      <div className="bg-white border-b border-gray-100 sticky top-[73px] sm:top-[76px] z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center px-4 sm:px-6 gap-3 sm:gap-6 pt-3 sm:pt-0">
          
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

          {/* Controls Container */}
          <div className="flex items-center gap-4 flex-1 justify-between sm:justify-start pb-3 sm:pb-0 overflow-x-auto no-scrollbar">
            
            {/* Metric pills */}
            <div className={`flex items-center gap-2 transition-all duration-300 ${
              toolbarOpen ? "opacity-100 min-w-max" : "w-0 opacity-0 pointer-events-none"
            }`}>
              {pills.map(pill => <MetricPill key={pill.label} pill={pill} />)}
            </div>

            {/* Toolbar Buttons */}
            <div className={`flex items-center gap-2 transition-all duration-300 ml-auto bg-gray-50/80 p-1.5 rounded-lg border border-gray-100/50 ${
              toolbarOpen ? "opacity-100 shrink-0" : "opacity-0 pointer-events-none w-0 overflow-hidden"
            }`}>
              <button aria-label="Notifikasi"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all focus:ring-2 focus:ring-blue-100">
                <Bell className="w-4 h-4" />
              </button>

              <Popover trigger={
                <button className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-md bg-white border border-gray-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all focus:ring-2 focus:ring-blue-100">
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
                <button className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-md border border-red-200 text-red-600 text-sm font-medium bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm">
                  <LogOut className="w-4 h-4" />Keluar
                </button>
              </form>
            </div>

            {/* Toggle Switch */}
            <button onClick={() => setToolbarOpen(o => !o)} aria-label={toolbarOpen ? "Tutup ringkasan" : "Buka ringkasan"}
              className={`w-8 h-8 flex items-center justify-center rounded-md border shadow-sm transition-colors shrink-0 sticky right-0 z-10 ${
                 toolbarOpen ? "bg-white border-gray-200 text-slate-400 hover:text-slate-600" : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
              }`}>
              {toolbarOpen
                ? <X className="w-4 h-4" />
                : <Filter className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* TAB BODY */}
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-8">
        <div className="animate-fade-in animate-duration-300">
           {activeTab === "Ringkasan" && ringkasanContent}
           {activeTab === "Performa"  && performaContent}
           {activeTab === "Riwayat"   && <RiwayatTab periodes={periodes} />}
        </div>
      </div>
    </>
  );
}