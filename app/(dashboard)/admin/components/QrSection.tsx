"use client";

import { useRef, useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function QrSection({ token, label }: { token: string; label: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState("");

  useEffect(() => {
    setSurveyUrl(`${window.location.origin}/enter?token=${token}`);
  }, [token]);

  const downloadQr = async () => {
    if (!surveyUrl) return;
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const W = 768;
      const H = 1050;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // BK logo box
      ctx.fillStyle = "#000000";
      roundRect(ctx, W / 2 - 36, 48, 72, 72, 14);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BK", W / 2, 48 + 44);

      // Label
      ctx.fillStyle = "#000000";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label.toUpperCase(), W / 2, 175);

      // Subtitle
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("SCAN TO START SURVEY", W / 2, 205);

      // Draw QR from SVG
      const svgEl = svgRef.current?.querySelector("svg");
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, W / 2 - 200, 230, 400, 400);
            URL.revokeObjectURL(svgUrl);
            resolve();
          };
          img.src = svgUrl;
        });
      }

      // Divider
      ctx.strokeStyle = "#e5e7eb";
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 680);
      ctx.lineTo(W - 48, 680);
      ctx.stroke();
      ctx.setLineDash([]);

      // Access Token label
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ACCESS TOKEN", W / 2, 720);

      // Token value
      ctx.fillStyle = "#000000";
      ctx.font = "bold 42px monospace";
      ctx.fillText(token, W / 2, 790);

      // Download
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-${label.replace(/\s+/g, "-")}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to download QR", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">

      {/* QR CARD (display only) */}
      <div ref={qrRef} className="p-8 bg-white rounded-[2rem] border border-gray-100 mb-6 w-full max-w-sm mx-auto">
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-black text-xs">BK</div>
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-black">{label}</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">Scan to Start Survey</p>

        <div ref={svgRef} className="bg-white p-4 rounded-xl inline-block">
          {surveyUrl ? (
            <QRCode
              value={surveyUrl}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg animate-pulse" />
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Access Token</p>
          <p className="text-3xl font-black font-mono mt-2 tracking-widest text-black">{token}</p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 w-full max-w-sm">
        <button
          onClick={() => navigator.clipboard.writeText(surveyUrl)}
          className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
        >
          Copy Link
        </button>
        <button
          onClick={downloadQr}
          disabled={downloading || !surveyUrl}
          className="flex-1 py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {downloading ? "Saving..." : "Download PNG"}
        </button>
      </div>
    </div>
  );
}

// Helper to draw rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}