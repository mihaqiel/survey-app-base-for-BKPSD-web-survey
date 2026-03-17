"use client";

import { useEffect, useRef } from "react";

export interface UnsurBar {
  label: string;
  shortLabel: string;
  value: number; // 1-4 scale
  ikm: number;   // 0-100 scale
}

interface UnsurBarChartProps {
  data: UnsurBar[];
  height?: number;
  title?: string;
  color?: string;
}

export default function UnsurBarChart({
  data,
  height = 130,
  color = "#3b82f6",
}: UnsurBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    let destroyed = false;

    import("chart.js").then((mod) => {
      if (destroyed) return;

      mod.Chart.register(
        mod.BarController,
        mod.BarElement,
        mod.CategoryScale,
        mod.LinearScale,
        mod.Tooltip,
      );

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const ikmColor = (ikm: number) => {
        if (ikm >= 88.31) return "#16a34a";
        if (ikm >= 76.61) return "#3b82f6";
        if (ikm >= 65) return "#d97706";
        if (ikm > 0) return "#dc2626";
        return "#94a3b8";
      };

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "bar",
        data: {
          labels: data.map((d) => d.shortLabel),
          datasets: [
            {
              data: data.map((d) => d.value),
              backgroundColor: data.map((d) => ikmColor(d.ikm) + "cc"),
              hoverBackgroundColor: data.map((d) => ikmColor(d.ikm)),
              borderWidth: 0,
              borderRadius: 3,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#fff",
              titleColor: "#0f172a",
              bodyColor: "#64748b",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              titleFont: { size: 11, weight: "bold" as const },
              callbacks: {
                title: (items: any[]) => data[items[0].dataIndex]?.label ?? "",
                label: (item: any) => {
                  const d = data[item.dataIndex];
                  return ` Nilai: ${d.value.toFixed(2)}  |  IKM: ${d.ikm.toFixed(1)}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: "#94a3b8", font: { size: 9 } },
            },
            y: {
              grid: { color: "#f8fafc", lineWidth: 1 },
              border: { display: false },
              ticks: {
                color: "#94a3b8",
                font: { size: 9 },
                maxTicksLimit: 4,
                callback: (v: any) => Number(v).toFixed(1),
              },
              min: 0,
              max: 4,
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
  }, [data, color]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
