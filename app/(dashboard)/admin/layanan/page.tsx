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

// ── Respondent detail popover ─────────────────────────────────────────────
function RespondentPopover({ r, onClose }: { r: any; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className="bg-white border border-gray-200 shadow-xl w-full max-w-md animate-fade-up">
        <div className="bg-[#132B4F] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Detail Penilaian</p>
            <p className="text-sm font-black text-white">{r.nama}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-0.5" style={{ backgroundColor: ikmColor(r.ikm) }} />
        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "IKM", value: r.ikm.toFixed(2), color: ikmColor(r.ikm) },
              { label: "Tanggal", value: r.tglLayanan, color: "#132B4F" },
              { label: "Pegawai", value: r.pegawai, color: "#132B4F" },
            ].map(c => (
              <div key={c.label} className="bg-[#F8FAFC] p-3">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{c.label}</p>
                <p className="text-[11px] font-black truncate" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>
          {/* U1-U9 breakdown */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Penilaian Per Unsur</p>
            <div className="space-y-2">
              {UNSUR_LABELS.map((label, i) => {
                const val = r[`u${i + 1}`] ?? 0;
                const pct = (val / 4) * 100;
                const colors = ["#ef4444", "#f97316", "#22c55e", "#009CC5"];
                const labels = ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"];
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#132B4F]">U{i + 1} · {label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black" style={{ color: colors[val - 1] || "#94a3b8" }}>
                          {val > 0 ? labels[val - 1] : "—"}
                        </span>
                        <span className="text-[10px] font-black text-[#132B4F] w-4 text-right">{val}</span>
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
          {/* Saran */}
          {r.saran && (
            <div className="bg-[#F0F4F8] p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Saran</p>
              <p className="text-[11px] text-[#132B4F]">{r.saran}</p>
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
        className={`flex items-center gap-2 px-3 py-1.5 border-2 text-[10px] font-black text-[#132B4F] transition-all bg-white ${
          open ? "border-[#009CC5]" : "border-gray-200 hover:border-gray-300"
        }`}>
        <span className="truncate max-w-[140px]">{current?.label ?? "Pilih Periode"}</span>
        {current?.status === "AKTIF" && <span className="text-[8px] text-green-500">●</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 bg-white border border-gray-200 shadow-lg mt-1 min-w-[200px] animate-fade-down">
          {periodes.map(p => (
            <button key={p.id} onClick={() => { onChange(p.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F4F8] transition-colors text-left ${selected === p.id ? "bg-[#F0F8FF]" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#132B4F] truncate">{p.label}</p>
                <p className="text-[9px] text-gray-400">{p.status === "AKTIF" ? "● Aktif" : "Nonaktif"}</p>
              </div>
              {selected === p.id && <Check className="w-3.5 h-3.5 text-[#009CC5] shrink-0" />}
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
      {/* Header with period selector */}
      <div className="px-5 py-4 border-b border-gray-100 bg-[#132B4F]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Layanan SKM</p>
            <h2 className="text-sm font-black text-white leading-tight">{service.nama}</h2>
          </div>
          <div className="shrink-0">
            <PeriodSelector periodes={periodes} selected={selectedPeriode} onChange={setSelectedPeriode} />
          </div>
        </div>
        {data && (
          <div className="flex items-center gap-3 mt-3">
            <p className="text-2xl font-black leading-none" style={{ color: data.ikm > 0 ? ikmColor(data.ikm) : "#94a3b8" }}>
              {data.ikm > 0 ? data.ikm.toFixed(2) : "—"}
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: data.ikm > 0 ? ikmColor(data.ikm) : "#94a3b8" }}>
              {ikmLabel(data.ikm)}
            </p>
            <span className="text-[9px] text-white/40 ml-auto">{data.total} responden</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { key: "performa",   label: "Performa", icon: <BarChart3 className="w-3 h-3" /> },
          { key: "responden",  label: "Responden", icon: <Users className="w-3 h-3" /> },
          { key: "pengaturan", label: "Pengaturan", icon: <Settings className="w-3 h-3" /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab.key ? "border-[#009CC5] text-[#009CC5]" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 gap-3">
            <div className="w-5 h-5 border-2 border-[#009CC5]/20 border-t-[#009CC5] rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Memuat...</p>
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Data tidak ditemukan</p>
          </div>
        ) : (
          <>
            {/* PERFORMA */}
            {activeTab === "performa" && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Responden", value: data.total,                     color: "#009CC5" },
                    { label: "IKM Score",       value: data.ikm > 0 ? data.ikm.toFixed(2) : "—", color: ikmColor(data.ikm) },
                    { label: "Periode",         value: data.periode?.label ?? "—",     color: "#132B4F" },
                  ].map(c => (
                    <div key={c.label} className="bg-[#F8FAFC] border border-gray-200 p-3">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{c.label}</p>
                      <p className="text-lg font-black truncate" style={{ color: c.color }}>{c.value}</p>
                    </div>
                  ))}
                </div>
                {data.total > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Analisis Per Unsur</p>
                    <div className="space-y-2">
                      {UNSUR_LABELS.map((label, i) => {
                        const val = data.unsurAvg[i] ?? 0;
                        const pct = (val / 4) * 100;
                        return (
                          <div key={label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-[#132B4F]">U{i + 1} · {label}</span>
                              <span className="text-[10px] font-black" style={{ color: ikmColor(val * 25) }}>{val.toFixed(2)}</span>
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
                    <BarChart3 className="w-10 h-10 text-gray-200" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data survei di periode ini</p>
                  </div>
                )}
              </div>
            )}

            {/* RESPONDEN */}
            {activeTab === "responden" && (
              <div className="p-5 space-y-3">
                {/* Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {[
                    { key: "jenisKelamin", label: "Gender",     opts: uniqueVals("jenisKelamin") },
                    { key: "pendidikan",   label: "Pendidikan", opts: uniqueVals("pendidikan") },
                    { key: "pekerjaan",    label: "Pekerjaan",  opts: uniqueVals("pekerjaan") },
                  ].map(f => (
                    <select key={f.key} value={(filter as any)[f.key]}
                      title={`Filter ${f.label}`}
                      onChange={e => setFilter(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="px-2 py-1.5 border border-gray-200 text-[10px] font-bold text-[#132B4F] bg-white outline-none hover:border-gray-300 transition-colors">
                      <option value="">Semua {f.label}</option>
                      {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ))}
                  {(filter.jenisKelamin || filter.pendidikan || filter.pekerjaan) && (
                    <button onClick={() => setFilter({ jenisKelamin: "", pendidikan: "", pekerjaan: "" })}
                      className="flex items-center gap-1 text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest">
                      <X className="w-3 h-3" />Reset
                    </button>
                  )}
                  <span className="text-[9px] text-gray-400 ml-auto">{filteredRespondents.length} responden</span>
                </div>

                <div className="border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-4 px-4 py-2 bg-[#F8FAFC] border-b border-gray-100">
                    {["Nama", "Pegawai", "Tanggal", "IKM"].map(h => (
                      <p key={h} className="text-[8px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                    ))}
                  </div>
                  <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                    {filteredRespondents.length === 0 ? (
                      <div className="flex items-center justify-center py-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Tidak ada data</p>
                      </div>
                    ) : filteredRespondents.map((r: any) => (
                      <button key={r.id} onClick={() => setSelectedRespondent(r)}
                        className="w-full grid grid-cols-4 items-center px-4 py-2.5 hover:bg-[#F0F8FF] transition-colors text-left group">
                        <p className="text-[11px] font-bold text-[#132B4F] group-hover:text-[#009CC5] truncate transition-colors">{r.nama}</p>
                        <p className="text-[10px] text-gray-500 truncate">{r.pegawai}</p>
                        <p className="text-[10px] text-gray-400">{r.tglLayanan}</p>
                        <p className="text-[10px] font-black" style={{ color: ikmColor(r.ikm) }}>{r.ikm.toFixed(1)}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 text-center">Klik nama responden untuk melihat detail penilaian U1–U9</p>
              </div>
            )}

            {/* PENGATURAN */}
            {activeTab === "pengaturan" && (
              <div className="p-5 space-y-4">
                <UpdateLayananForm service={service} />
                <div className="border border-red-200 p-4 bg-red-50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-2">Danger Zone</p>
                  <p className="text-[11px] text-red-400 mb-3">Menghapus layanan akan menghapus semua respons terkait secara permanen.</p>
                  <DeleteLayananButton id={service.id} nama={service.nama} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Respondent detail popover */}
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
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Nama Layanan</label>
        <input name="nama" type="text" required defaultValue={service.nama}
          title="Nama Layanan" placeholder="Nama layanan..."
          className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] outline-none transition-all" />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Kategori</label>
        <select name="kategori" defaultValue={service.kategori ?? ""} title="Kategori Layanan"
          className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] outline-none transition-all">
          <option value="">Tanpa Kategori</option>
          {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <button type="submit" disabled={isPending}
        className="px-4 py-2 bg-[#132B4F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#009CC5] disabled:opacity-50 transition-all">
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
      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 transition-all">
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
    <div className="p-6 space-y-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-0.5 h-4 bg-[#009CC5]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Tambah Layanan Baru</p>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Nama Layanan <span className="text-red-400">*</span>
          </label>
          <input name="nama" type="text" required title="Nama Layanan" placeholder="e.g. Layanan Mutasi Pegawai"
            className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all" />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full py-3 bg-[#009CC5] text-white font-black text-sm uppercase tracking-widest hover:bg-[#132B4F] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
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

  // Auto-select from URL ?id= param
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
    <div className="font-sans bg-[#F0F4F8] flex flex-col" style={{ height: "100vh" }}>

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-0.5 h-6 bg-[#FAE705]" />
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#009CC5]">BKPSDM · Admin</p>
            <h1 className="text-base font-black uppercase tracking-tight text-[#132B4F] leading-none">Layanan SKM</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#F0F4F8] border border-gray-200 px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 text-[#009CC5]" />
            <span className="text-[10px] font-black text-[#132B4F]">{services.length} Layanan</span>
          </div>
          <button onClick={() => { setShowAdd(true); setSelected(null); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] transition-all">
            <Plus className="w-3.5 h-3.5" />Tambah
          </button>
        </div>
      </div>

      {/* SPLIT */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className={`flex items-center gap-2 border-2 px-3 py-2 transition-all ${query ? "border-[#009CC5]" : "border-gray-200 hover:border-gray-300"}`}>
              <Search className={`w-3.5 h-3.5 shrink-0 ${query ? "text-[#009CC5]" : "text-gray-300"}`} />
              <input type="text" placeholder="Cari layanan..." value={query} title="Cari layanan"
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-xs font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none" />
              {query && <button onClick={() => setQuery("")} aria-label="Hapus"><X className="w-3 h-3 text-gray-400 hover:text-red-400" /></button>}
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
            <p className="text-[9px] text-gray-400">{filtered.length} dari {services.length} layanan</p>
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
              <div className="w-16 h-16 bg-[#F0F4F8] flex items-center justify-center">
                <Layers className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Pilih Layanan</p>
                <p className="text-[11px] text-gray-400 max-w-xs">Klik layanan di kiri untuk melihat detail performa dan daftar responden</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}