"use client";

import { createPegawai, deletePegawai } from "@/app/action/admin";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Employee {
  id: string;
  nama: string;
}

interface EmployeeDetail {
  id: string;
  nama: string;
  totalSurveys: number;
  ikm: number;
  layananStats: {
    layananId: string;
    layananNama: string;
    count: number;
    ikm: number;
  }[];
  respondents: {
    id: string;
    nama: string;
    layananNama: string;
    tglLayanan: string;
    ikm: number;
    saran?: string | null;
  }[];
}

function getInitials(nama: string) {
  return nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function ikmColor(ikm: number) {
  if (ikm === 0) return "#94a3b8";
  if (ikm >= 88.31) return "#16a34a";
  if (ikm >= 76.61) return "#009CC5";
  if (ikm >= 65) return "#d97706";
  return "#dc2626";
}

function ikmLabel(ikm: number) {
  if (ikm === 0) return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65) return "Kurang Baik";
  return "Tidak Baik";
}

const PER_PAGE = 10;
const RESP_PER_PAGE = 8;

function AddForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-7 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Pegawai</p>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F]">Tambah Pegawai Baru</h1>
          </div>
        </div>
        <button onClick={onBack}
          className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
          ← Kembali
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 bg-[#009CC5]" />
          <div className="p-8">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-6">Detail Pegawai</p>
            <form action={createPegawai} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input name="nama" type="text" required placeholder="e.g. Rina Sapariyani, S.Kom"
                  className="w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-colors"
                />
                <p className="text-[10px] text-gray-400 font-medium mt-2">Sertakan gelar akademik jika ada</p>
              </div>
              <button type="submit"
                className="w-full py-4 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] transition-colors">
                + Tambah Pegawai
              </button>
            </form>
          </div>
        </div>
        <div className="bg-[#132B4F] overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />
          <div className="p-8 space-y-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-2">Tentang Fitur Ini</p>
              <p className="text-sm font-medium leading-relaxed text-white/60">
                Pegawai yang didaftarkan akan muncul di dropdown pencarian saat responden mengisi formulir survei SKM.
              </p>
            </div>
            <div className="border-t border-white/10 pt-6 space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">Panduan</p>
              {[
                "Masukkan nama lengkap sesuai dokumen resmi, termasuk gelar akademik.",
                "Nama pegawai dapat dicari secara real-time di formulir survei publik.",
                "Menghapus pegawai tidak akan menghapus respons survei historis mereka.",
                "Setiap respons terhubung permanen ke pegawai yang dipilih saat pengisian.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 bg-[#009CC5] flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-xs font-medium text-white/60 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pill pagination dots
function PaginationDots({ total, current, onChange }: { total: number; current: number; onChange: (i: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onChange(i)} aria-label={`Halaman ${i + 1}`} className="flex items-center justify-center">
          <div className={`rounded-full transition-all duration-300 ${
            i === current ? "w-5 h-2 bg-[#132B4F]" : "w-2 h-2 bg-gray-300 hover:bg-[#009CC5]"
          }`} />
        </button>
      ))}
    </div>
  );
}

export default function EmployeeManagementPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [respondentPage, setRespondentPage] = useState(0);

  useEffect(() => {
    fetch("/api/pegawai").then((r) => r.json()).then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setDetailLoading(true);
    setRespondentPage(0);
    fetch(`/api/pegawai/${selectedId}/detail`)
      .then((r) => r.json())
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  if (showAddForm) return <AddForm onBack={() => setShowAddForm(false)} />;

  const totalPages = Math.ceil(employees.length / PER_PAGE);
  const pageEmployees = employees.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const totalRespPages = detail ? Math.ceil(detail.respondents.length / RESP_PER_PAGE) : 0;
  const pageRespondents = detail
    ? detail.respondents.slice(respondentPage * RESP_PER_PAGE, respondentPage * RESP_PER_PAGE + RESP_PER_PAGE)
    : [];

  return (
    <div className="font-sans bg-[#F0F4F8] flex flex-col" style={{ height: "100vh" }}>

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · SDM</p>
            <h1 className="text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none">Manajemen Pegawai</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin"
            className="px-3 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
            ← Dashboard
          </Link>
          <div className="px-3 py-2 bg-[#F0F4F8] border border-gray-200 text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
            {employees.length} Pegawai
          </div>
          <button onClick={() => setShowAddForm(true)}
            className="px-3 py-2 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] transition-colors">
            + Tambah
          </button>
        </div>
      </div>

      {/* SPLIT PANELS */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT PANEL ── */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col">

          <div className="px-5 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-0.5 h-4 bg-[#FAE705]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Daftar Pegawai</p>
            </div>
            <p className="text-[9px] text-gray-400 font-bold pl-2.5">Klik untuk lihat detail</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {pageEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">Belum ada pegawai</p>
              </div>
            ) : pageEmployees.map((emp, i) => {
              const globalRank = page * PER_PAGE + i + 1;
              const isSelected = selectedId === emp.id;
              return (
                <button key={emp.id} onClick={() => setSelectedId(emp.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                    isSelected ? "bg-[#132B4F]" : "hover:bg-[#F0F4F8]"
                  }`}
                >
                  <div className={`text-[9px] font-black w-5 shrink-0 ${isSelected ? "text-white/30" : "text-gray-300"}`}>
                    {String(globalRank).padStart(2, "0")}
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center shrink-0 text-[10px] font-black ${
                    isSelected ? "bg-[#FAE705] text-[#132B4F]" : "bg-[#132B4F] text-[#FAE705]"
                  }`}>
                    {getInitials(emp.nama)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black truncate ${isSelected ? "text-white" : "text-[#132B4F]"}`}>
                      {emp.nama}
                    </p>
                    <p className={`text-[9px] font-bold ${isSelected ? "text-white/30" : "text-gray-400"}`}>
                      BKPSDM Anambas
                    </p>
                  </div>
                  {isSelected && <div className="w-0.5 h-5 bg-[#FAE705] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Pagination + delete */}
          <div className="shrink-0 border-t border-gray-100">
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                <p className="text-[9px] font-bold text-gray-400">
                  {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, employees.length)} / {employees.length}
                </p>
                <PaginationDots total={totalPages} current={page} onChange={(i) => { setPage(i); setSelectedId(null); }} />
              </div>
            )}
            {selectedId && (
              <form action={deletePegawai.bind(null, selectedId)} onSubmit={() => setSelectedId(null)} className="p-3">
                <button type="submit"
                  className="w-full py-2 border border-red-200 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                  Hapus Pegawai Ini
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 overflow-y-auto">

          {!selectedId && (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 bg-white border border-gray-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">Pilih pegawai di panel kiri</p>
            </div>
          )}

          {selectedId && detailLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#009CC5] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {selectedId && !detailLoading && detail && (
            <div className="p-6 space-y-4">

              {/* Hero card */}
              <div className="bg-[#132B4F] overflow-hidden">
                <div className="h-1" style={{ background: "linear-gradient(to right, #FAE705 33%, #009CC5 66%, #132B4F)" }} />
                <div className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FAE705] flex items-center justify-center text-[#132B4F] text-base font-black shrink-0">
                    {getInitials(detail.nama)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Pegawai BKPSDM</p>
                    <h2 className="text-base font-black text-white leading-tight">{detail.nama}</h2>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black" style={{ color: ikmColor(detail.ikm) }}>
                      {detail.ikm > 0 ? detail.ikm : "—"}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: ikmColor(detail.ikm) }}>
                      {ikmLabel(detail.ikm)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-white/10">
                  {[
                    { label: "Total Survei", value: detail.totalSurveys },
                    { label: "Layanan", value: detail.layananStats.length },
                    { label: "Responden", value: detail.respondents.length },
                  ].map((s) => (
                    <div key={s.label} className="px-4 py-3 border-r border-white/10 last:border-r-0">
                      <p className="text-lg font-black text-white">{s.value}</p>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layanan performance */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="h-0.5 bg-[#009CC5]" />
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#009CC5]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Performa per Layanan</p>
                </div>
                {detail.layananStats.length === 0 ? (
                  <p className="px-5 py-6 text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">Belum ada data</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {detail.layananStats.map((ls) => (
                      <div key={ls.layananId} className="px-5 py-3 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-[#132B4F] truncate">{ls.layananNama}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden">
                              <div className="h-full transition-all duration-500"
                                style={{ width: `${Math.min(ls.ikm, 100)}%`, backgroundColor: ikmColor(ls.ikm) }} />
                            </div>
                            <span className="text-[9px] font-black shrink-0" style={{ color: ikmColor(ls.ikm) }}>{ls.ikm}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 text-[8px] font-black uppercase text-white"
                            style={{ backgroundColor: ikmColor(ls.ikm) }}>
                            {ikmLabel(ls.ikm)}
                          </span>
                          <p className="text-[9px] text-gray-400 mt-1">{ls.count} survei</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Respondents */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="h-0.5 bg-[#FAE705]" />
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-4 bg-[#FAE705]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Daftar Responden</p>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400">{detail.respondents.length} total</p>
                </div>

                {detail.respondents.length === 0 ? (
                  <p className="px-5 py-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada responden</p>
                ) : (
                  <>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ backgroundColor: "#132B4F" }}>
                          {["#", "Nama Responden", "Layanan", "Tgl Layanan", "IKM", "Saran"].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pageRespondents.map((r, i) => (
                          <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <td className="px-4 py-2.5 text-[9px] font-black text-gray-300">
                              {respondentPage * RESP_PER_PAGE + i + 1}
                            </td>
                            <td className="px-4 py-2.5 font-bold text-[#132B4F] whitespace-nowrap">{r.nama}</td>
                            <td className="px-4 py-2.5 text-gray-500 max-w-[140px] truncate">{r.layananNama}</td>
                            <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{r.tglLayanan}</td>
                            <td className="px-4 py-2.5 font-black text-[11px]" style={{ color: ikmColor(r.ikm) }}>{r.ikm}</td>
                            <td className="px-4 py-2.5 text-gray-400 max-w-[160px] truncate italic text-[10px]">
                              {r.saran ? `"${r.saran}"` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {totalRespPages > 1 && (
                      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[9px] font-bold text-gray-400">
                          {respondentPage * RESP_PER_PAGE + 1}–{Math.min((respondentPage + 1) * RESP_PER_PAGE, detail.respondents.length)} dari {detail.respondents.length}
                        </p>
                        <PaginationDots total={totalRespPages} current={respondentPage} onChange={setRespondentPage} />
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          )}

          {selectedId && !detailLoading && !detail && (
            <div className="h-full flex items-center justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Gagal memuat data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}