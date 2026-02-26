"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export default function QrSection({ token, label }: { token: string; label: string }) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState("");

  useEffect(() => {
    setSurveyUrl(`${window.location.origin}/enter?token=${token}`);
  }, [token]);

  // Draw QR with logo overlay onto any canvas
  const drawQrWithLogo = useCallback(async (
    canvas: HTMLCanvasElement,
    url: string,
    size: number
  ) => {
    // Generate QR with error correction H (30% recovery — needed for logo overlay)
    await QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#132B4F", light: "#ffffff" },
    });

    const ctx = canvas.getContext("2d")!;
    const centerX = size / 2;
    const centerY = size / 2;
    const overlaySize = Math.floor(size * 0.22); // 22% of QR size

    // White background behind logo
    ctx.fillStyle = "#ffffff";
    const padding = 6;
    ctx.fillRect(
      centerX - overlaySize / 2 - padding,
      centerY - overlaySize / 2 - padding,
      overlaySize + padding * 2,
      overlaySize + padding * 2
    );

    // Draw logo
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

  // Render preview QR on mount / url change
  useEffect(() => {
    if (!surveyUrl || !qrCanvasRef.current) return;
    drawQrWithLogo(qrCanvasRef.current, surveyUrl, 220);
  }, [surveyUrl, drawQrWithLogo]);

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

      // Top accent stripe (tricolor)
      ctx.fillStyle = "#FAE705";
      ctx.fillRect(0, 0, W / 3, 8);
      ctx.fillStyle = "#009CC5";
      ctx.fillRect(W / 3, 0, W / 3, 8);
      ctx.fillStyle = "#132B4F";
      ctx.fillRect((W / 3) * 2, 0, W / 3, 8);

      // BKPSDM Logo (top center)
      const logo = new window.Image();
      logo.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        logo.onload = () => resolve();
        logo.onerror = () => resolve();
        logo.src = "/logo-bkpsdm.png";
      });
      if (logo.complete && logo.naturalWidth > 0) {
        const logoH = 80;
        const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
        ctx.drawImage(logo, W / 2 - logoW / 2, 32, logoW, logoH);
      } else {
        ctx.fillStyle = "#132B4F";
        ctx.fillRect(W / 2 - 40, 32, 80, 80);
        ctx.fillStyle = "#FAE705";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BKPSDM", W / 2, 80);
      }

      // Agency name
      ctx.fillStyle = "#009CC5";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BADAN KEPEGAWAIAN DAN PENGEMBANGAN SDM", W / 2, 140);

      // Label
      ctx.fillStyle = "#132B4F";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(label.toUpperCase(), W / 2, 185);

      // Subtitle
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("SCAN UNTUK MENGISI SURVEI KEPUASAN MASYARAKAT", W / 2, 212);

      // QR Code with logo — render to temp canvas then copy
      const qrSize = 400;
      const qrCanvas = document.createElement("canvas");
      qrCanvas.width = qrSize;
      qrCanvas.height = qrSize;
      await drawQrWithLogo(qrCanvas, surveyUrl, qrSize);
      ctx.drawImage(qrCanvas, W / 2 - qrSize / 2, 235, qrSize, qrSize);

      // Divider
      ctx.strokeStyle = "#e5e7eb";
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 688);
      ctx.lineTo(W - 48, 688);
      ctx.stroke();
      ctx.setLineDash([]);

      // Token label
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ACCESS TOKEN", W / 2, 724);

      // Token value
      ctx.fillStyle = "#132B4F";
      ctx.font = "bold 42px monospace";
      ctx.fillText(token, W / 2, 790);

      // Bottom legal
      ctx.fillStyle = "#d1d5db";
      ctx.font = "12px sans-serif";
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
      <div className="bg-white border border-gray-200 overflow-hidden w-full max-w-sm mx-auto mb-6">
        {/* Tricolor top stripe */}
        <div className="h-1" style={{ background: "linear-gradient(to right, #FAE705 33%, #009CC5 33% 66%, #132B4F 66%)" }} />

        <div className="p-8">
          {/* BKPSDM Logo */}
          <div className="flex justify-center mb-3">
            <Image
              src="/logo-bkpsdm.png"
              alt="BKPSDM"
              width={80}
              height={60}
              className="object-contain h-14 w-auto"
            />
          </div>

          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-1">
            Badan Kepegawaian dan pengembangan sumber daya manusia
          </p>
          <h3 className="text-base font-black uppercase tracking-tight text-[#132B4F] mb-1">{label}</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">
            Scan untuk Isi Survei Kepuasan
          </p>

          {/* QR Canvas preview */}
          <div className="inline-block bg-white p-3 border border-gray-100">
            {surveyUrl ? (
              <canvas ref={qrCanvasRef} width={220} height={220} />
            ) : (
              <div className="w-[220px] h-[220px] bg-gray-100 animate-pulse" />
            )}
          </div>

          {/* Token */}
          <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.25em] mb-2">Access Token</p>
            <p className="text-2xl font-black font-mono tracking-widest text-[#132B4F]">{token}</p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={() => navigator.clipboard.writeText(surveyUrl)}
          className="flex-1 py-3.5 bg-[#F0F4F8] text-[#132B4F] font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors border border-gray-200"
        >
          Copy Link
        </button>
        <button
          onClick={downloadQr}
          disabled={downloading || !surveyUrl}
          className="flex-1 py-3.5 bg-[#132B4F] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#009CC5] transition-colors disabled:opacity-50"
        >
          {downloading ? "Menyimpan..." : "Download PNG"}
        </button>
      </div>
    </div>
  );
}