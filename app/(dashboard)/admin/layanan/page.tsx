"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { getAllLayanan, createLayanan, deleteLayanan, updateLayanan, getAllPeriode, getLayananByPeriod } from "@/app/action/admin";
import StatusBadge, { ikmColor, ikmLabel } from "@/components/ui/StatusBadge";
import ServiceTree from "@/components/ui/ServiceTree";
import {
  BarChart3, Layers, Plus, Trash2, X,
  Search, ChevronDown, Users, Settings, Filter, Check,
} from "lucide-react";

interface Service  { id: string; nama: string; kategori?: string | null; }
interface Periode  { id: string; label: string; status: string; }

const UNSUR_LABELS = [
  "Persyaratan", "Prosedur", "Waktu", "Biaya/Tarif",
  "Produk", "Kompetensi", "Perilaku", "Sarana", "Pengaduan",
];

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

// ── Respondent detail popover ─────────────────────────────────────────────
function RespondentPopover({ r, onClose }: { r: any; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Detail Penilaian</p>
            <p className="text-sm font-semibold text-slate-900">{r.nama}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "IKM", value: r.ikm.toFixed(2), color: ikmColor(r.ikm) },
              { label: "Tanggal", value: r.tglLayanan, color: undefined },
              { label: "Pegawai", value: r.pegawai, color: undefined },
            ].map(c => (
              <div key={c.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500 mb-1">{c.label}</p>
                <p className="text-sm font-semibold truncate" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3">Penilaian Per Unsur</p>
            <div className="space-y-2">
              {UNSUR_LABELS.map((label, i) => {
                const val = r[`u${i + 1}`] ?? 0;
                const pct = (val / 4) * 100;
                const colors = ["#ef4444", "#f97316", "#22c55e", "#3b82f6"];
                const labels = ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"];
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">U{i + 1} · {label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: colors[val - 1] || "#94a3b8" }}>
                          {val > 0 ? labels[val - 1] : "—"}
                        </span>
                        <span className="text-xs font-bold text-slate-900 w-4 text-right">{val}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: colors[val - 1] || "#e2e8f0" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {r.saran && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Saran</p>
              <p className="text-sm text-slate-700">{r.saran}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Period selector dropdown ──────────────────────────────────────────────
function PeriodSelector({ periodes, selected, onChange }: {
  periodes: Periode[];
  selected: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const current = periodes.find(p => p.id === selected);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 transition-all bg-white ${
          open ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
        }`}>
        <span className="truncate max-w-[140px]">{current?.label ?? "Pilih Periode"}</span>
        {current?.status === "AKTIF" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 min-w-[200px] overflow-hidden">
          {periodes.map(p => (
            <button key={p.id} onClick={() => { onChange(p.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left ${selected === p.id ? "bg-blue-50" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{p.label}</p>
                <p className="text-xs text-slate-400">{p.status === "AKTIF" ? "Aktif" : "Nonaktif"}</p>
              </div>
              {selected === p.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Layanan Detail Panel ──────────────────────────────────────────────────
function LayananDetailPanel({ service, periodes }: { service: Service; periodes: Periode[] }) {
  const [activeTab, setActiveTab]     = useState<"performa" | "responden" | "pengaturan">("performa");
  const [selectedPeriode, setSelectedPeriode] = useState<string>(
    periodes.find(p => p.status === "AKTIF")?.id ?? periodes[0]?.id ?? ""
  );
  const [data, setData]               = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [selectedRespondent, setSelectedRespondent] = useState<any>(null);
  const [filter, setFilter]           = useState({ jenisKelamin: "", pendidikan: "", pekerjaan: "" });

  useEffect(() => {
    if (!selectedPeriode) return;
    setLoading(true);
    getLayananByPeriod(service.id, selectedPeriode).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [service.id, selectedPeriode]);

  const filteredRespondents = data?.responses?.filter((r: any) => {
    if (filter.jenisKelamin && r.jenisKelamin !== filter.jenisKelamin) return false;
    if (filter.pendidikan   && r.pendidikan   !== filter.pendidikan)   return false;
    if (filter.pekerjaan    && r.pekerjaan    !== filter.pekerjaan)    return false;
    return true;
  }) ?? [];

  const uniqueVals = (key: string) => [...new Set((data?.responses ?? []).map((r: any) => r[key]))].filter(Boolean) as string[];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Layanan SKM</p>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">{service.nama}</h2>
          </div>
          <PeriodSelector periodes={periodes} selected={selectedPeriode} onChange={setSelectedPeriode} />
        </div>
        {data && (
          <div className="flex items-center gap-3 mt-3">
            <p className="text-2xl font-bold leading-none" style={{ color: data.ikm > 0 ? ikmColor(data.ikm) : "#94a3b8" }}>
              {data.ikm > 0 ? data.ikm.toFixed(2) : "—"}
            </p>
            <StatusBadge ikm={data.ikm} size="sm" />
            <span className="text-xs text-slate-400 ml-auto">{data.total} responden</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        {[
          { key: "performa",   label: "Performa", icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { key: "responden",  label: "Responden", icon: <Users className="w-3.5 h-3.5" /> },
          { key: "pengaturan", label: "Pengaturan", icon: <Settings className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 gap-3">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Memuat...</p>
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-slate-400">Data tidak ditemukan</p>
          </div>
        ) : (
          <>
            {/* PERFORMA */}
            {activeTab === "performa" && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Responden", value: data.total, color: "#3b82f6" },
                    { label: "IKM Score", value: data.ikm > 0 ? data.ikm.toFixed(2) : "—", color: ikmColor(data.ikm) },
                    { label: "Periode", value: data.periode?.label ?? "—", color: undefined },
                  ].map(c => (
                    <div key={c.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-500 mb-1">{c.label}</p>
                      <p className="text-lg font-bold truncate" style={{ color: c.color }}>{c.value}</p>
                    </div>
                  ))}
                </div>
                {data.total > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-3">Analisis Per Unsur</p>
                    <div className="space-y-2">
                      {UNSUR_LABELS.map((label, i) => {
                        const val = data.unsurAvg[i] ?? 0;
                        const pct = (val / 4) * 100;
                        return (
                          <div key={label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700">U{i + 1} · {label}</span>
                              <span className="text-xs font-bold" style={{ color: ikmColor(val * 25) }}>{val.toFixed(2)}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: ikmColor(val * 25) }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {data.total === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <BarChart3 className="w-10 h-10 text-slate-200" />
                    <p className="text-sm text-slate-400">Belum ada data survei di periode ini</p>
                  </div>
                )}
              </div>
            )}

            {/* RESPONDEN */}
            {activeTab === "responden" && (
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {[
                    { key: "jenisKelamin", label: "Gender",     opts: uniqueVals("jenisKelamin") },
                    { key: "pendidikan",   label: "Pendidikan", opts: uniqueVals("pendidikan") },
                    { key: "pekerjaan",    label: "Pekerjaan",  opts: uniqueVals("pekerjaan") },
                  ].map(f => (
                    <select key={f.key} value={(filter as any)[f.key]}
                      title={`Filter ${f.label}`}
                      onChange={e => setFilter(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-slate-700 bg-white outline-none hover:border-gray-300 transition-colors">
                      <option value="">Semua {f.label}</option>
                      {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ))}
                  {(filter.jenisKelamin || filter.pendidikan || filter.pekerjaan) && (
                    <button onClick={() => setFilter({ jenisKelamin: "", pendidikan: "", pekerjaan: "" })}
                      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700">
                      <X className="w-3 h-3" />Reset
                    </button>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">{filteredRespondents.length} responden</span>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {["Nama", "Pegawai", "Tanggal", "IKM"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredRespondents.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">Tidak ada data</td></tr>
                      ) : filteredRespondents.map((r: any) => (
                        <tr key={r.id} onClick={() => setSelectedRespondent(r)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer group">
                          <td className="px-4 py-2.5 text-sm font-medium text-slate-900 group-hover:text-blue-600 truncate transition-colors">{r.nama}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 truncate">{r.pegawai}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-400">{r.tglLayanan}</td>
                          <td className="px-4 py-2.5 text-sm font-bold" style={{ color: ikmColor(r.ikm) }}>{r.ikm.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 text-center">Klik nama responden untuk melihat detail penilaian U1–U9</p>
              </div>
            )}

            {/* PENGATURAN */}
            {activeTab === "pengaturan" && (
              <div className="p-5 space-y-4">
                <UpdateLayananForm service={service} />
                <div className="border border-red-100 rounded-lg p-4 bg-red-50">
                  <p className="text-xs font-semibold text-red-600 mb-2">Danger Zone</p>
                  <p className="text-sm text-red-500 mb-3">Menghapus layanan akan menghapus semua respons terkait secara permanen.</p>
                  <DeleteLayananButton id={service.id} nama={service.nama} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedRespondent && (
        <RespondentPopover r={selectedRespondent} onClose={() => setSelectedRespondent(null)} />
      )}
    </div>
  );
}

// ── Update + Delete forms ─────────────────────────────────────────────────
function UpdateLayananForm({ service }: { service: Service }) {
  const [isPending, startTransition] = useTransition();
  const KATEGORI_OPTIONS = [
    "Izin Kepegawaian", "Diklat & Pengembangan", "Informasi Kepegawaian",
    "Mutasi & Kepangkatan", "Pensiun & Pemberhentian", "Pengadaan ASN", "Lainnya",
  ];
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => { await updateLayanan(service.id, formData); });
  };
  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Layanan</label>
        <input name="nama" type="text" required defaultValue={service.nama}
          title="Nama Layanan" placeholder="Nama layanan..." className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
        <select name="kategori" defaultValue={service.kategori ?? ""} title="Kategori Layanan" className={inputClass}>
          <option value="">Tanpa Kategori</option>
          {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <button type="submit" disabled={isPending}
        className="px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all">
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

function DeleteLayananButton({ id, nama }: { id: string; nama: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button onClick={() => {
      if (confirm(`Hapus "${nama}"? Semua data responden akan terhapus.`)) {
        startTransition(async () => { await deleteLayanan(id); window.location.href = "/admin/layanan"; });
      }
    }} disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all">
      <Trash2 className="w-3.5 h-3.5" />
      {isPending ? "Menghapus..." : `Hapus ${nama}`}
    </button>
  );
}

function AddPanel({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => { await createLayanan(formData); onClose(); });
  };
  return (
    <div className="p-6 space-y-5">
      <div>
        <p className="text-xs font-semibold text-blue-600 mb-1">Layanan Baru</p>
        <h3 className="text-base font-semibold text-slate-900">Tambah Layanan</h3>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Nama Layanan <span className="text-red-400">*</span>
          </label>
          <input name="nama" type="text" required title="Nama Layanan" placeholder="e.g. Layanan Mutasi Pegawai" className={inputClass} />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full py-3 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><Plus className="w-4 h-4" />Buat Layanan</>}
        </button>
      </form>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function LayananSKMPage() {
  const [services, setServices]   = useState<Service[]>([]);
  const [periodes, setPeriodes]   = useState<Periode[]>([]);
  const [query, setQuery]         = useState("");
  const [selected, setSelected]   = useState<Service | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchAll = () => {
    startTransition(async () => {
      const [svcs, perds] = await Promise.all([
        getAllLayanan() as Promise<Service[]>,
        getAllPeriode() as Promise<Periode[]>,
      ]);
      setServices(svcs);
      setPeriodes(perds);
    });
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (services.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam) {
      const found = services.find(s => s.id === idParam);
      if (found) setSelected(found);
    }
  }, [services]);

  const filtered = services.filter(s => s.nama.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="font-sans bg-gray-50/50 flex flex-col" style={{ height: "100vh" }}>

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Layanan SKM</h1>
          <p className="text-xs text-slate-500">Kelola layanan survei kepuasan</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">{services.length} Layanan</span>
          </div>
          <button onClick={() => { setShowAdd(true); setSelected(null); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
            <Plus className="w-3.5 h-3.5" />Tambah
          </button>
        </div>
      </div>

      {/* SPLIT */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${query ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}>
              <Search className={`w-3.5 h-3.5 shrink-0 ${query ? "text-blue-600" : "text-slate-300"}`} />
              <input type="text" placeholder="Cari layanan..." value={query} title="Cari layanan"
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-xs font-medium text-slate-900 placeholder-gray-300 bg-transparent outline-none" />
              {query && <button onClick={() => setQuery("")} aria-label="Hapus"><X className="w-3 h-3 text-slate-400 hover:text-red-400" /></button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ServiceTree
              services={filtered}
              selected={selected?.id ?? null}
              onSelect={(s) => { setSelected(s); setShowAdd(false); }}
              ikmColor={ikmColor}
            />
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100">
            <p className="text-xs text-slate-400">{filtered.length} dari {services.length} layanan</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 overflow-y-auto bg-white">
          {showAdd ? (
            <AddPanel onClose={() => { setShowAdd(false); fetchAll(); }} />
          ) : selected ? (
            <LayananDetailPanel key={selected.id} service={selected} periodes={periodes} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-10">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center">
                <Layers className="w-8 h-8 text-slate-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Pilih Layanan</p>
                <p className="text-sm text-slate-400 max-w-xs">Klik layanan di kiri untuk melihat detail performa dan daftar responden</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
