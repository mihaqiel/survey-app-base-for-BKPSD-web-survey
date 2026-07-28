"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Award, Plus, Search, X, Pencil, Trash2, Eye, EyeOff, Upload, ChevronRight, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Penghargaan {
  id: string;
  nama: string;
  jabatan: string;
  unitKerja: string;
  periode: string;
  kategori: string;
  fotoUrl: string;
  catatan: string;
  isPublished: boolean;
  urutan: number;
  createdAt: string;
}

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

const KATEGORI_OPTIONS = [
  "Pegawai Terbaik",
  "Pelayanan Terbaik",
  "Inovasi Terbaik",
  "Kedisiplinan Terbaik",
  "Lainnya",
];

// ── Photo Upload ────────────────────────────────────────────────────────────
function PhotoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/penghargaan/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal mengunggah."); return; }
      onChange(data.url);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Foto <span className="text-red-400">*</span>
      </label>

      {value ? (
        <div className="relative group w-full aspect-square max-w-[180px] rounded-xl overflow-hidden border border-gray-200">
          <Image src={value} alt="Foto penghargaan" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => { onChange(""); inputRef.current && (inputRef.current.value = ""); }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 w-full h-36 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-slate-300" />
              <span className="text-xs font-medium text-slate-400">Klik untuk unggah foto</span>
              <span className="text-[10px] text-slate-300">JPEG, PNG, WebP · Maks. 2MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Form (create / edit) ────────────────────────────────────────────────────
function PenghargaanForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Penghargaan;
  onSave: (record: Penghargaan) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nama:      initial?.nama      ?? "",
    jabatan:   initial?.jabatan   ?? "",
    unitKerja: initial?.unitKerja ?? "",
    periode:   initial?.periode   ?? "",
    kategori:  initial?.kategori  ?? KATEGORI_OPTIONS[0],
    fotoUrl:   initial?.fotoUrl   ?? "",
    catatan:   initial?.catatan   ?? "",
    urutan:    initial?.urutan    ?? 0,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: k === "urutan" ? Number(e.target.value) : e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fotoUrl) { setError("Foto belum diunggah."); return; }
    setError("");

    startTransition(async () => {
      try {
        const url = isEdit ? `/api/penghargaan/${initial!.id}` : "/api/penghargaan";
        const method = isEdit ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Gagal menyimpan."); return; }
        onSave(data);
      } catch {
        setError("Terjadi kesalahan jaringan.");
      }
    });
  };

  return (
    <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-80px)]">
      <div>
        <p className="text-xs font-semibold text-blue-600 mb-1">{isEdit ? "Edit Data" : "Penghargaan Baru"}</p>
        <h3 className="text-base font-semibold text-slate-900">{isEdit ? "Ubah Penghargaan" : "Tambah Penghargaan"}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PhotoUpload value={form.fotoUrl} onChange={url => setForm(f => ({ ...f, fotoUrl: url }))} />

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input name="nama" type="text" required value={form.nama} onChange={set("nama")} placeholder="Nama ASN penerima penghargaan" className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Jabatan <span className="text-red-400">*</span>
          </label>
          <input name="jabatan" type="text" required value={form.jabatan} onChange={set("jabatan")} placeholder="Jabatan / Pangkat" className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Unit Kerja <span className="text-red-400">*</span>
          </label>
          <input name="unitKerja" type="text" required value={form.unitKerja} onChange={set("unitKerja")} placeholder="Nama unit kerja / bidang" className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Periode <span className="text-red-400">*</span>
          </label>
          <input name="periode" type="text" required value={form.periode} onChange={set("periode")} placeholder="mis. Semester 1 Tahun 2026" className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Kategori <span className="text-red-400">*</span>
          </label>
          <select name="kategori" required value={form.kategori} onChange={set("kategori")} className={inputClass}>
            {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Catatan <span className="text-red-400">*</span>
          </label>
          <textarea
            name="catatan" required value={form.catatan} onChange={set("catatan")}
            placeholder="Alasan pemberian penghargaan, prestasi, atau keterangan lain"
            rows={4} className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Urutan Tampil</label>
          <input name="urutan" type="number" min={0} value={form.urutan} onChange={set("urutan")} className={inputClass} />
        </div>

        {error && <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isPending
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
              : isEdit ? <><Pencil className="w-4 h-4" />Simpan Perubahan</> : <><Plus className="w-4 h-4" />Tambah</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Detail Panel ────────────────────────────────────────────────────────────
function DetailPanel({
  record,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  record: Penghargaan;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, next: boolean) => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/penghargaan/${record.id}/publish`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) onTogglePublish(record.id, data.isPublished);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/penghargaan/${record.id}`, { method: "DELETE" });
      if (res.ok) onDelete(record.id);
    } finally {
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Photo */}
      <div className="relative w-full aspect-video bg-gray-100 shrink-0">
        {record.fotoUrl ? (
          <Image src={record.fotoUrl} alt={record.nama} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="w-12 h-12 text-slate-200" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
            record.isPublished
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}>
            {record.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-4 flex-1">
        <div>
          <p className="text-xs font-semibold text-blue-600 mb-0.5">{record.kategori} · Urutan #{record.urutan}</p>
          <h2 className="text-lg font-bold text-slate-900">{record.nama}</h2>
          <p className="text-sm text-slate-500">{record.jabatan}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Unit Kerja", value: record.unitKerja },
            { label: "Periode",    value: record.periode   },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-medium text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Catatan</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{record.catatan}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
              record.isPublished
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {publishing
              ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : record.isPublished ? <><EyeOff className="w-4 h-4" />Sembunyikan</> : <><Eye className="w-4 h-4" />Publikasikan</>}
          </button>

          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
          >
            <Pencil className="w-4 h-4" />Edit Data
          </button>

          {!confirmDel ? (
            <button
              onClick={() => setConfirmDel(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />Hapus
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDel(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-slate-600 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
              >
                {deleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Hapus!"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function PenghargaanClient() {
  const [records, setRecords] = useState<Penghargaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");
  const [selected, setSelected]   = useState<Penghargaan | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editing,  setEditing]    = useState<Penghargaan | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/penghargaan");
      if (res.ok) setRecords(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = records.filter(r =>
    r.nama.toLowerCase().includes(query.toLowerCase()) ||
    r.unitKerja.toLowerCase().includes(query.toLowerCase()) ||
    r.kategori.toLowerCase().includes(query.toLowerCase())
  );

  const handleSave = (record: Penghargaan) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });
    setSelected(record);
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setSelected(null);
  };

  const handleTogglePublish = (id: string, next: boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, isPublished: next } : r));
    setSelected(prev => prev?.id === id ? { ...prev, isPublished: next } : prev);
  };

  const openAdd = () => { setShowForm(true); setEditing(null); setSelected(null); };
  const openEdit = () => { setEditing(selected); setShowForm(true); };

  const published  = records.filter(r => r.isPublished).length;

  return (
    <div className="font-sans bg-gray-50/50 flex flex-col" style={{ height: "100vh" }}>

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Penghargaan ASN</h1>
          <p className="text-xs text-slate-500">Kelola penerima penghargaan yang ditampilkan di halaman publik</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-slate-700">
              {published} publish · {records.length} total
            </span>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />Tambah
          </button>
        </div>
      </div>

      {/* SPLIT */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT LIST */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${
              query ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
            }`}>
              <Search className={`w-3.5 h-3.5 shrink-0 ${query ? "text-blue-600" : "text-slate-300"}`} />
              <input
                type="text"
                placeholder="Cari nama, unit, kategori..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-xs font-medium text-slate-900 placeholder-gray-300 bg-transparent outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Hapus pencarian">
                  <X className="w-3 h-3 text-slate-400 hover:text-red-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center p-10 gap-3">
                <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Memuat...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 gap-2">
                <Award className="w-8 h-8 text-slate-200" />
                <p className="text-sm text-slate-400 text-center">
                  {query ? "Tidak ditemukan" : "Belum ada data penghargaan"}
                </p>
              </div>
            ) : filtered.map(r => (
              <button
                key={r.id}
                onClick={() => { setSelected(r); setShowForm(false); setEditing(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group ${
                  selected?.id === r.id ? "bg-blue-50 border-r-2 border-blue-600" : ""
                }`}
              >
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  {r.fotoUrl
                    ? <Image src={r.fotoUrl} alt={r.nama} fill className="object-cover" unoptimized />
                    : <Award className="w-4 h-4 text-slate-300 absolute inset-0 m-auto" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate transition-colors ${
                    selected?.id === r.id ? "text-blue-700" : "text-slate-900 group-hover:text-blue-600"
                  }`}>
                    {r.nama}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{r.kategori} · {r.periode}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${r.isPublished ? "bg-emerald-400" : "bg-gray-300"}`} />
                  <ChevronRight className={`w-3 h-3 ${selected?.id === r.id ? "text-blue-600" : "text-slate-300"}`} />
                </div>
              </button>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100">
            <p className="text-xs text-slate-400">{filtered.length} dari {records.length} entri</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 overflow-y-auto bg-white">
          {showForm ? (
            <PenghargaanForm
              initial={editing ?? undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          ) : selected ? (
            <DetailPanel
              key={selected.id}
              record={selected}
              onEdit={openEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-10">
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Pilih Penghargaan</p>
                <p className="text-sm text-slate-400 max-w-xs">
                  Klik salah satu data di panel kiri untuk melihat detail, atau tambah penghargaan baru.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
