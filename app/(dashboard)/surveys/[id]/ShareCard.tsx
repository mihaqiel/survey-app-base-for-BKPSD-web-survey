"use client";
import QRCode from "react-qr-code";
import { useEffect, useState, useRef } from "react";

export default function ShareCard({ surveyId }: { surveyId: string }) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null); // Targets the QR for the "Surgical" capture

  useEffect(() => {
    if (typeof window !== "undefined") {
      // ✅ CHANGED: Replaced '/fill/' with '/assessment/' to match your new route group structure
      setShareUrl(`${window.location.origin}/assessment/${surveyId}`);
    }
  }, [surveyId]);

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 1000; // High resolution for professional printing
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "white"; // Solid background for scanners
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 900, 900);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `Regional_Portal_QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="bg-white text-black p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center h-full">
      <div className="mb-6">
        <h3 className="font-black uppercase text-[10px] tracking-[0.3em] text-gray-400 mb-1">Regional Access Portal</h3>
        <p className="text-[11px] font-bold italic uppercase tracking-tighter text-black">Scan to Fill Assessment</p>
      </div>
      
      <div ref={qrRef} className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 mb-6">
        {shareUrl ? (
          <QRCode value={shareUrl} size={160} level="H" />
        ) : (
          <div className="w-[160px] h-[160px] bg-gray-100 animate-pulse rounded-xl" />
        )}
      </div>

      <div className="w-full space-y-3">
        <button 
          onClick={copyToClipboard}
          className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-[0.98] ${
            copied ? "bg-green-600 text-white" : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {copied ? "Link Copied" : "Copy Portal Link"}
        </button>

        <button 
          onClick={downloadQRCode}
          className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-2 border-black text-black hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          Download QR Image
        </button>
      </div>
    </div>
  );
}