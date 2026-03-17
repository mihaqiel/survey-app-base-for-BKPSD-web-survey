"use client";

import { useState, useEffect, useRef } from "react";
import DonutChart, { DonutSlice } from "@/components/charts/DonutChart";
import { BarChart3, TrendingUp } from "lucide-react";

export interface ServiceChartData {
  id: string;
  name: string;
  ikm: number;
  count: number;
  fill: string;
}

export interface TrendPoint {
  label: string;
  ikm: number;
  count?: number;
}

interface Props {
  services: ServiceChartData[];
  donutData: DonutSlice[];
  trendData: TrendPoint[];
}

function TrendLineChart({ data }: { data: TrendPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    let destroyed = false;

    import("chart.js").then((mod) => {
      if (destroyed) return;
      mod.Chart.register(
        mod.LineController, mod.LineElement, mod.PointElement,
        mod.CategoryScale, mod.LinearScale, mod.Tooltip, mod.Filler,
      );
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "line",
        data: {
          labels: data.map(d => d.label),
          datasets: [{
            data: data.map(d => d.ikm),
            borderColor: "#009CC5",
            backgroundColor: "rgba(0,156,197,0.08)",
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#009CC5",
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          animation: { duration: 800, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#ffffff",
              titleColor: "#132B4F",
              bodyColor: "#64748b",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 6,
              displayColors: false,
              titleFont: { size: 11, weight: "bold" as const },
              callbacks: {
                title: (items: any[]) => items[0]?.label ?? "",
                label: (item: any) => {
                  const v = Number(item.raw);
                  const tag = v >= 88.31 ? "Sangat Baik" : v >= 76.61 ? "Baik" : v >= 65 ? "Kurang Baik" : "Tidak Baik";
                  return `IKM: ${v.toFixed(2)}  (${tag})`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: "#94a3b8", font: { size: 10 }, maxRotation: 0, maxTicksLimit: 8 },
            },
            y: {
              grid: { color: "#f1f5f9" },
              border: { display: false },
              ticks: { color: "#94a3b8", font: { size: 10 }, maxTicksLimit: 6 },
              min: 60,
              max: 100,
            },
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [data]);

  return <div style={{ height: 200 }}><canvas ref={canvasRef} /></div>;
}

function ServiceBarChart({ services, mode }: { services: ServiceChartData[]; mode: "ikm" | "count" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<any>(null);
  const data = [...services].sort((a, b) => mode === "ikm" ? b.ikm - a.ikm : b.count - a.count);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    let destroyed = false;

    import("chart.js").then((mod) => {
      if (destroyed) return;
      mod.Chart.register(mod.BarController, mod.BarElement, mod.CategoryScale, mod.LinearScale, mod.Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "bar",
        data: {
          labels: data.map(d => d.name.length > 14 ? d.name.slice(0, 14) + "…" : d.name),
          datasets: [{
            data: data.map(d => mode === "ikm" ? d.ikm : d.count),
            backgroundColor: data.map(d => d.fill + "cc"),
            hoverBackgroundColor: data.map(d => d.fill),
            borderWidth: 0,
            borderRadius: 3,
            borderSkipped: false,
            maxBarThickness: 48,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 700, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#fff",
              titleColor: "#132B4F",
              bodyColor: "#64748b",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 6,
              displayColors: false,
              titleFont: { size: 11, weight: "bold" as const },
              callbacks: {
                title: (items: any[]) => data[items[0].dataIndex]?.name ?? "",
                label: (item: any) => mode === "ikm"
                  ? `IKM: ${data[item.dataIndex].ikm.toFixed(2)}`
                  : `Responden: ${data[item.dataIndex].count}`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 }, maxRotation: 30 } },
            y: { grid: { color: "#f1f5f9" }, border: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 }, maxTicksLimit: 5 }, min: 0, max: mode === "ikm" ? 100 : undefined },
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [data, mode]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2" style={{ height: 200 }}>
        <BarChart3 className="w-10 h-10 text-gray-200" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data layanan</p>
      </div>
    );
  }

  return <div style={{ height: 200 }}><canvas ref={canvasRef} /></div>;
}

export default function DashboardChartsV2({ services, donutData, trendData }: Props) {
  const [mode, setMode]               = useState<"ikm" | "count">("ikm");
  const [selectedService, setSelectedService] = useState<string>("all");

  // Filter services by selected service for chart
  const chartServices = selectedService === "all"
    ? services
    : services.filter(s => s.id === selectedService);

  // For trend: if a specific service is selected, filter trend data
  // (trendData is global — per-service trend would require a separate fetch)
  const hasTrend = trendData.length > 0 && selectedService === "all";

  // Filtered donut data based on service selection
  const filteredDonut = selectedService === "all"
    ? donutData
    : donutData; // donut always shows all

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* Left: Chart */}
      <div className="lg:col-span-2 bg-white border border-gray-200 overflow-hidden">
        <div className="h-0.5" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#009CC5]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
                {hasTrend ? "Tren IKM Keseluruhan (6 Bulan)" : "Perbandingan Kinerja Layanan"}
              </p>
              <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                {selectedService === "all" ? "Semua layanan" : `${chartServices[0]?.name ?? "Layanan terpilih"}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Service filter dropdown */}
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              title="Filter layanan"
              className="px-2 py-1 border border-gray-200 text-[9px] font-bold text-[#132B4F] bg-white outline-none hover:border-gray-300 transition-colors max-w-[140px] truncate"
            >
              <option value="all">Semua Layanan</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name.length > 20 ? s.name.slice(0, 20) + "…" : s.name}</option>
              ))}
            </select>
            {!hasTrend && (
              <div className="flex gap-1">
                {(["ikm", "count"] as const).map(m => (
                  <button key={m}
                    aria-label={m === "ikm" ? "Tampilkan IKM" : "Tampilkan Responden"}
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition-all rounded ${
                      mode === m ? "bg-[#132B4F] text-white" : "text-gray-400 hover:text-[#132B4F] hover:bg-gray-50"
                    }`}>
                    {m === "ikm" ? <><TrendingUp className="w-3 h-3" />IKM</> : <><BarChart3 className="w-3 h-3" />Responden</>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          {hasTrend
            ? <TrendLineChart data={trendData} />
            : <ServiceBarChart services={chartServices} mode={mode} />
          }
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Kategori IKM:</p>
          {[
            { color: "#16a34a", label: "Sangat Baik (≥88.31)" },
            { color: "#009CC5", label: "Baik (≥76.61)" },
            { color: "#d97706", label: "Kurang Baik (≥65)" },
            { color: "#dc2626", label: "Tidak Baik (<65)" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-bold text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Donut */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="h-0.5 bg-[#FAE705]" />
        <div className="px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#FAE705]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Status Performa Layanan</p>
              <p className="text-[9px] text-gray-400 font-medium mt-0.5">Distribusi kategori IKM</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {filteredDonut.some(d => d.value > 0) ? (
            <DonutChart data={filteredDonut} height={200} centerLabel="Layanan" centerValue={filteredDonut.reduce((s, d) => s + d.value, 0)} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2" style={{ height: 200 }}>
              <BarChart3 className="w-8 h-8 text-gray-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}