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
  CREATE:  { bg: "bg-sky-50",    text: "text-sky-600",    icon: <Plus className="w-3 h-3" /> },
  UPDATE:  { bg: "bg-blue-50",   text: "text-blue-600",   icon: <RefreshCw className="w-3 h-3" /> },
};

function ActionBadge({ action }: { action: string }) {
  const type = ACTION_TYPES.find(t => action.includes(t)) ?? "OTHER";
  const style = ACTION_COLORS[type] ?? { bg: "bg-gray-100", text: "text-gray-500", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
      {style.icon}{action}
    </span>
  );
}

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
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter tipe aksi"
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(o => !o); } }}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer min-w-[180px] bg-white transition-all ${open ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}>
        <div className="flex-1 flex items-center gap-1 flex-wrap">
          {selected.length === 0 ? (
            <span className="text-xs text-slate-400">Filter tipe aksi...</span>
          ) : selected.map(v => (
            <div key={v} className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
              {v}
              <button type="button" onClick={e => { e.stopPropagation(); toggle(v); }} className="hover:text-blue-200">&times;</button>
            </div>
          ))}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute top-full left-0 z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
          {ACTION_TYPES.map(type => {
            const style = ACTION_COLORS[type];
            const isSelected = selected.includes(type);
            return (
              <button key={type} type="button" onClick={() => toggle(type)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left ${isSelected ? "bg-blue-50" : ""}`}>
                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
                  {style.icon}{type}
                </span>
              </button>
            );
          })}
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex justify-end">
              <button type="button" onClick={() => onChange([])}
                className="text-xs font-medium text-red-500 hover:text-red-700">
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
    <div className="min-h-screen font-sans bg-gray-50/50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Audit Log</h1>
          <p className="text-xs text-slate-500">Riwayat aktivitas sistem</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 min-w-[200px] transition-all ${search ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200"}`}>
            <FileText className={`w-3.5 h-3.5 shrink-0 ${search ? "text-blue-600" : "text-slate-300"}`} />
            <input
              type="text"
              placeholder="Cari log..."
              value={search}
              aria-label="Cari log"
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-xs font-medium text-slate-900 placeholder-gray-300 bg-transparent outline-none" />
            {search && <button onClick={() => setSearch("")} aria-label="Hapus pencarian"><X className="w-3 h-3 text-slate-400 hover:text-red-400" /></button>}
          </div>
          <ActionFilter selected={actionFilter} onChange={setActionFilter} />
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} log</span>
        </div>

        {/* Log table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Waktu</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Aksi</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Target</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-400">Memuat log...</p>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-16 text-center text-sm text-slate-400">Tidak ada log</td></tr>
              ) : filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(log.timestamp).toLocaleDateString("id-ID")}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-900 truncate max-w-[200px]">{log.target}</td>
                  <td className="px-5 py-3 text-sm text-slate-400 truncate max-w-[200px]">{log.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
