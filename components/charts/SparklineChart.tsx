"use client";

import { useEffect, useRef } from "react";

export interface SparkLine {
  label: string;
  data: number[];
  color: string;
}

interface SparklineChartProps {
  lines: SparkLine[];
  xLabels: string[];
  height?: number;
}

export default function SparklineChart({ lines, xLabels, height = 160 }: SparklineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || lines.length === 0) return;
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
      );

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      chartRef.current = new mod.Chart(canvasRef.current!, {
        type: "line",
        data: {
          labels: xLabels,
          datasets: lines.map((line) => ({
            label: line.label,
            data: line.data,
            borderColor: line.color,
            backgroundColor: "transparent",
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: line.color,
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 1.5,
            tension: 0.4,
            fill: false,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#fff",
              titleColor: "#132B4F",
              bodyColor: "#64748b",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 8,
              cornerRadius: 6,
              titleFont: { size: 10, weight: "bold" as const },
              bodyFont: { size: 11 },
              callbacks: {
                label: (item: any) =>
                  ` ${item.dataset.label}: ${Number(item.raw).toFixed(1)}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: "#cbd5e1", font: { size: 8 }, maxRotation: 0 },
            },
            y: {
              grid: { color: "#f8fafc" },
              border: { display: false },
              ticks: {
                color: "#cbd5e1",
                font: { size: 8 },
                maxTicksLimit: 4,
                callback: (v: any) => Number(v).toFixed(0),
              },
              min: 50,
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
  }, [lines, xLabels]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}