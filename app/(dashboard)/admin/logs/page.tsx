"use client";

import { useEffect, useState, useRef } from "react";
import { FileText, ShieldAlert, Plus, RefreshCw, Archive, Check, ChevronDown, X } from "lucide-react";

export const dynamic = "force-dynamic";

interface Log {
  id: string;
  action: string;
  target: string;
  details: string | null;
  timestamp: string;
}

const ACTION_TYPES = ["CREATE", "UPDATE", "DELETE", "ARCHIVE"];

const ACTION_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  DELETE:  { bg: "bg-red-50",    text: "text-red-600",    icon: <ShieldAlert className="w-3 h-3" /> },
  ARCHIVE: { bg: "bg-amber-50",  text: "text-amber-700",  icon: <Archive className="w-3 h-3" /> },
  CREATE:  { bg: "bg-sky-50",    text: "text-[#009CC5]",  icon: <Plus className="w-3 h-3" /> },
  UPDATE:  { bg: "bg-blue-50",   text: "text-blue-600",   icon: <RefreshCw className="w-3 h-3" /> },
};

function ActionBadge({ action }: { action: string }) {
  const type = ACTION_TYPES.find(t => action.includes(t)) ?? "OTHER";
  const style = ACTION_COLORS[type] ?? { bg: "bg-gray-100", text: "text-gray-500", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
      {style.icon}{action}
    </span>
  );
}

// MultiComboBox for action type filter
function ActionFilter({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 border-2 cursor-pointer min-w-[180px] bg-white transition-all ${open ? "border-[#009CC5]" : "border-gray-200 hover:border-gray-300"}`}>
        <div className="flex-1 flex items-center gap-1 flex-wrap">
          {selected.length === 0 ? (
            <span className="text-[10px] text-gray-400">Filter tipe aksi...</span>
          ) : selected.map(v => (
            <div key={v} className="flex items-center gap-1 bg-[#009CC5] text-white px-2 py-0.5 rounded text-[9px] font-black">
              {v}
              <button type="button" onClick={e => { e.stopPropagation(); toggle(v); }} className="hover:text-yellow-300">×</button>
            </div>
          ))}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute top-full left-0 z-50 w-full bg-white border border-gray-200 shadow-lg mt-1">
          {ACTION_TYPES.map(type => {
            const style = ACTION_COLORS[type];
            const isSelected = selected.includes(type);
            return (
              <button key={type} type="button" onClick={() => toggle(type)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F4F8] transition-colors text-left ${isSelected ? "bg-[#F0F8FF]" : ""}`}>
                <div className={`w-4 h-4 border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-[#009CC5] border-[#009CC5]" : "border-gray-300"}`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase ${style.bg} ${style.text}`}>
                  {style.icon}{type}
                </span>
              </button>
            );
          })}
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex justify-end">
              <button type="button" onClick={() => onChange([])}
                className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest">
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs]           = useState<Log[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [actionFilter, setActionFilter] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/logs").then(r => r.json()).then(data => {
      setLogs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.details ?? "").toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter.length === 0 ||
      actionFilter.some(f => log.action.includes(f));
    return matchSearch && matchAction;
  });

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center sticky top-0 z-20 shadow-sm">
        <div className="w-0.5 h-6 bg-[#FAE705] mr-3 shrink-0" />
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#009CC5]">BKPSDM · Admin</p>
          <h1 className="text-base font-black uppercase tracking-tight text-[#132B4F] leading-none">Audit Log</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 border-2 px-3 py-2 flex-1 min-w-[200px] transition-all ${search ? "border-[#009CC5]" : "border-gray-200"}`}>
            <FileText className={`w-3.5 h-3.5 shrink-0 ${search ? "text-[#009CC5]" : "text-gray-300"}`} />
            <input type="text" placeholder="Cari log..." value={search} title="Cari log"
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-xs font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none" />
            {search && <button onClick={() => setSearch("")} aria-label="Hapus pencarian"><X className="w-3 h-3 text-gray-400 hover:text-red-400" /></button>}
          </div>
          <ActionFilter selected={actionFilter} onChange={setActionFilter} />
          <span className="text-[9px] text-gray-400 ml-auto">{filtered.length} log</span>
        </div>

        {/* Log table */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />
          <div className="grid grid-cols-12 px-5 py-2 bg-[#F8FAFC] border-b border-gray-100">
            {["Waktu", "Aksi", "Target", "Detail"].map((h, i) => (
              <p key={h} className={`text-[8px] font-black uppercase tracking-widest text-gray-400 ${
                i === 0 ? "col-span-2" : i === 1 ? "col-span-2" : i === 2 ? "col-span-4" : "col-span-4"
              }`}>{h}</p>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <div className="w-5 h-5 border-2 border-[#009CC5]/20 border-t-[#009CC5] rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Memuat log...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Tidak ada log</p>
              </div>
            ) : filtered.map((log, i) => (
              <div key={log.id} className="grid grid-cols-12 items-start px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-[#132B4F]">
                    {new Date(log.timestamp).toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="col-span-2">
                  <ActionBadge action={log.action} />
                </div>
                <p className="col-span-4 text-[11px] font-bold text-[#132B4F] truncate pr-3">{log.target}</p>
                <p className="col-span-4 text-[10px] text-gray-400 truncate">{log.details || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}