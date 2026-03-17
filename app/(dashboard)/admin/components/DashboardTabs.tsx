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
      {open && <div className="absolute top-full right-0 mt-1 z-50 animate-fade-down">{children}</div>}
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
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
          open ? "bg-[#132B4F] text-white border-[#132B4F]" : "bg-white border-gray-200 text-[#132B4F] hover:border-gray-300"
        }`}>
        {pill.dot && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />}
        <span className="text-gray-400">{pill.label}</span>
        <span className="font-black" style={{ color: open ? "white" : pill.color }}>{pill.value}</span>
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white border border-gray-200 shadow-lg rounded-sm w-44 animate-fade-down">
          <div className="h-0.5 w-full" style={{ backgroundColor: pill.color }} />
          <div className="p-4">
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">{labels[pill.label]}</p>
            <p className="text-3xl font-black leading-none mb-2" style={{ color: pill.color }}>{pill.value}</p>
            <p className="text-[9px] text-gray-400">{subs[pill.label]}</p>
            {pill.dot && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Live</span>
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
        className={`flex items-center gap-2 min-w-[200px] px-3 py-2 border-2 cursor-pointer transition-all ${
          open ? "border-[#009CC5]" : "border-gray-200 hover:border-gray-300"
        } bg-white`}
      >
        <div className="flex-1 flex items-center gap-1.5 flex-wrap">
          {selected.length === 0 ? (
            <span className="text-[10px] text-gray-400 font-medium">{placeholder}</span>
          ) : selected.map(id => {
            const opt = options.find(o => o.id === id);
            return (
              <div key={id} className="flex items-center gap-1 bg-[#009CC5] text-white px-2 py-0.5 rounded text-[9px] font-black">
                {opt?.label ?? id}
                <button type="button" onClick={e => { e.stopPropagation(); toggle(id); }}
                  className="hover:text-yellow-300 transition-colors">×</button>
              </div>
            );
          })}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute top-full left-0 z-50 w-full min-w-[240px] bg-white border border-gray-200 shadow-lg mt-1 animate-fade-down">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Pilih Periode</p>
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            {options.map(opt => {
              const isSelected = selected.includes(opt.id);
              return (
                <button key={opt.id} type="button" onClick={() => toggle(opt.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F4F8] transition-colors text-left ${isSelected ? "bg-[#F0F8FF]" : ""}`}>
                  <div className={`w-4 h-4 border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? "bg-[#009CC5] border-[#009CC5]" : "border-gray-300"
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-[#132B4F] truncate">{opt.label}</p>
                    <p className="text-[9px] text-gray-400">{opt.status === "AKTIF" ? "● Aktif" : "Nonaktif"}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[9px] text-gray-400">{selected.length} dipilih</span>
              <button type="button" onClick={() => onChange([])}
                className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest">
                Hapus Semua
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
    if (ikm >= 88.31) return "#16a34a";
    if (ikm >= 76.61) return "#009CC5";
    if (ikm >= 65)    return "#d97706";
    return "#dc2626";
  };

  const ikmLabel = (ikm: number) => {
    if (ikm === 0)    return "No Data";
    if (ikm >= 88.31) return "Sangat Baik";
    if (ikm >= 76.61) return "Baik";
    if (ikm >= 65)    return "Kurang Baik";
    return "Tidak Baik";
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-[#132B4F] to-[#FAE705]" />
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#132B4F]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Perbandingan Riwayat Periode</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Pilih beberapa periode untuk dibandingkan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MultiComboBox
              options={periodes}
              selected={selectedIds}
              onChange={setSelectedIds}
              placeholder="Pilih periode..."
            />
            <button onClick={handleCompare} disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#132B4F] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#009CC5] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150">
              {loading ? (
                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memuat...</>
              ) : "Bandingkan"}
            </button>
          </div>
        </div>

        <div className="p-5">
          {compData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="grid grid-cols-3 gap-2 opacity-20">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-16 h-20 bg-[#132B4F] rounded-sm" style={{ opacity: 0.3 + i * 0.2 }} />
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                {periodes.length === 0 ? "Belum ada periode" : "Pilih periode untuk membandingkan"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {compData.map((d, i) => (
                  <div key={d.periodeId} className="bg-[#F8FAFC] border border-gray-200 overflow-hidden animate-fade-up"
                    style={{ animationDelay: `${i * 75}ms` }}>
                    <div className="h-1" style={{ backgroundColor: ikmColor(d.ikm) }} />
                    <div className="p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 truncate">{d.label}</p>
                      <p className="text-3xl font-black leading-none mb-1" style={{ color: ikmColor(d.ikm) }}>
                        {d.ikm > 0 ? d.ikm.toFixed(2) : "—"}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: ikmColor(d.ikm) }}>
                        {ikmLabel(d.ikm)}
                      </p>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">Responden</span>
                        <span className="text-[11px] font-black text-[#132B4F]">{d.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison table */}
              <div className="border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-4 px-5 py-2 bg-[#F8FAFC] border-b border-gray-100">
                  {["Periode", "IKM", "Kategori", "Responden"].map(h => (
                    <p key={h} className="text-[8px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {compData.sort((a, b) => b.ikm - a.ikm).map((d) => (
                    <div key={d.periodeId} className="grid grid-cols-4 items-center px-5 py-3 hover:bg-[#F8FAFC] transition-colors">
                      <p className="text-[11px] font-bold text-[#132B4F] truncate pr-2">{d.label}</p>
                      <p className="text-[11px] font-black" style={{ color: ikmColor(d.ikm) }}>
                        {d.ikm > 0 ? d.ikm.toFixed(2) : "—"}
                      </p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block ${
                        d.ikm >= 88.31 ? "bg-green-50 text-green-700" :
                        d.ikm >= 76.61 ? "bg-sky-50 text-sky-700" :
                        d.ikm >= 65    ? "bg-amber-50 text-amber-700" :
                        d.ikm > 0      ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-400"
                      }`}>{ikmLabel(d.ikm)}</span>
                      <p className="text-[11px] text-gray-500">{d.count}</p>
                    </div>
                  ))}
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
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-10 shadow-sm">
        <div className="flex items-center px-6">
          {/* Tabs */}
          <div className="flex items-stretch shrink-0">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-150 whitespace-nowrap ${
                  activeTab === tab ? "border-[#009CC5] text-[#009CC5]" : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Metric pills */}
          <div className={`flex items-center gap-2 px-4 overflow-hidden transition-all duration-300 ${
            toolbarOpen ? "flex-1 opacity-100" : "w-0 opacity-0 pointer-events-none"
          }`}>
            {pills.map(pill => <MetricPill key={pill.label} pill={pill} />)}
          </div>

          {/* Toolbar */}
          <div className={`flex items-center gap-1.5 py-2 transition-all duration-300 ml-auto ${
            toolbarOpen ? "opacity-100" : "opacity-0 pointer-events-none w-0 overflow-hidden"
          }`}>
            <button aria-label="Notifikasi"
              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:bg-[#F0F4F8] transition-colors rounded-sm">
              <Bell className="w-3.5 h-3.5 text-gray-500" />
            </button>

            <Popover trigger={
              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-[#F0F4F8] text-[9px] font-black uppercase tracking-widest text-[#132B4F] transition-colors cursor-pointer rounded-sm">
                {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                Export
              </div>
            }>
              <div className="bg-white border border-gray-200 shadow-lg rounded-sm w-44">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Export sebagai</p>
                </div>
                <div className="py-1">
                  <button onClick={handleExport} disabled={exporting}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F4F8] transition-colors text-left disabled:opacity-40">
                    <Table className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-[11px] font-bold text-[#132B4F]">Excel (.xlsx)</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F4F8] transition-colors text-left opacity-40 cursor-not-allowed">
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-[11px] font-bold text-[#132B4F]">PDF (coming soon)</span>
                  </button>
                </div>
              </div>
            </Popover>

            <Popover trigger={
              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-[#F0F4F8] text-[9px] font-black uppercase tracking-widest text-[#132B4F] transition-colors cursor-pointer rounded-sm">
                <Filter className="w-3 h-3" />Filter
              </div>
            }>
              <div className="bg-white border border-gray-200 shadow-lg rounded-sm w-48">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Filter Tampilan</p>
                </div>
                <div className="py-1">
                  {[
                    { label: "Sangat Baik (≥88.31)", color: "#16a34a" },
                    { label: "Baik (≥76.61)",        color: "#009CC5" },
                    { label: "Kurang Baik (≥65)",    color: "#d97706" },
                    { label: "Tidak Baik (<65)",      color: "#dc2626" },
                    { label: "Semua Layanan",         color: "#132B4F" },
                  ].map(item => (
                    <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F4F8] transition-colors text-left">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-[#132B4F]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Popover>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <form action={logoutAction}>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-150 rounded-sm">
                <LogOut className="w-3 h-3" />Log Out
              </button>
            </form>
          </div>

          {/* Toggle */}
          <button onClick={() => setToolbarOpen(o => !o)} aria-label={toolbarOpen ? "Tutup toolbar" : "Buka toolbar"}
            className="ml-2 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors shrink-0">
            {toolbarOpen
              ? <X className="w-3.5 h-3.5" />
              : <div className="flex flex-col gap-0.5"><div className="w-3 h-0.5 bg-current" /><div className="w-3 h-0.5 bg-current" /><div className="w-3 h-0.5 bg-current" /></div>
            }
          </button>
        </div>
      </div>

      {/* TAB BODY */}
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
        {activeTab === "Ringkasan" && ringkasanContent}
        {activeTab === "Performa"  && performaContent}
        {activeTab === "Riwayat"   && <RiwayatTab periodes={periodes} />}
      </div>
    </>
  );
}