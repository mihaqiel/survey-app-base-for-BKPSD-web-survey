"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import {
  AlertTriangle, Fingerprint, ShieldOff, TrendingUp,
  CheckCircle, Activity, Users,
} from "lucide-react";
import type { AnomalyStats, ServiceAnomalyRate } from "@/app/action/anomaly";

// ── Client-safe status colours ────────────────────────────────────────────────
const STATUS_COLORS = {
  normal:      "#22c55e",
  suspicious:  "#f59e0b",
  low_quality: "#ef4444",
  spam:        "#94a3b8",
};

interface Props {
  stats: AnomalyStats;
}

export default function AnomalyClient({ stats }: Props) {
  const {
    topFingerprints,
    serviceAnomalyRates,
    weeklyQualityTrend,
    totalFlagged,
    totalResponden,
  } = stats;

  const overallAnomalyPct = totalResponden > 0
    ? ((totalFlagged / totalResponden) * 100).toFixed(1)
    : "0.0";

  const highRiskServices = serviceAnomalyRates.filter(s => s.anomalyPct > 15);

  // ── Chart data ────────────────────────────────────────────────────────────
  // Take top 10 services for the bar chart
  const serviceChartData = serviceAnomalyRates.slice(0, 10).map(s => ({
    name: s.service.length > 18 ? s.service.slice(0, 18) + "…" : s.service,
    nameFull: s.service,
    Normal:      s.normal,
    Mencurigakan: s.suspicious,
    "Kualitas Rendah": s.low_quality,
    Spam:        s.spam,
  }));

  const trendChartData = weeklyQualityTrend.map(w => ({
    name: w.weekLabel,
    "Total Respons":   w.totalCount,
    "Mencurigakan (%)": +(w.rate * 100).toFixed(1),
  }));

  return (
    <div className="min-h-screen font-sans bg-gray-50/50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Anomali Monitoring</h1>
        <p className="text-xs text-slate-500">Analisis pola kecurangan, fingerprint berulang, dan kualitas data survei</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-8">

        {/* ── KPI Pills ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Responden",
              value: totalResponden.toLocaleString("id-ID"),
              color: "#3b82f6",
              icon: <Users className="w-5 h-5" />,
            },
            {
              label: "Respons Flagged",
              value: totalFlagged.toLocaleString("id-ID"),
              color: "#f59e0b",
              icon: <AlertTriangle className="w-5 h-5" />,
            },
            {
              label: "% Anomali",
              value: `${overallAnomalyPct}%`,
              color: parseFloat(overallAnomalyPct) > 10 ? "#ef4444" : "#22c55e",
              icon: <Activity className="w-5 h-5" />,
            },
            {
              label: "Layanan Berisiko Tinggi",
              value: String(highRiskServices.length),
              color: highRiskServices.length > 0 ? "#dc2626" : "#22c55e",
              icon: <ShieldOff className="w-5 h-5" />,
            },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: s.color + "15", color: s.color }}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── High-risk service warning ────────────────────────────────────── */}
        {highRiskServices.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">
                {highRiskServices.length} layanan memiliki tingkat anomali &gt; 15%
              </p>
              <p className="text-xs text-amber-700">
                {highRiskServices.slice(0, 3).map(s => s.service).join(", ")}
                {highRiskServices.length > 3 ? ` dan ${highRiskServices.length - 3} lainnya` : ""}
              </p>
            </div>
          </div>
        )}

        {/* ── Section 1: Top Fingerprints ──────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Pengguna Berulang (Top Fingerprint)</p>
              <p className="text-xs text-slate-500">Perangkat yang paling sering mengisi survei lintas periode</p>
            </div>
          </div>
          {topFingerprints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <CheckCircle className="w-8 h-8 text-green-200" />
              <p className="text-sm text-slate-400">Belum ada data fingerprint</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {["#", "Hash Fingerprint", "Pengisian", "Periode", "Layanan", "Aksi"].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topFingerprints.map((fp, i) => (
                    <tr key={fp.hash} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3 text-xs text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-sm text-slate-700">
                          {fp.hash.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          fp.count > 10 ? "bg-red-50 text-red-700" :
                          fp.count > 5  ? "bg-amber-50 text-amber-700" :
                                          "bg-blue-50 text-blue-700"
                        }`}>
                          {fp.count}x
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600">{fp.periods} periode</td>
                      <td className="px-5 py-3 text-xs text-slate-600">{fp.services} layanan</td>
                      <td className="px-5 py-3">
                        <a
                          href={`/admin/ip?tab=fingerprint&hash=${fp.hash}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all w-fit">
                          <ShieldOff className="w-3 h-3" />Blacklist
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Section 2: Service Anomaly Chart ─────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Distribusi Status per Layanan (Top 10)</p>
              <p className="text-xs text-slate-500">Breakdown respons valid vs mencurigakan per layanan — urutkan berdasarkan % anomali tertinggi</p>
            </div>
          </div>

          <div className="p-5">
            {serviceChartData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-400">Belum ada data</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceChartData} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: number | undefined, name: string | undefined) => [val ?? 0, name ?? ""]}
                      labelFormatter={(label, payload) => {
                        const full = payload?.[0]?.payload?.nameFull ?? label;
                        return full;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, marginTop: 8 }} />
                    <Bar dataKey="Normal"           fill={STATUS_COLORS.normal}      stackId="a" />
                    <Bar dataKey="Mencurigakan"     fill={STATUS_COLORS.suspicious}  stackId="a" />
                    <Bar dataKey="Kualitas Rendah"  fill={STATUS_COLORS.low_quality} stackId="a" />
                    <Bar dataKey="Spam"             fill={STATUS_COLORS.spam}        stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Table version */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Layanan", "Valid", "Mencurigakan", "Kual. Rendah", "Spam", "Total", "% Anomali"].map(h => (
                          <th key={h} className="px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {serviceAnomalyRates.map(s => (
                        <tr key={s.service} className={`hover:bg-gray-50/80 transition-colors ${s.anomalyPct > 15 ? "bg-red-50/30" : ""}`}>
                          <td className="px-3 py-2 text-slate-700 font-medium max-w-[200px] truncate">{s.service}</td>
                          <td className="px-3 py-2 text-green-700 font-semibold">{s.normal}</td>
                          <td className="px-3 py-2 text-amber-700">{s.suspicious}</td>
                          <td className="px-3 py-2 text-red-700">{s.low_quality}</td>
                          <td className="px-3 py-2 text-slate-500">{s.spam}</td>
                          <td className="px-3 py-2 text-slate-600">{s.total}</td>
                          <td className="px-3 py-2">
                            <span className={`font-bold ${s.anomalyPct > 15 ? "text-red-600" : s.anomalyPct > 5 ? "text-amber-600" : "text-green-600"}`}>
                              {s.anomalyPct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Section 3: Weekly Quality Trend ──────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Tren Kualitas Respons Mingguan (12 Minggu)</p>
              <p className="text-xs text-slate-500">Persentase respons mencurigakan per minggu — garis merah menunjukkan ambang 10%</p>
            </div>
          </div>

          <div className="p-5">
            {trendChartData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-400">Belum ada data dalam 12 minggu terakhir</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendChartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: number | undefined, name: string | undefined) =>
                      name === "Mencurigakan (%)" ? [`${val ?? 0}%`, name] : [val ?? 0, name ?? ""]
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Total Respons"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Mencurigakan (%)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    strokeDasharray="4 2"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
