"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BarChart3, TrendingUp, ArrowLeft, MousePointerClick } from "lucide-react";

export interface ChartData {
  name: string;
  ikm: number;
  value?: number;
  fill: string;
  id?: string;
}

export interface TrendPoint {
  date: string;
  count: number;
  ikm?: number;
}

interface DrillData {
  label: string;
  trend: TrendPoint[];
  color: string;
}

function ikmLabel(ikm: number) {
  if (ikm === 0)    return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65.00) return "Kurang Baik";
  return "Tidak Baik";
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

function BarChartView({
  data, onDrill, mode,
}: {
  data: ChartData[];
  onDrill: (item: ChartData) => void;
  mode: "ikm" | "count";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    let destroyed = false;

    import("chart.js").then((mod) => {
      if (destroyed) return;
      mod.Chart.register(
        mod.BarController, mod.BarElement,
        mod.CategoryScale, mod.LinearScale,
        mod.Tooltip, mod.Legend,
      );
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "bar",
        data: {
          labels: data.map(d => d.name.length > 14 ? d.name.substring(0, 14) + "…" : d.name),
          datasets: [{
            label: mode === "ikm" ? "Nilai IKM" : "Responden",
            data:  data.map(d => mode === "ikm" ? d.ikm : (d.value ?? 0)),
            backgroundColor: data.map(d => d.fill + "bb"),
            hoverBackgroundColor: data.map(d => d.fill),
            borderWidth: 0,
            borderRadius: 3,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 700, easing: "easeOutQuart" },
          onClick: (_: any, elements: any[]) => {
            if (elements.length > 0) onDrill(data[elements[0].index]);
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0D1F38",
              titleColor: "#FAE705",
              bodyColor: "#e2e8f0",
              titleFont: { size: 11, weight: "bold" as const },
              bodyFont: { size: 12 },
              padding: 12,
              cornerRadius: 0,
              callbacks: {
                title: (items: any[]) => data[items[0].dataIndex]?.name ?? "",
                label: (item: any) =>
                  mode === "ikm"
                    ? `IKM: ${item.raw}  —  ${ikmLabel(Number(item.raw))}`
                    : `Responden: ${item.raw}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "#94a3b8",
                font: { size: 10, weight: "bold" as const },
                maxRotation: 35,
              },
              border: { display: false },
            },
            y: {
              grid: { color: "#f1f5f9" },
              ticks: { color: "#94a3b8", font: { size: 10 }, maxTicksLimit: 6 },
              border: { display: false },
              min: 0,
              max: mode === "ikm" ? 100 : undefined,
            },
          },
          onHover: (_: any, elements: any[]) => {
            if (canvasRef.current)
              canvasRef.current.style.cursor = elements.length > 0 ? "pointer" : "default";
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [data, mode, onDrill]);

  return <canvas ref={canvasRef} />;
}

// ── Line chart (drill-down) ───────────────────────────────────────────────────

function LineChartView({ drill }: { drill: DrillData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let destroyed = false;

    import("chart.js").then((mod) => {
      if (destroyed) return;
      mod.Chart.register(
        mod.LineController, mod.LineElement, mod.PointElement,
        mod.CategoryScale, mod.LinearScale,
        mod.Tooltip, mod.Filler,
      );
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      const hasIkm = drill.trend.some(p => (p.ikm ?? 0) > 0);

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "line",
        data: {
          labels: drill.trend.map(p => p.date),
          datasets: [
            {
              label: "Responden",
              data: drill.trend.map(p => p.count),
              borderColor: drill.color,
              backgroundColor: drill.color + "18",
              borderWidth: 2.5,
              pointRadius: 5,
              pointBackgroundColor: drill.color,
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
              yAxisID: "y",
            },
            ...(hasIkm ? [{
              label: "IKM",
              data: drill.trend.map(p => p.ikm ?? 0),
              borderColor: "#FAE705",
              backgroundColor: "transparent",
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: "#FAE705",
              pointBorderColor: "#fff",
              pointBorderWidth: 1.5,
              tension: 0.4,
              borderDash: [5, 3],
              yAxisID: "y2",
            }] : []),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 500, easing: "easeOutCubic" },
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0D1F38",
              titleColor: "#FAE705",
              bodyColor: "#e2e8f0",
              padding: 12,
              cornerRadius: 0,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#94a3b8", font: { size: 10, weight: "bold" as const } },
              border: { display: false },
            },
            y: {
              position: "left",
              grid: { color: "#f1f5f9" },
              ticks: { color: "#94a3b8", font: { size: 10 }, maxTicksLimit: 6 },
              border: { display: false },
            },
            ...(hasIkm ? {
              y2: {
                position: "right",
                grid: { display: false },
                ticks: { color: "#b45309", font: { size: 10 }, maxTicksLimit: 6 },
                border: { display: false },
                min: 0, max: 100,
              },
            } : {}),
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [drill]);

  return <canvas ref={canvasRef} />;
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DashboardCharts({
  data,
  defaultMode = "ikm",
}: {
  data: ChartData[];
  defaultMode?: "ikm" | "count";
}) {
  const [mode, setMode]   = useState<"ikm" | "count">(defaultMode);
  const [drill, setDrill] = useState<DrillData | null>(null);

  const handleDrill = useCallback((item: ChartData) => {
    // Mock weekly trend — replace with real API data when available
    const trend: TrendPoint[] = Array.from({ length: 8 }, (_, i) => ({
      date:  `W${i + 1}`,
      count: Math.max(1, Math.round((item.value ?? 10) * (0.5 + Math.random() * 0.9))),
      ikm:   item.ikm > 0
        ? parseFloat((item.ikm * (0.88 + Math.random() * 0.24)).toFixed(1))
        : 0,
    }));
    setDrill({ label: item.name, trend, color: item.fill });
  }, []);

  return (
    <div className="flex flex-col h-full">

      {/* Toolbar */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0 border-b border-gray-100">
        {drill ? (
          <button
            onClick={() => setDrill(null)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Perbandingan Layanan
          </button>
        ) : (
          <div className="flex gap-1">
            {(["ikm", "count"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
                  mode === m ? "bg-[#132B4F] text-white" : "text-gray-400 hover:text-[#132B4F] hover:bg-gray-50"
                }`}>
                {m === "ikm"
                  ? <><BarChart3 className="w-3 h-3" />Nilai IKM</>
                  : <><TrendingUp className="w-3 h-3" />Responden</>}
              </button>
            ))}
          </div>
        )}

        {!drill ? (
          <div className="flex items-center gap-1.5 text-[9px] text-gray-300 font-medium">
            <MousePointerClick className="w-3 h-3" />
            Klik bar untuk lihat tren
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: drill.color }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 max-w-[200px] truncate">
              {drill.label}
            </span>
          </div>
        )}
      </div>

      {/* Chart canvas */}
      <div className="flex-1 px-4 py-3 min-h-0">
        {drill ? (
          <LineChartView drill={drill} />
        ) : data.length > 0 ? (
          <BarChartView data={data} onDrill={handleDrill} mode={mode} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <BarChart3 className="w-10 h-10 text-gray-200" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
          </div>
        )}
      </div>

      {/* Drill legend */}
      {drill && (
        <div className="px-5 pb-4 pt-1 flex items-center gap-5 shrink-0 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5" style={{ backgroundColor: drill.color }} />
            <span className="text-[9px] font-bold text-gray-400">Responden</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 border-t border-dashed border-yellow-400" />
            <span className="text-[9px] font-bold text-gray-400">IKM</span>
          </div>
        </div>
      )}
    </div>
  );
}