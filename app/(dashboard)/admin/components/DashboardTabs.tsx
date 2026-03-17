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

  const labels: Record<string, string> = { Survei: "Total Active Surveys", Layanan: "Total Services", Responden: "Total Respondents", IKM: "Overall IKM Score" };
  const subs:   Record<string, string> = { Survei: "Active surveys", Layanan: "Registered services", Responden: "Collected responses", IKM: "Public Satisfaction Index" };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-[12px] font-bold uppercase tracking-wide transition-all duration-150 ${
          open ? "bg-[#132B4F] text-white border-[#132B4F]" : "bg-white border-gray-300 text-[#132B4F] hover:border-gray-400"
        }`}>
        {pill.dot && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />}
        <span className="text-gray-600">{pill.label}</span>
        <span className="font-bold" style={{ color: open ? "white" : pill.color }}>{pill.value}</span>
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 bg-white border border-gray-200 shadow-lg rounded-lg w-48 animate-fade-down">
          <div className="h-1 w-full rounded-t-lg" style={{ backgroundColor: pill.color }} />
          <div className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-2">{labels[pill.label]}</p>
            <p className="text-4xl font-bold leading-none mb-3" style={{ color: pill.color }}>{pill.value}</p>
            <p className="text-[12px] text-gray-600">{subs[pill.label]}</p>
            {pill.dot && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-wide">Live</span>
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
    if (ikm >= 88.31) return "Excellent";
    if (ikm >= 76.61) return "Good";
    if (ikm >= 65)    return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 overflow-hidden rounded-lg">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-[15px] font-bold text-[#132B4F]">Period Comparison</h3>
            <p className="text-[13px] text-gray-500 mt-1">Select multiple periods to compare results</p>
          </div>
          <div className="flex items-center gap-3">
            <MultiComboBox
              options={periodes}
              selected={selectedIds}
              onChange={setSelectedIds}
              placeholder="Select periods..."
            />
            <button onClick={handleCompare} disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#132B4F] text-white text-[12px] font-bold uppercase tracking-wide hover:bg-[#0A7BA3] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 rounded-md">
              {loading ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</>
              ) : "Compare"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {compData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="grid grid-cols-3 gap-3 opacity-20">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-20 h-24 bg-[#132B4F] rounded-lg" style={{ opacity: 0.3 + i * 0.2 }} />
                ))}
              </div>
              <p className="text-[13px] font-bold text-gray-400">
                {periodes.length === 0 ? "No periods available" : "Select periods to compare"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {compData.map((d, i) => (
                  <div key={d.periodeId} className="bg-gray-50 border border-gray-200 overflow-hidden rounded-lg animate-fade-up"
                    style={{ animationDelay: `${i * 75}ms` }}>
                    <div className="h-1.5" style={{ backgroundColor: ikmColor(d.ikm) }} />
                    <div className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-2 truncate">{d.label}</p>
                      <p className="text-4xl font-bold leading-none mb-1" style={{ color: ikmColor(d.ikm) }}>
                        {d.ikm > 0 ? d.ikm.toFixed(2) : "—"}
                      </p>
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ikmColor(d.ikm) }}>
                        {ikmLabel(d.ikm)}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-[12px] font-bold text-gray-600">Respondents</span>
                        <span className="text-[13px] font-bold text-[#132B4F]">{d.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison table */}
              <div className="border border-gray-200 overflow-hidden rounded-lg">
                <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
                  {["Period", "IKM", "Category", "Respondents"].map(h => (
                    <p key={h} className="text-[11px] font-bold uppercase tracking-wide text-gray-600">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-100">
                  {compData.sort((a, b) => b.ikm - a.ikm).map((d) => (
                    <div key={d.periodeId} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                      <p className="text-[13px] font-bold text-[#132B4F] truncate pr-2">{d.label}</p>
                      <p className="text-[13px] font-bold" style={{ color: ikmColor(d.ikm) }}>
                        {d.ikm > 0 ? d.ikm.toFixed(2) : "—"}
                      </p>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full inline-block ${
                        d.ikm >= 88.31 ? "bg-green-50 text-green-700" :
                        d.ikm >= 76.61 ? "bg-sky-50 text-sky-700" :
                        d.ikm >= 65    ? "bg-amber-50 text-amber-700" :
                        d.ikm > 0      ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-400"
                      }`}>{ikmLabel(d.ikm)}</span>
                      <p className="text-[12px] font-bold text-gray-600">{d.count}</p>
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
      <div className="bg-white border-b border-gray-200 sticky top-[140px] z-10 shadow-sm">
        <div className="flex items-center px-8 justify-between">
          {/* Tabs */}
          <div className="flex items-stretch shrink-0">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-[13px] font-bold uppercase tracking-wide border-b-3 transition-all duration-150 whitespace-nowrap ${
                  activeTab === tab ? "border-[#009CC5] text-[#009CC5]" : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className={`flex items-center gap-3 py-3 transition-all duration-300 ${
            toolbarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>

            <Popover trigger={
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-[12px] font-bold text-[#132B4F] transition-colors cursor-pointer rounded-md">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export
              </button>
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-[12px] font-bold text-[#132B4F] transition-colors cursor-pointer rounded-md">
                <Filter className="w-4 h-4" />Filter
              </button>
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
              <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-[12px] font-bold uppercase tracking-wide hover:bg-red-600 hover:text-white transition-all duration-150 rounded-md">
                <LogOut className="w-4 h-4" />Logout
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
      <div className="max-w-7xl mx-auto w-full px-8 py-8">
        {activeTab === "Ringkasan" && ringkasanContent}
        {activeTab === "Performa"  && performaContent}
        {activeTab === "Riwayat"   && <RiwayatTab periodes={periodes} />}
      </div>
    </>
  );
}
