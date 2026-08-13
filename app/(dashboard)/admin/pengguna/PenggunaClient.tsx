"use client";

import { useState, useEffect, useTransition } from "react";
import {
  listAdminUsers, addAdminUser, setAdminActive, removeAdminUser,
  type AdminUserRow,
} from "@/app/action/admin-users";
import {
  ShieldCheck, Plus, Trash2, UserPlus, KeyRound,
  CheckCircle2, XCircle, AlertTriangle, Loader2,
} from "lucide-react";

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

function formatDate(d: Date | null): string {
  if (!d) return "Belum pernah";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function PenggunaClient() {
  const [rows, setRows]       = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [notice, setNotice]   = useState<string | null>(null);
  const [email, setEmail]     = useState("");
  const [nama, setNama]       = useState("");
  const [pending, startTransition] = useTransition();

  const refresh = () => {
    listAdminUsers()
      .then((r) => { setRows(r); setLoading(false); })
      .catch(() => { setError("Gagal memuat daftar pengguna."); setLoading(false); });
  };

  useEffect(refresh, []);

  const run = (fn: () => Promise<{ ok: true } | { error: string }>, success: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await fn();
      if ("error" in res) { setError(res.error); return; }
      setNotice(success);
      refresh();
    });
  };

  const handleAdd = () => {
    run(() => addAdminUser(email, nama), `Akses diberikan kepada ${email.trim().toLowerCase()}.`);
    setEmail("");
    setNama("");
  };

  const activeCount = rows.filter((r) => r.isActive).length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pengguna Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Akun yang boleh masuk ke dashboard admin. Semua akun punya wewenang yang sama.
          </p>
        </div>
      </div>

      {/* Flat-permission warning — this is a real consequence, not boilerplate */}
      <div className="flex items-start gap-3 rounded-lg px-4 py-3 mb-6 bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          Tidak ada peran bertingkat: setiap akun di daftar ini dapat menambah atau mencabut
          akses akun lain, serta menghapus data survei secara permanen. Tambahkan hanya orang
          yang Anda percaya sepenuhnya, dan tinjau daftar ini secara berkala.
        </p>
      </div>

      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Tambah Akses</h2>
        </div>
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <input
            className={inputClass}
            type="email"
            placeholder="email@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
          <input
            className={inputClass}
            type="text"
            placeholder="Nama lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            disabled={pending}
          />
          <button
            onClick={handleAdd}
            disabled={pending || !email.trim() || !nama.trim()}
            className="px-5 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Tambah
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Pengguna masuk lewat tombol &ldquo;Masuk dengan Google&rdquo; memakai email ini.
          Email harus persis sama dengan akun Google mereka.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg px-4 py-3 mb-4 bg-red-50 border border-red-200">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}
      {notice && (
        <div className="flex items-center gap-3 rounded-lg px-4 py-3 mb-4 bg-green-50 border border-green-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-700">{notice}</p>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Daftar Pengguna
          </h2>
          <span className="text-xs font-medium text-slate-400">
            {activeCount} aktif dari {rows.length} akun
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 gap-3">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Memuat data...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-slate-400">Belum ada pengguna terdaftar.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: r.isActive ? "#eff6ff" : "#f8fafc",
                    color: r.isActive ? "#2563eb" : "#94a3b8",
                  }}
                >
                  {r.nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 truncate">{r.nama}</p>
                    {r.isSelf && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                        ANDA
                      </span>
                    )}
                    {r.hasPassword && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 inline-flex items-center gap-1">
                        <KeyRound className="w-2.5 h-2.5" /> BREAK-GLASS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{r.email}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Login terakhir: {formatDate(r.lastLoginAt)}
                    {r.createdBy && ` · ditambahkan oleh ${r.createdBy}`}
                  </p>
                </div>

                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                  style={{
                    background: r.isActive ? "#dcfce7" : "#f1f5f9",
                    color: r.isActive ? "#14532d" : "#64748b",
                  }}
                >
                  {r.isActive ? "AKTIF" : "NONAKTIF"}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      run(
                        () => setAdminActive(r.id, !r.isActive),
                        r.isActive ? `Akses ${r.email} dicabut.` : `Akses ${r.email} diaktifkan.`,
                      )
                    }
                    disabled={pending || (r.isSelf && r.isActive)}
                    title={r.isSelf && r.isActive ? "Tidak bisa menonaktifkan akun sendiri" : undefined}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {r.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>

                  {!r.isSelf && !r.hasPassword && (
                    <button
                      onClick={() => run(() => removeAdminUser(r.id), `Akun ${r.email} dihapus.`)}
                      disabled={pending}
                      title="Hapus akun"
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
