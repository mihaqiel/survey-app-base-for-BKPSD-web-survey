"use client";

import SparklineChart from "@/components/charts/SparklineChart";
import DonutChart, { DonutSlice } from "@/components/charts/DonutChart";
import { TrendingUp, PieChart } from "lucide-react";

interface EmployeeStat {
  id: string;
  nama: string;
  ikm: number;
  count: number;
}

interface PegawaiChartsProps {
  topEmployees: EmployeeStat[];
  donutData: DonutSlice[];
}

// Generate mock trend data per employee based on their IKM
// In production, replace with real historical data from the API
function generateTrend(baseIkm: number, points = 6): number[] {
  return Array.from({ length: points }, (_, i) => {
    const variance = (Math.sin(i * 1.3 + baseIkm) * 4 + Math.cos(i * 0.8) * 3);
    return Math.min(100, Math.max(60, parseFloat((baseIkm + variance).toFixed(1))));
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const SPARKLINE_COLORS = ["#009CC5", "#FAE705", "#16a34a", "#d97706", "#8b5cf6"];

export default function PegawaiCharts({ topEmployees, donutData }: PegawaiChartsProps) {
  const topFive = topEmployees.slice(0, 5).filter((e) => e.ikm > 0);

  const sparkLines = topFive.map((emp, i) => ({
    label: emp.nama.split(" ")[0],
    data: generateTrend(emp.ikm),
    color: SPARKLINE_COLORS[i % SPARKLINE_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Sparkline — Tren IKM Pegawai Terbaik */}
      <div className="bg-white border border-gray-200 overflow-hidden animate-fade-up card-hover">
        <div
          className="h-0.5 animate-draw-line"
          style={{ background: "linear-gradient(to right, #132B4F, #009CC5)" }}
        />
        <div className="px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#009CC5]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
                Tren IKM Pegawai Terbaik
              </p>
              <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                Top {topFive.length} pegawai berdasarkan skor IKM
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pt-3 pb-1">
          {sparkLines.length > 0 ? (
            <>
              <SparklineChart lines={sparkLines} xLabels={MONTHS} height={150} />
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pb-3">
                {sparkLines.map((line) => (
                  <div key={line.label} className="flex items-center gap-1.5">
                    <div className="w-4 h-0.5 shrink-0" style={{ backgroundColor: line.color }} />
                    <span className="text-[9px] font-bold text-gray-500 truncate max-w-[80px]">
                      {line.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[150px] flex flex-col items-center justify-center gap-2">
              <TrendingUp className="w-8 h-8 text-gray-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                Belum ada data
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Donut — IKM Category Distribution */}
      <div className="bg-white border border-gray-200 overflow-hidden animate-fade-up delay-75 card-hover">
        <div className="h-0.5 bg-[#FAE705] animate-draw-line" />
        <div className="px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#FAE705]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
                Distribusi Kategori IKM
              </p>
              <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                Sebaran performa layanan
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {donutData.some((d) => d.value > 0) ? (
            <DonutChart
              data={donutData}
              height={160}
              centerLabel="Layanan"
              centerValue={donutData.reduce((s, d) => s + d.value, 0)}
            />
          ) : (
            <div className="h-[160px] flex flex-col items-center justify-center gap-2">
              <PieChart className="w-8 h-8 text-gray-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                Belum ada data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}