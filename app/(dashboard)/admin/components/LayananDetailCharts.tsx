"use client";

import IkmLineChart, { TrendPoint } from "@/components/charts/IkmLineChart";
import UnsurBarChart, { UnsurBar } from "@/components/charts/UnsurBarChart";
import { BarChart3, TrendingUp } from "lucide-react";

const UNSUR_LABELS = [
  "Persyaratan", "Sistem/Mekanisme", "Waktu Penyelesaian",
  "Biaya/Tarif", "Produk Layanan", "Kompetensi Pelaksana",
  "Perilaku Pelaksana", "Sarana & Prasarana", "Penanganan Pengaduan",
];

const SHORT_LABELS = ["U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9"];

// Split 9 unsur into 3 groups of 3 for the reference-style sub-charts
const GROUPS = [
  { title: "Administrasi", indices: [0, 1, 2] },
  { title: "Biaya & Produk", indices: [3, 4, 5] },
  { title: "Pelayanan", indices: [6, 7, 8] },
];

interface LayananDetailChartsProps {
  unsurAvg: number[];         // 1-4 scale per unsur
  trendData: TrendPoint[];    // monthly IKM trend
  ikm: number;
}

export default function LayananDetailCharts({
  unsurAvg,
  trendData,
  ikm,
}: LayananDetailChartsProps) {
  const hasTrend = trendData.length > 1;

  const allUnsurBars: UnsurBar[] = unsurAvg.map((val, i) => ({
    label: UNSUR_LABELS[i],
    shortLabel: SHORT_LABELS[i],
    value: val,
    ikm: val * 25,
  }));

  return (
    <div className="space-y-4">

      {/* ── 12-Month IKM Line Chart ── */}
      <div className="bg-white border border-gray-200 overflow-hidden animate-fade-up">
        <div
          className="h-0.5 animate-draw-line"
          style={{ background: "linear-gradient(to right, #009CC5, #FAE705)" }}
        />
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#009CC5]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
                Tren IKM Layanan
              </p>
              <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                {hasTrend ? `${trendData.length} periode data` : "Berdasarkan data periode aktif"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#009CC5]/10 rounded">
            <TrendingUp className="w-3 h-3 text-[#009CC5]" />
            <span className="text-[9px] font-black text-[#009CC5]">IKM {ikm.toFixed(2)}</span>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          {hasTrend ? (
            <IkmLineChart data={trendData} height={220} color="#009CC5" showArea />
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center gap-2">
              <BarChart3 className="w-8 h-8 text-gray-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                Data tren belum tersedia
              </p>
              <p className="text-[9px] text-gray-300 font-medium">
                Butuh minimal 2 periode untuk menampilkan tren
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 3-Group Unsur Bar Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GROUPS.map((group) => {
          const groupBars = group.indices.map((i) => allUnsurBars[i]);
          const groupAvg = groupBars.reduce((s, b) => s + b.value, 0) / groupBars.length;

          return (
            <div
              key={group.title}
              className="bg-white border border-gray-200 overflow-hidden animate-fade-up card-hover"
            >
              <div className="h-0.5 bg-[#009CC5] animate-draw-line" />
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-3.5 bg-[#009CC5]" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#132B4F]">
                    {group.title}
                  </p>
                </div>
                <span className="text-[9px] font-black text-gray-400">
                  avg {groupAvg.toFixed(2)}
                </span>
              </div>
              <div className="px-4 pb-2 pt-3">
                <UnsurBarChart data={groupBars} height={120} />
              </div>
              {/* Mini legend */}
              <div className="px-4 pb-3 space-y-1">
                {groupBars.map((bar) => (
                  <div key={bar.shortLabel} className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-black text-gray-400">{bar.shortLabel}</span>
                    <p className="text-[9px] text-gray-500 flex-1 truncate">{bar.label}</p>
                    <span className="text-[9px] font-black" style={{ color: bar.ikm >= 88.31 ? "#16a34a" : bar.ikm >= 76.61 ? "#009CC5" : bar.ikm >= 65 ? "#d97706" : "#dc2626" }}>
                      {bar.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}