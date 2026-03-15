"use client";

import { createPegawai } from "@/app/action/admin";
import Link from "next/link";
import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import {
  ArrowLeft, Plus, User, Users, BarChart3, TrendingUp,
  ChevronLeft, ChevronRight, Loader2, ClipboardList,
  Award, PieChart, Bell, Search,
} from "lucide-react";
import PegawaiCharts from "@/app/(dashboard)/admin/components/PegawaiCharts";
import Breadcrumb from "@/components/ui/Breadcrumb";

// ── types ──────────────────────────────────────────────────────────────────
interface Employee { id: string; nama: string; }
interface LayananStat { layananId: string; layananNama: string; count: number; ikm: number; }
interface Respondent  { id: string; nama: string; layananNama: string; tglLayanan: string; ikm: number; saran?: string | null; }
interface EmployeeDetail {
  id: string; nama: string;
  totalSurveys: number; ikm: number;
  layananStats: LayananStat[];
  respondents: Respondent[];
}

// ── helpers ────────────────────────────────────────────────────────────────
function getInitials(nama: string) {
  return nama.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function ikmColor(ikm: number) {
  if (ikm === 0)    return "#94a3b8";
  if (ikm >= 88.31) return "#16a34a";
  if (ikm >= 76.61) return "#009CC5";
  if (ikm >= 65)    return "#d97706";
  return "#dc2626";
}
function ikmLabel(ikm: number) {
  if (ikm === 0)    return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65)    return "Kurang Baik";
  return "Tidak Baik";
}
function ikmBg(ikm: number) {
  if (ikm === 0)    return "bg-gray-100 text-gray-400";
  if (ikm >= 88.31) return "bg-green-50 text-green-700";
  if (ikm >= 76.61) return "bg-sky-50 text-sky-700";
  if (ikm >= 65)    return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

const PER_PAGE      = 10;
const RESP_PER_PAGE = 8;

// ── Pagination ─────────────────────────────────────────────────────────────
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (i: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(page - 1)} disabled={page === 0} aria-label="Halaman sebelumnya"
        className="w-7 h-7 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-[#132B4F] hover:text-white hover:border-[#132B4F] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150">
        <ChevronLeft className="w-3 h-3" />
      </button>
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onChange(i)} aria-label={`Halaman ${i + 1}`}
          className={`w-7 h-7 text-[9px] font-black transition-all duration-150 ${
            i === page ? "bg-[#132B4F] text-white" : "text-gray-400 hover:bg-gray-100 border border-gray-200"
          }`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === total - 1} aria-label="Halaman berikutnya"
        className="w-7 h-7 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-[#132B4F] hover:text-white hover:border-[#132B4F] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150">
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── IKM Pie Chart ──────────────────────────────────────────────────────────
function IkmPieChart({ layananStats }: { layananStats: LayananStat[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const categories = [
    { label: "Sangat Baik", color: "#16a34a", bg: "bg-green-50", text: "text-green-700", min: 88.31 },
    { label: "Baik",        color: "#009CC5", bg: "bg-sky-50",   text: "text-sky-700",   min: 76.61 },
    { label: "Kurang Baik", color: "#d97706", bg: "bg-amber-50", text: "text-amber-700", min: 65 },
    { label: "Tidak Baik",  color: "#dc2626", bg: "bg-red-50",   text: "text-red-700",   min: 0 },
  ];

  const counts = categories.map(cat => ({
    ...cat,
    count: layananStats.filter(ls => {
      if (ls.ikm === 0) return false;
      if (cat.min === 88.31) return ls.ikm >= 88.31;
      if (cat.min === 76.61) return ls.ikm >= 76.61 && ls.ikm < 88.31;
      if (cat.min === 65)    return ls.ikm >= 65 && ls.ikm < 76.61;
      return ls.ikm > 0 && ls.ikm < 65;
    }).length,
  }));

  const total = counts.reduce((s, c) => s + c.count, 0);
  if (total === 0) return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <PieChart className="w-8 h-8 text-gray-200" />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data IKM</p>
    </div>
  );

  // SVG pie chart
  const cx = 80; const cy = 80; const r = 64;
  let startAngle = -Math.PI / 2;
  const slices = counts.filter(c => c.count > 0).map(c => {
    const angle = (c.count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const endAngle = startAngle + angle;
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const midAngle = startAngle + angle / 2;
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const slice = { ...c, path, midAngle, endAngle };
    startAngle = endAngle;
    return slice;
  });

  const hoveredSlice = hovered ? slices.find(s => s.label === hovered) : null;

  return (
    <div className="flex items-center gap-6 p-5">
      {/* SVG */}
      <div className="shrink-0 relative">
        <svg width={160} height={160} viewBox="0 0 160 160">
          {slices.map(slice => {
            const isHovered = hovered === slice.label;
            const ox = isHovered ? Math.cos(slice.midAngle) * 5 : 0;
            const oy = isHovered ? Math.sin(slice.midAngle) * 5 : 0;
            return (
              <path
                key={slice.label}
                d={slice.path}
                fill={slice.color}
                transform={`translate(${ox}, ${oy})`}
                opacity={hovered && !isHovered ? 0.4 : 1}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHovered(slice.label)}
                onMouseLeave={() => setHovered(null)}
                style={{ filter: isHovered ? `drop-shadow(0 2px 6px ${slice.color}60)` : "none" }}
              />
            );
          })}
          {/* Donut hole */}
          <circle cx={cx} cy={cy} r={36} fill="white" />
          {/* Center label */}
          <text x={cx} y={cy - 6} textAnchor="middle" className="font-black" fontSize={11} fill="#132B4F" fontWeight={900}>
            {hoveredSlice ? hoveredSlice.count : total}
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize={8} fill="#94a3b8" fontWeight={700}>
            {hoveredSlice ? hoveredSlice.label.toUpperCase().slice(0, 8) : "LAYANAN"}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5">
        {counts.map(c => {
          const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
          return (
            <div key={c.label}
              className={`flex items-center gap-2.5 cursor-pointer transition-opacity duration-150 ${hovered && hovered !== c.label ? "opacity-40" : "opacity-100"}`}
              onMouseEnter={() => setHovered(c.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: c.color }} />
              <p className="text-[10px] font-black text-[#132B4F] flex-1">{c.label}</p>
              <span className="text-[9px] font-bold text-gray-400">{c.count} layanan</span>
              <span className="text-[10px] font-black w-8 text-right" style={{ color: c.color }}>{pct}%</span>
            </div>
          );
        })}
        <div className="pt-1 border-t border-gray-100">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
            {total} layanan aktif · {layananStats.filter(l => l.ikm === 0).length} belum ada data
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Respondent Volume Bar Chart ────────────────────────────────────────────
function RespondentBarChart({ layananStats }: { layananStats: LayananStat[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const sorted = [...layananStats].sort((a, b) => b.count - a.count).slice(0, 8);
  const max = Math.max(...sorted.map(s => s.count), 1);

  if (sorted.length === 0) return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <BarChart3 className="w-8 h-8 text-gray-200" />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
    </div>
  );

  const chartH = 120;
  const barW   = Math.min(36, Math.floor((360 - sorted.length * 6) / sorted.length));
  const gap    = 6;
  const totalW = sorted.length * (barW + gap) - gap;

  return (
    <div className="p-5">
      <div className="overflow-x-auto">
        <svg width={Math.max(totalW + 40, 360)} height={chartH + 48} className="overflow-visible">
          {/* Y grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t}
              x1={0} y1={chartH * (1 - t)}
              x2={totalW + 8} y2={chartH * (1 - t)}
              stroke="#f1f5f9" strokeWidth={1}
            />
          ))}
          {sorted.map((s, i) => {
            const barH   = Math.max((s.count / max) * chartH, 4);
            const x      = i * (barW + gap);
            const y      = chartH - barH;
            const isHov  = hovered === s.layananId;
            const color  = isHov ? "#132B4F" : "#009CC5";
            const label  = s.layananNama.length > 10 ? s.layananNama.slice(0, 10) + "…" : s.layananNama;
            return (
              <g key={s.layananId}
                onMouseEnter={() => setHovered(s.layananId)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer">
                {/* Bar */}
                <rect x={x} y={y} width={barW} height={barH}
                  fill={color}
                  opacity={hovered && !isHov ? 0.35 : 1}
                  className="transition-all duration-200"
                  rx={2}
                  style={{ filter: isHov ? `drop-shadow(0 2px 6px ${color}60)` : "none" }}
                />
                {/* IKM color indicator strip at bottom */}
                <rect x={x} y={chartH - 3} width={barW} height={3}
                  fill={ikmColor(s.ikm)} rx={1} opacity={0.8} />
                {/* Count label on top */}
                {isHov && (
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                    fontSize={9} fontWeight={900} fill="#132B4F">
                    {s.count}
                  </text>
                )}
                {/* X axis label */}
                <text x={x + barW / 2} y={chartH + 14} textAnchor="middle"
                  fontSize={8} fontWeight={700}
                  fill={isHov ? "#132B4F" : "#94a3b8"}>
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Tooltip row */}
      <div className="mt-2 h-7 flex items-center">
        {hovered ? (() => {
          const s = sorted.find(x => x.layananId === hovered);
          if (!s) return null;
          return (
            <div className="flex items-center gap-3 animate-fade-up">
              <div className="w-2 h-2" style={{ backgroundColor: ikmColor(s.ikm) }} />
              <p className="text-[10px] font-black text-[#132B4F]">{s.layananNama}</p>
              <span className="text-[9px] font-bold text-gray-400">{s.count} survei</span>
              <span className={`text-[8px] font-black px-2 py-0.5 ${ikmBg(s.ikm)}`}>{ikmLabel(s.ikm)}</span>
              <span className="text-[10px] font-black" style={{ color: ikmColor(s.ikm) }}>IKM {s.ikm}</span>
            </div>
          );
        })() : (
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Hover bar untuk detail · warna bawah = kategori IKM</p>
        )}
      </div>
    </div>
  );
}

// ── Add form ───────────────────────────────────────────────────────────────
function AddForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">
      <div className="animate-fade-down bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 animate-slide-left">
          <div className="w-1 h-7 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Pegawai</p>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F]">Tambah Pegawai Baru</h1>
          </div>
        </div>
        <button onClick={onBack}
          className="btn-shimmer group flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Kembali
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-slide-left bg-white border border-gray-200 overflow-hidden card-hover">
          <div className="h-0.5 bg-[#009CC5] animate-draw-line" />
          <div className="p-8">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-6">Detail Pegawai</p>
            <form action={createPegawai} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input name="nama" type="text" required title="Nama Lengkap" placeholder="e.g. Rina Sapariyani, S.Kom"
                  className="input-glow w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200 hover:border-gray-300" />
                <p className="text-[10px] text-gray-400 font-medium mt-2">Sertakan gelar akademik jika ada</p>
              </div>
              <button type="submit"
                className="btn-shimmer group w-full py-4 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] hover:scale-[1.01] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                Tambah Pegawai
              </button>
            </form>
          </div>
        </div>
        <div className="animate-slide-right bg-[#132B4F] overflow-hidden card-hover">
          <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5] animate-draw-line" />
          <div className="p-8 space-y-6">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5]">Panduan</p>
            {[
              "Masukkan nama lengkap sesuai dokumen resmi, termasuk gelar akademik.",
              "Nama pegawai dapat dicari secara real-time di formulir survei publik.",
              "Menghapus pegawai tidak akan menghapus respons survei historis mereka.",
              "Setiap respons terhubung permanen ke pegawai yang dipilih saat pengisian.",
            ].map((text, i) => (
              <div key={i} className="flex gap-3 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
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
  );
}

// ── Employee detail right panel ────────────────────────────────────────────
function DetailPanel({ detail }: { detail: EmployeeDetail }) {
  const [respondentPage, setRespondentPage] = useState(0);

  const layananRef    = useRef<HTMLDivElement>(null);
  const respondentRef = useRef<HTMLDivElement>(null);
  const panelRef      = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const totalRespPages  = Math.ceil(detail.respondents.length / RESP_PER_PAGE);
  const pageRespondents = detail.respondents.slice(
    respondentPage * RESP_PER_PAGE,
    respondentPage * RESP_PER_PAGE + RESP_PER_PAGE
  );

  const maxLayananCount = Math.max(...detail.layananStats.map(l => l.count), 1);

  const metricCards = [
    {
      label: "Total Survei",
      value: detail.totalSurveys,
      icon: <BarChart3 className="w-4 h-4" />,
      color: "#009CC5",
      hint: "Klik untuk lihat layanan",
      onClick: () => scrollTo(layananRef),
    },
    {
      label: "Layanan",
      value: detail.layananStats.length,
      icon: <ClipboardList className="w-4 h-4" />,
      color: "#132B4F",
      hint: "Klik untuk lihat performa",
      onClick: () => scrollTo(layananRef),
    },
    {
      label: "Responden",
      value: detail.respondents.length,
      icon: <Users className="w-4 h-4" />,
      color: "#16a34a",
      hint: "Klik untuk lihat daftar",
      onClick: () => scrollTo(respondentRef),
    },
    {
      label: "IKM",
      value: detail.ikm > 0 ? detail.ikm : "—",
      icon: <TrendingUp className="w-4 h-4" />,
      color: ikmColor(detail.ikm),
      hint: ikmLabel(detail.ikm),
      onClick: () => scrollTo(layananRef),
    },
  ];

  return (
    <div ref={panelRef} className="p-6 space-y-5 animate-fade-up">

      {/* ── HERO CARD ── */}
      <div className="bg-[#132B4F] overflow-hidden card-hover">
        <div className="h-1 animate-draw-line" style={{ background: "linear-gradient(to right, #FAE705 33%, #009CC5 66%, #132B4F)" }} />
        <div className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FAE705] flex items-center justify-center text-[#132B4F] text-base font-black shrink-0 animate-bounce-in">
            {getInitials(detail.nama)}
          </div>
          <div className="flex-1 min-w-0 animate-fade-up delay-75">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Pegawai BKPSDM</p>
            <h2 className="text-base font-black text-white leading-tight">{detail.nama}</h2>
          </div>
          <div className="text-right shrink-0 animate-fade-up delay-150">
            <p className="text-2xl font-black animate-count-up" style={{ color: ikmColor(detail.ikm) }}>
              {detail.ikm > 0 ? detail.ikm : "—"}
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: ikmColor(detail.ikm) }}>
              {ikmLabel(detail.ikm)}
            </p>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE METRIC CARDS ── */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
          Statistik — klik kartu untuk navigasi
        </p>
        <div className="grid grid-cols-4 gap-2">
          {metricCards.map((card, i) => (
            <button
              key={card.label}
              onClick={card.onClick}
              title={card.hint}
              className="group bg-white border border-gray-200 overflow-hidden text-left card-hover hover:border-[#009CC5] hover:shadow-[0_4px_16px_rgba(0,156,197,0.15)] transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-0.5 animate-draw-line" style={{ backgroundColor: card.color }} />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-tight">{card.label}</p>
                  <span style={{ color: card.color }} className="opacity-30 group-hover:opacity-70 transition-opacity">
                    {card.icon}
                  </span>
                </div>
                <p className="text-xl font-black animate-count-up" style={{ color: card.color }}>{card.value}</p>
                <p className="text-[8px] text-gray-300 font-bold mt-1 group-hover:text-[#009CC5] transition-colors truncate">{card.hint}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── ANALYTICS CHARTS ROW ── */}
      {detail.layananStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "120ms" }}>

          {/* IKM Distribution Pie Chart */}
          <div className="bg-white border border-gray-200 overflow-hidden card-hover">
            <div className="h-0.5 bg-[#FAE705] animate-draw-line" />
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <div className="w-0.5 h-4 bg-[#FAE705]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Distribusi Kategori IKM</p>
            </div>
            <IkmPieChart layananStats={detail.layananStats} />
          </div>

          {/* Respondent Volume Bar Chart */}
          <div className="bg-white border border-gray-200 overflow-hidden card-hover">
            <div className="h-0.5 bg-[#009CC5] animate-draw-line" />
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-[#009CC5]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Volume Survei per Layanan</p>
              </div>
              {detail.layananStats.length > 8 && (
                <span className="text-[8px] font-bold text-gray-300">Top 8 ditampilkan</span>
              )}
            </div>
            <RespondentBarChart layananStats={detail.layananStats} />
          </div>
        </div>
      )}

      {/* ── LAYANAN PERFORMANCE — bar chart ── */}
      <div ref={layananRef} className="bg-white border border-gray-200 overflow-hidden card-hover scroll-mt-6">
        <div className="h-0.5 bg-[#009CC5] animate-draw-line" />
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#009CC5]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Performa per Layanan</p>
          </div>
          {detail.layananStats.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-green-500" />
                <span className="text-[9px] font-bold text-green-600">
                  Terbaik: {detail.layananStats.reduce((a, b) => a.ikm > b.ikm ? a : b).layananNama.substring(0, 16)}…
                </span>
              </div>
            </div>
          )}
        </div>

        {detail.layananStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <BarChart3 className="w-8 h-8 text-gray-200" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data layanan</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {detail.layananStats.map((ls, i) => {
              const col    = ikmColor(ls.ikm);
              const barPct = (ls.count / maxLayananCount) * 100;
              const ikmPct = Math.min(ls.ikm, 100);
              return (
                <div
                  key={ls.layananId}
                  className="animate-fade-up hover:bg-[#F0F4F8]/50 transition-colors p-2 -mx-2"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold text-[#132B4F] truncate flex-1 mr-4">{ls.layananNama}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-black text-gray-400">{ls.count} survei</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 ${ikmBg(ls.ikm)}`}>{ikmLabel(ls.ikm)}</span>
                      <span className="text-[10px] font-black w-10 text-right" style={{ color: col }}>{ls.ikm}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-gray-300 w-6 shrink-0">IKM</span>
                    <div className="flex-1 h-2 bg-gray-100 overflow-hidden">
                      <div className="h-full progress-bar transition-all duration-700"
                        style={{ width: `${ikmPct}%`, backgroundColor: col }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-black text-gray-300 w-6 shrink-0">Resp</span>
                    <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden">
                      <div className="h-full progress-bar transition-all duration-700 bg-[#009CC5]/40"
                        style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── RESPONDENT TABLE ── */}
      <div ref={respondentRef} className="bg-white border border-gray-200 overflow-hidden card-hover scroll-mt-6">
        <div className="h-0.5 bg-[#FAE705] animate-draw-line" />
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#FAE705]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Daftar Responden</p>
          </div>
          <p className="text-[9px] font-bold text-gray-400">{detail.respondents.length} total</p>
        </div>

        {detail.respondents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Users className="w-8 h-8 text-gray-200" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada responden</p>
          </div>
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
                  <tr key={r.id}
                    className={`transition-colors hover:bg-[#F0F4F8]/50 animate-fade-up ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="px-4 py-2.5 text-[9px] font-black text-gray-300">{respondentPage * RESP_PER_PAGE + i + 1}</td>
                    <td className="px-4 py-2.5 font-bold text-[#132B4F] whitespace-nowrap">{r.nama}</td>
                    <td className="px-4 py-2.5 text-gray-500 max-w-[140px] truncate">{r.layananNama}</td>
                    <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{r.tglLayanan}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 ${ikmBg(r.ikm)}`}>{r.ikm}</span>
                    </td>
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
                <Pagination page={respondentPage} total={totalRespPages} onChange={setRespondentPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function EmployeeManagementPage() {
  const [showAddForm, setShowAddForm]     = useState(false);
  const [employees, setEmployees]         = useState<Employee[]>([]);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [detail, setDetail]               = useState<EmployeeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage]                   = useState(0);
  const [, startTransition]               = useTransition();

  useEffect(() => {
    fetch("/api/pegawai").then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setDetailLoading(true);
    fetch(`/api/pegawai/${selectedId}/detail`)
      .then(r => r.json()).then(setDetail).catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  if (showAddForm) return <AddForm onBack={() => setShowAddForm(false)} />;

  const totalPages    = Math.ceil(employees.length / PER_PAGE);
  const pageEmployees = employees.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  // Derive donut data for chart
  const donutData = (() => {
    const counts = { sb: 0, b: 0, kb: 0, tb: 0 };
    employees.forEach(() => {}); // placeholder
    if (detail) {
      detail.layananStats.forEach(ls => {
        if (ls.ikm >= 88.31) counts.sb++;
        else if (ls.ikm >= 76.61) counts.b++;
        else if (ls.ikm >= 65) counts.kb++;
        else if (ls.ikm > 0) counts.tb++;
      });
    }
    return [
      { name: "Sangat Baik", value: counts.sb, fill: "#16a34a" },
      { name: "Baik",        value: counts.b,  fill: "#009CC5" },
      { name: "Kurang Baik", value: counts.kb, fill: "#d97706" },
      { name: "Tidak Baik",  value: counts.tb, fill: "#dc2626" },
    ];
  })();

  const topEmployeeStats = detail ? [{ id: detail.id, nama: detail.nama, ikm: detail.ikm, count: detail.totalSurveys }] : [];

  const overallAvgIkm = employees.length > 0 ? 85.37 : 0; // replace with real avg when API provides it
  const totalSurveys  = detail?.totalSurveys ?? 0;
  const negativeFeedback = detail?.respondents.filter(r => r.ikm < 65).length ?? 0;

  return (
    <div className="font-sans bg-[#F0F4F8] flex flex-col" style={{ height: "100vh" }}>

      {/* GLOBAL HEADER */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div className="animate-slide-left">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Manajemen Pegawai" }]} />
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none mt-0.5">Manajemen Pegawai</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 animate-slide-right">
          <div className="hidden md:flex items-center gap-2 bg-[#F0F4F8] border border-gray-200 px-3 py-1.5 w-44">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-400 font-medium">Search Global...</span>
          </div>
          <button aria-label="Notifikasi" className="w-8 h-8 flex items-center justify-center bg-[#F0F4F8] border border-gray-200 hover:bg-white transition-colors">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F4F8] border border-gray-200">
            <Users className="w-3.5 h-3.5 text-[#009CC5]" />
            <span className="text-[10px] font-black text-[#132B4F]">{employees.length} Pegawai</span>
          </div>
          <button onClick={() => setShowAddForm(true)} aria-label="Tambah pegawai baru"
            className="btn-shimmer group flex items-center gap-2 px-3 py-1.5 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]">
            <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
            Tambah
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
        <div className="flex items-center">
          {["Ringkasan", "Performa", "Riwayat"].map((tab, i) => (
            <button key={tab} className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-150 ${i === 0 ? "border-[#009CC5] text-[#009CC5]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="px-4 lg:px-6 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {[
          { label: "Total Pegawai",         value: employees.length, accent: "#132B4F", icon: <Users className="w-4 h-4" /> },
          { label: "IKM Rata-rata Pegawai", value: (detail && detail.ikm > 0) ? detail.ikm : "—", accent: "#009CC5", icon: <BarChart3 className="w-4 h-4" /> },
          { label: "Jumlah Survei",         value: totalSurveys,     accent: "#FAE705", icon: <ClipboardList className="w-4 h-4" /> },
          { label: "Feedback Negatif",      value: negativeFeedback, accent: negativeFeedback > 0 ? "#dc2626" : "#94a3b8", icon: <Award className="w-4 h-4" /> },
        ].map((card, i) => (
          <div key={card.label} className={`animate-fade-up bg-white border border-gray-200 overflow-hidden card-hover delay-${(i + 1) * 75}`}>
            <div className="h-1 animate-draw-line" style={{ backgroundColor: card.accent }} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{card.label}</p>
                <span style={{ color: card.accent }} className="opacity-30">{card.icon}</span>
              </div>
              <p className="text-2xl font-black leading-none" style={{ color: card.accent === "#FAE705" ? "#132B4F" : card.accent }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW — only when employee is selected */}
      {detail && (
        <div className="px-4 lg:px-6 pt-4 shrink-0">
          <PegawaiCharts
            topEmployees={[{ id: detail.id, nama: detail.nama, ikm: detail.ikm, count: detail.totalSurveys }]}
            donutData={donutData}
          />
        </div>
      )}

      {/* SPLIT PANELS */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT PANEL */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col animate-slide-left">
          <div className="px-5 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-0.5 h-4 bg-[#FAE705]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Daftar Pegawai</p>
            </div>
            <p className="text-[9px] text-gray-400 font-bold pl-2.5">Klik untuk lihat detail & statistik</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {pageEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 gap-2">
                <Users className="w-8 h-8 text-gray-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">Belum ada pegawai</p>
              </div>
            ) : pageEmployees.map((emp, i) => {
              const globalRank = page * PER_PAGE + i + 1;
              const isSelected = selectedId === emp.id;
              return (
                <button key={emp.id} onClick={() => setSelectedId(emp.id)} aria-label={`Pilih pegawai ${emp.nama}`}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 animate-fade-up ${
                    isSelected ? "bg-[#132B4F]" : "hover:bg-[#F0F4F8]"
                  }`}
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                  <div className={`text-[9px] font-black w-5 shrink-0 ${isSelected ? "text-white/30" : "text-gray-300"}`}>
                    {String(globalRank).padStart(2, "0")}
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center shrink-0 text-[10px] font-black transition-transform duration-200 hover:scale-105 ${
                    isSelected ? "bg-[#FAE705] text-[#132B4F]" : "bg-[#132B4F] text-[#FAE705]"
                  }`}>
                    {getInitials(emp.nama)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black truncate ${isSelected ? "text-white" : "text-[#132B4F]"}`}>{emp.nama}</p>
                    <p className={`text-[9px] font-bold ${isSelected ? "text-white/30" : "text-gray-400"}`}>BKPSDM Anambas</p>
                  </div>
                  {isSelected && <div className="w-0.5 h-5 bg-[#FAE705] shrink-0" />}
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="shrink-0 border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <p className="text-[9px] font-bold text-gray-400">
                {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, employees.length)} / {employees.length}
              </p>
              <Pagination page={page} total={totalPages} onChange={i => { setPage(i); setSelectedId(null); }} />
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 overflow-y-auto">
          {!selectedId && (
            <div className="h-full flex flex-col items-center justify-center gap-3 animate-fade-in">
              <div className="w-14 h-14 bg-white border border-gray-200 flex items-center justify-center">
                <User className="w-7 h-7 text-gray-200" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">Pilih pegawai di panel kiri</p>
              <p className="text-[9px] font-bold text-gray-300">Klik nama untuk melihat statistik & performa</p>
            </div>
          )}

          {selectedId && detailLoading && (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#009CC5] animate-spin" />
            </div>
          )}

          {selectedId && !detailLoading && detail && (
            <DetailPanel key={selectedId} detail={detail} />
          )}

          {selectedId && !detailLoading && !detail && (
            <div className="h-full flex items-center justify-center animate-fade-in">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Gagal memuat data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}