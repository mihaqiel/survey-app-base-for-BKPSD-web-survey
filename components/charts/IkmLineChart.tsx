"use client";

import { useEffect, useRef } from "react";

export interface TrendPoint {
  label: string;
  ikm: number;
  count?: number;
}

interface IkmLineChartProps {
  data: TrendPoint[];
  height?: number;
  color?: string;
  showArea?: boolean;
  multiLine?: { label: string; data: TrendPoint[]; color: string }[];
}

export default function IkmLineChart({
  data,
  height = 260,
  color = "#3b82f6",
  showArea = true,
  multiLine,
}: IkmLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let destroyed = false;

    import("chart.js").then((mod) => {
      if (destroyed) return;

      mod.Chart.register(
        mod.LineController,
        mod.LineElement,
        mod.PointElement,
        mod.CategoryScale,
        mod.LinearScale,
        mod.Tooltip,
        mod.Filler,
      );

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const datasets = multiLine
        ? multiLine.map((line) => ({
            label: line.label,
            data: line.data.map((d) => d.ikm),
            borderColor: line.color,
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: line.color,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            tension: 0.4,
            fill: false,
          }))
        : [
            {
              label: "IKM",
              data: data.map((d) => d.ikm),
              borderColor: color,
              backgroundColor: showArea ? color + "18" : "transparent",
              borderWidth: 2.5,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: "#fff",
              pointBorderColor: color,
              pointBorderWidth: 2.5,
              tension: 0.4,
              fill: showArea,
            },
          ];

      const labels = multiLine ? multiLine[0]?.data.map((d) => d.label) : data.map((d) => d.label);

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "line",
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800, easing: "easeOutQuart" },
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#fff",
              titleColor: "#0f172a",
              bodyColor: "#64748b",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              titleFont: { size: 11, weight: "bold" as const },
              bodyFont: { size: 12 },
              callbacks: {
                title: (items: any[]) => items[0]?.label ?? "",
                label: (item: any) => {
                  const val = Number(item.raw);
                  let tag = "";
                  if (val >= 88.31) tag = "Sangat Baik";
                  else if (val >= 76.61) tag = "Baik";
                  else if (val >= 65) tag = "Kurang Baik";
                  else if (val > 0) tag = "Tidak Baik";
                  return ` IKM: ${val.toFixed(2)}${tag ? "  —  " + tag : ""}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: {
                color: "#94a3b8",
                font: { size: 10 },
                maxRotation: 0,
              },
            },
            y: {
              grid: {
                color: "#f1f5f9",
                lineWidth: 1,
              },
              border: { display: false, dash: [4, 4] },
              ticks: {
                color: "#94a3b8",
                font: { size: 10 },
                maxTicksLimit: 5,
                callback: (val: any) => Number(val).toFixed(0),
              },
              min: 60,
              max: 100,
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
  }, [data, color, showArea, multiLine]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
