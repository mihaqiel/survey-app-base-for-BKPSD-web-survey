"use client";

import { useEffect, useRef, useState } from "react";

export interface ChartData {
  name: string;
  ikm: number;
  value?: number;
  fill: string;
}

export default function DashboardCharts({ data }: { data: ChartData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const [hovered, setHovered] = useState<ChartData | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    let Chart: any;
    import("chart.js").then((mod) => {
      Chart = mod.Chart;
      mod.Chart.register(
        mod.DoughnutController, // ← add this line
        mod.ArcElement,
        mod.Tooltip,
        mod.Legend,
      );

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const pieData = data.map((d) => d.value ?? d.ikm);
      const total = pieData.reduce((a, b) => a + b, 0);

      chartRef.current = new Chart(canvasRef.current!, {
        type: "doughnut",
        data: {
          labels: data.map((d) => d.name),
          datasets: [
            {
              data: pieData,
              backgroundColor: data.map((d) => d.fill),
              borderColor: "#ffffff",
              borderWidth: 2,
              hoverBorderWidth: 3,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          animation: {
            animateRotate: true,
            duration: 700,
            easing: "easeOutQuart",
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          onHover: (_: any, elements: any[]) => {
            if (elements.length > 0) {
              const i = elements[0].index;
              setHovered(data[i]);
              setActiveIdx(i);
            } else {
              setHovered(null);
              setActiveIdx(null);
            }
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  const total = data.reduce((s, d) => s + (d.value ?? d.ikm), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Donut + center label */}
      <div className="flex-1 relative min-h-0" style={{ minHeight: 160 }}>
        <canvas ref={canvasRef} />
        {/* Center overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hovered ? (
            <div className="text-center px-2 animate-fade-in">
              <p
                className="text-xl font-black leading-none"
                style={{ color: hovered.fill }}
              >
                {hovered.ikm > 0 ? hovered.ikm : hovered.value}
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-0.5 max-w-[80px] leading-tight text-center">
                {hovered.name.length > 14
                  ? hovered.name.substring(0, 14) + "…"
                  : hovered.name}
              </p>
            </div>
          ) : (
            <div className="text-center animate-fade-in">
              <p className="text-lg font-black text-[#132B4F] leading-none">
                {total}
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                Total
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom legend */}
      <div
        className="px-4 pb-3 space-y-1 overflow-y-auto"
        style={{ maxHeight: 110 }}
      >
        {data.map((entry, i) => {
          const pct =
            total > 0
              ? Math.round(((entry.value ?? entry.ikm) / total) * 100)
              : 0;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-2 py-1 transition-all duration-150 cursor-default ${
                activeIdx === i ? "bg-gray-50 rounded" : ""
              }`}
              onMouseEnter={() => {
                setHovered(entry);
                setActiveIdx(i);
              }}
              onMouseLeave={() => {
                setHovered(null);
                setActiveIdx(null);
              }}
            >
              {/* Color swatch */}
              <div
                className="w-2 h-2 shrink-0 rounded-sm"
                style={{ backgroundColor: entry.fill }}
              />
              {/* Name */}
              <span className="text-[10px] font-bold text-gray-500 truncate flex-1 leading-tight">
                {entry.name}
              </span>
              {/* Percentage bar */}
              <div className="w-12 h-1 bg-gray-100 overflow-hidden rounded-full shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: entry.fill }}
                />
              </div>
              {/* Value */}
              <span
                className="text-[10px] font-black tabular-nums shrink-0 w-8 text-right"
                style={{ color: entry.fill }}
              >
                {entry.ikm > 0 ? entry.ikm : entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
