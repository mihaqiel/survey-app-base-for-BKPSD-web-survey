"use client";

import { useState } from "react";
import { MessageSquareWarning, ChevronDown, ChevronUp, Paperclip, FileText } from "lucide-react";

type Complaint = {
  id: string;
  nama: string;
  email: string;
  telepon: string | null;
  judul: string;
  isi: string;
  gambarName: string | null;
  gambarType: string | null;
  status: string;
  createdAt: Date;
};

const STATUS_OPTIONS = ["BARU", "DIPROSES", "SELESAI"] as const;

const statusStyle: Record<string, string> = {
  BARU:     "bg-red-100 text-red-700 border border-red-200",
  DIPROSES: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  SELESAI:  "bg-green-100 text-green-700 border border-green-200",
};

const statusLabel: Record<string, string> = {
  BARU:     "Baru",
  DIPROSES: "Diproses",
  SELESAI:  "Selesai",
};

export default function PengaduanDashboard({ initialData }: { initialData: Complaint[] }) {
  const [data, setData] = useState<Complaint[]>(initialData);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setData((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      }
    } catch (err) {
      console.error("[PengaduanDashboard] update error:", err);
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    BARU:     data.filter((d) => d.status === "BARU").length,
    DIPROSES: data.filter((d) => d.status === "DIPROSES").length,
    SELESAI:  data.filter((d) => d.status === "SELESAI").length,
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
          <MessageSquareWarning className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengaduan Masyarakat</h1>
          <p className="text-sm text-slate-500">{data.length} pengaduan masuk</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["BARU", "DIPROSES", "SELESAI"] as const).map((s) => (
          <div key={s} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{counts[s]}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle[s]}`}>
              {statusLabel[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <MessageSquareWarning className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Belum ada pengaduan masuk</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {data.map((p) => {
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Row */}
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle[p.status]}`}>
                  {statusLabel[p.status]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.judul}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.nama} · {p.email} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                {p.gambarName && (
                  <Paperclip className="w-4 h-4 text-slate-400 shrink-0" aria-label="Ada lampiran" />
                )}
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">No. Telepon</p>
                      <p className="text-sm text-slate-700">{p.telepon ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Tanggal Masuk</p>
                      <p className="text-sm text-slate-700">
                        {new Date(p.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-1">Isi Pengaduan</p>
                    <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {p.isi}
                    </div>
                  </div>

                  {p.gambarName && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-400 mb-2">Lampiran Bukti</p>
                      {p.gambarType?.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/pengaduan/${p.id}/gambar`}
                          alt="Foto pengaduan"
                          className="max-h-64 rounded-lg border border-gray-200 object-contain"
                        />
                      ) : (
                        <a
                          href={`/api/pengaduan/${p.id}/gambar`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          {p.gambarName}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status update */}
                  <div className="mt-4 flex items-center gap-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ubah Status:
                    </p>
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        disabled={p.status === s || updating === p.id}
                        onClick={() => updateStatus(p.id, s)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          p.status === s
                            ? statusStyle[s] + " opacity-100"
                            : "bg-white text-slate-500 border-gray-200 hover:border-slate-400 disabled:opacity-40"
                        }`}
                      >
                        {statusLabel[s]}
                      </button>
                    ))}
                    {updating === p.id && (
                      <span className="text-xs text-slate-400">Menyimpan...</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
