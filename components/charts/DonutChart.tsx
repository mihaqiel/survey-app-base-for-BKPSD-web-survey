"use client";

import { useEffect, useRef } from "react";

export interface DonutSlice {
  name: string;
  value: number;
  fill: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export default function DonutChart({
  data,
  height = 220,
  centerLabel = "Total",
  centerValue,
}: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  const displayCenter = centerValue ?? total;

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    let destroyed = false;

    import("chart.js").then((mod) => {
      if (destroyed) return;

      mod.Chart.register(
        mod.DoughnutController,
        mod.ArcElement,
        mod.Tooltip,
        mod.Legend,
      );

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "doughnut",
        data: {
          labels: data.map((d) => d.name),
          datasets: [
            {
              data: data.map((d) => d.value),
              backgroundColor: data.map((d) => d.fill),
              hoverBackgroundColor: data.map((d) => d.fill + "ee"),
              borderWidth: 3,
              borderColor: "#fff",
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          animation: { duration: 800, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#fff",
              titleColor: "#132B4F",
              bodyColor: "#64748b",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              titleFont: { size: 11, weight: "bold" as const },
              bodyFont: { size: 12 },
              callbacks: {
                label: (item: any) => {
                  const pct = total > 0 ? ((item.raw / total) * 100).toFixed(1) : 0;
                  return `  ${item.raw} layanan (${pct}%)`;
                },
              },
            },
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, total]);

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: height, height }}>
        <canvas ref={canvasRef} />
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-black text-[#132B4F] leading-none">{displayCenter}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{centerLabel}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3">
        {data.map((slice) => {
          const pct = total > 0 ? ((slice.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={slice.name} className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: slice.fill }}
              />
              <p className="text-[11px] font-bold text-[#132B4F] flex-1 leading-tight">{slice.name}</p>
              <span className="text-[10px] font-bold text-gray-400">{slice.value}</span>
              <span
                className="text-[10px] font-black w-10 text-right"
                style={{ color: slice.fill }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}