"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { Check, Copy, Download, Loader2 } from "lucide-react";

export default function QrSection({ token, label }: { token: string; label: string }) {
  const qrCanvasRef                   = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [surveyUrl, setSurveyUrl]     = useState("");

  useEffect(() => {
    setSurveyUrl(`${window.location.origin}/enter?token=${token}`);
  }, [token]);

  const drawQrWithLogo = useCallback(async (canvas: HTMLCanvasElement, url: string, size: number) => {
    await QRCode.toCanvas(canvas, url, {
      width: size, margin: 1, errorCorrectionLevel: "H",
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    const ctx = canvas.getContext("2d")!;
    const centerX = size / 2;
    const centerY = size / 2;
    const overlaySize = Math.floor(size * 0.22);

    ctx.fillStyle = "#ffffff";
    const padding = 6;
    ctx.fillRect(centerX - overlaySize / 2 - padding, centerY - overlaySize / 2 - padding, overlaySize + padding * 2, overlaySize + padding * 2);

    const logo = new window.Image();
    logo.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      logo.onload = () => resolve();
      logo.onerror = () => resolve();
      logo.src = "/logo-bkpsdm.png";
    });

    if (logo.complete && logo.naturalWidth > 0) {
      const oW = (logo.naturalWidth / logo.naturalHeight) * overlaySize;
      ctx.drawImage(logo, centerX - oW / 2, centerY - overlaySize / 2, oW, overlaySize);
    }
  }, []);

  useEffect(() => {
    if (!surveyUrl || !qrCanvasRef.current) return;
    drawQrWithLogo(qrCanvasRef.current, surveyUrl, 220);
  }, [surveyUrl, drawQrWithLogo]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(surveyUrl);
      } else {
        const el = document.createElement("textarea");
        el.value = surveyUrl;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const downloadQr = async () => {
    if (!surveyUrl) return;
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const W = 768; const H = 1050;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Subtle top bar
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, 6);

      const logo = new window.Image();
      logo.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        logo.onload = () => resolve(); logo.onerror = () => resolve(); logo.src = "/logo-bkpsdm.png";
      });
      if (logo.complete && logo.naturalWidth > 0) {
        const logoH = 80; const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
        ctx.drawImage(logo, W / 2 - logoW / 2, 32, logoW, logoH);
      } else {
        ctx.fillStyle = "#0f172a"; ctx.fillRect(W / 2 - 40, 32, 80, 80);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("BKPSDM", W / 2, 80);
      }

      ctx.fillStyle = "#3b82f6"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("BADAN KEPEGAWAIAN DAN PENGEMBANGAN SDM", W / 2, 140);
      ctx.fillStyle = "#0f172a"; ctx.font = "bold 32px sans-serif";
      ctx.fillText(label.toUpperCase(), W / 2, 185);
      ctx.fillStyle = "#9ca3af"; ctx.font = "bold 13px sans-serif";
      ctx.fillText("SCAN UNTUK MENGISI SURVEI KEPUASAN MASYARAKAT", W / 2, 212);

      const qrSize = 400;
      const qrCanvas = document.createElement("canvas");
      qrCanvas.width = qrSize; qrCanvas.height = qrSize;
      await drawQrWithLogo(qrCanvas, surveyUrl, qrSize);
      ctx.drawImage(qrCanvas, W / 2 - qrSize / 2, 235, qrSize, qrSize);

      ctx.strokeStyle = "#e5e7eb"; ctx.setLineDash([8, 6]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(48, 688); ctx.lineTo(W - 48, 688); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#9ca3af"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("ACCESS TOKEN", W / 2, 724);
      ctx.fillStyle = "#0f172a"; ctx.font = "bold 42px monospace";
      ctx.fillText(token, W / 2, 790);
      ctx.fillStyle = "#d1d5db"; ctx.font = "12px sans-serif";
      ctx.fillText("Permenpan RB No. 14 Tahun 2017 · Kab. Kepulauan Anambas", W / 2, 840);

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
    <div className="p-8 flex flex-col items-center text-center">

      {/* QR DISPLAY CARD */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden w-full max-w-sm mx-auto mb-6">
        <div className="p-8">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo-bkpsdm.png" alt="BKPSDM" width={80} height={60}
              className="object-contain h-14 w-auto"
            />
          </div>

          <p className="text-xs font-semibold text-blue-600 mb-1">
            Badan Kepegawaian dan Pengembangan SDM
          </p>
          <h3 className="text-base font-bold text-slate-900 mb-1">{label}</h3>
          <p className="text-xs text-slate-400 mb-6">Scan untuk Isi Survei Kepuasan</p>

          {/* QR Canvas */}
          <div className="inline-block bg-white p-3 border border-gray-100 rounded-lg">
            {surveyUrl ? (
              <canvas ref={qrCanvasRef} width={220} height={220} />
            ) : (
              <div className="w-[220px] h-[220px] bg-gray-100 rounded animate-pulse" />
            )}
          </div>

          {/* Token */}
          <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
            <p className="text-xs text-slate-400 mb-2">Access Token</p>
            <p className="text-2xl font-bold font-mono tracking-widest text-slate-900">{token}</p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 w-full max-w-sm">
        <button onClick={handleCopy}
          className={`flex-1 py-3 font-semibold text-xs rounded-lg transition-all duration-200 border flex items-center justify-center gap-1.5 ${
            copied
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-50 border-gray-200 text-slate-700 hover:bg-gray-100"
          }`}>
          {copied ? (
            <><Check className="w-3.5 h-3.5" />Tersalin!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" />Copy Link</>
          )}
        </button>

        <button onClick={downloadQr} disabled={downloading || !surveyUrl}
          className="flex-1 py-3 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
          {downloading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Menyimpan...</>
          ) : (
            <><Download className="w-3.5 h-3.5" />Download PNG</>
          )}
        </button>
      </div>
    </div>
  );
}
