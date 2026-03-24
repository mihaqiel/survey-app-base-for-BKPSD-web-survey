"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, Activity } from "lucide-react";

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
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#3b82f6",
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
              titleColor: "#0f172a",
              bodyColor: "#64748b",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              titleFont: { size: 12, weight: "bold" as const },
              callbacks: {
                title: (items: any[]) => items[0]?.label ?? "",
                label: (item: any) => {
                  const v = Number(item.raw);
                  const tag = v >= 88.31 ? "Sangat Baik" : v >= 76.61 ? "Baik" : v >= 65 ? "Kurang Baik" : "Tidak Baik";
                  return `Skor IKM: ${v.toFixed(2)}  (${tag})`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: "#94a3b8", font: { size: 11 }, maxRotation: 0, maxTicksLimit: 8 },
            },
            y: {
              grid: { color: "#f1f5f9" },
              border: { display: false },
              ticks: { color: "#94a3b8", font: { size: 11 }, maxTicksLimit: 6 },
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

  return <div style={{ height: 260 }}><canvas ref={canvasRef} /></div>;
}

function ServiceWaveChart({ services, mode }: { services: ServiceChartData[]; mode: "ikm" | "count" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<any>(null);
  
  // Keep original order, avoid sorting to maintain a smooth continuous wave across X-axis 
  // if you want names alphabetically, or keeping the provided structured order.
  const data = [...services];

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    let destroyed = false;

    import("chart.js").then((mod) => {
      if (destroyed) return;
      mod.Chart.register(
        mod.LineController, mod.LineElement, mod.PointElement,
        mod.CategoryScale, mod.LinearScale, mod.Tooltip, mod.Filler
      );
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      
      const ctx = canvasRef.current!.getContext('2d');
      // Create a smooth gradient for the wave
      const gradient = ctx?.createLinearGradient(0, 0, 0, 300);
      gradient?.addColorStop(0, mode === "ikm" ? "rgba(59, 130, 246, 0.4)" : "rgba(16, 185, 129, 0.4)");
      gradient?.addColorStop(1, mode === "ikm" ? "rgba(59, 130, 246, 0.0)" : "rgba(16, 185, 129, 0.0)");

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "line",
        data: {
          labels: data.map(d => d.name.length > 14 ? d.name.slice(0, 14) + "…" : d.name),
          datasets: [{
            data: data.map(d => mode === "ikm" ? d.ikm : d.count),
            borderColor: mode === "ikm" ? "#3b82f6" : "#10b981",
            backgroundColor: gradient || "rgba(59,130,246,0.1)",
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: mode === "ikm" ? "#3b82f6" : "#10b981",
            pointBorderWidth: 2,
            fill: true,
            tension: 0.4, // This creates the smooth wave effect
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          animation: { duration: 1000, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#ffffff",
              titleColor: "#0f172a",
              bodyColor: "#64748b",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              titleFont: { size: 12, weight: "bold" as const },
              callbacks: {
                title: (items: any[]) => data[items[0].dataIndex]?.name ?? "",
                label: (item: any) => mode === "ikm"
                  ? `Skor IKM: ${data[item.dataIndex].ikm.toFixed(2)}`
                  : `Jumlah Responden: ${data[item.dataIndex].count}`,
              },
            },
          },
          scales: {
            x: { 
              grid: { display: false }, 
              border: { display: false }, 
              ticks: { color: "#94a3b8", font: { size: 11 }, maxRotation: 45 } 
            },
            y: { 
              grid: { color: "#f1f5f9" }, 
              border: { display: false }, 
              ticks: { color: "#94a3b8", font: { size: 11 }, maxTicksLimit: 6 }, 
              min: 0, 
              max: mode === "ikm" ? 100 : undefined 
            },
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
      <div className="flex flex-col items-center justify-center gap-3" style={{ height: 260 }}>
        <Activity className="w-12 h-12 text-slate-200" />
        <p className="text-sm font-medium text-slate-400">Belum ada data evaluasi layanan</p>
      </div>
    );
  }

  return <div style={{ height: 260 }}><canvas ref={canvasRef} /></div>;
}

export default function DashboardChartsV2({ services, trendData }: Props) {
  const [mode, setMode]               = useState<"ikm" | "count">("ikm");
  const [selectedService, setSelectedService] = useState<string>("all");

  const chartServices = selectedService === "all"
    ? services
    : services.filter(s => s.id === selectedService);

  const hasTrend = trendData.length > 0 && selectedService === "all";

  return (
    <div className="grid grid-cols-1 gap-6">

      {/* Full-width chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
             <h3 className="text-base font-semibold text-slate-900">
                {hasTrend ? "Tren IKM Keseluruhan (6 Bulan Terakhir)" : "Kurva Perbandingan Kinerja Layanan"}
             </h3>
             <p className="text-sm text-slate-500 mt-1">
                {selectedService === "all" ? "Visualisasi dari semua unit layanan" : `${chartServices[0]?.name ?? "Layanan terpilih"}`}
             </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Service filter dropdown */}
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              title="Filter layanan"
              className="px-3 py-1.5 rounded border border-gray-200 text-xs font-semibold text-slate-700 bg-white outline-none hover:border-gray-300 transition-colors max-w-[160px] truncate shadow-sm focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Semua Layanan</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name.length > 20 ? s.name.slice(0, 20) + "…" : s.name}</option>
              ))}
            </select>
            {!hasTrend && (
              <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                {(["ikm", "count"] as const).map(m => (
                  <button key={m}
                    aria-label={m === "ikm" ? "Tampilkan IKM" : "Tampilkan Responden"}
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-md ${
                      mode === m ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {m === "ikm" ? <><TrendingUp className="w-3.5 h-3.5" />IKM</> : <><Activity className="w-3.5 h-3.5" />Responden</>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-6 pb-4 flex-1">
          {hasTrend
            ? <TrendLineChart data={trendData} />
            : <ServiceWaveChart services={chartServices} mode={mode} />
          }
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex flex-wrap items-center gap-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori IKM:</p>
          <div className="flex flex-wrap items-center gap-4">
             {[
               { color: "#10b981", label: "Sangat Baik (≥88.31)" },
               { color: "#3b82f6", label: "Baik (≥76.61)" },
               { color: "#f59e0b", label: "Kurang Baik (≥65)" },
               { color: "#ef4444", label: "Tidak Baik (<65)" },
             ].map(({ color, label }) => (
               <div key={label} className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded border border-white/50" style={{ backgroundColor: color }} />
                 <span className="text-xs font-medium text-slate-600">{label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}