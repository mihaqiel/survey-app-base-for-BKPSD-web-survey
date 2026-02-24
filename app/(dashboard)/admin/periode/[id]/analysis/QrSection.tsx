"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useRef, useEffect } from "react";

interface QrProps {
  token: string;
  label: string;
  serviceName: string;
}

export default function QrSection({ token, label, serviceName }: QrProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Generate the Gatekeeper URL
      setUrl(`${window.location.origin}/enter?token=${token}`);
    }
  }, [token]);

  // 🛡️ ROBUST COPY FUNCTION (Works on HTTP & HTTPS)
  const handleCopy = async () => {
    if (!url) return;

    // 1. Try Modern API (HTTPS / Localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.warn("Clipboard API failed, switching to fallback...");
      }
    }

    // 2. Fallback for HTTP / Older Browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      
      // Ensure it's not visible
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert("Could not copy automatically. Please copy the URL manually.");
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
      alert("Browser blocked copy. Please copy manually.");
    }
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 1200;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 1000, 1000);
        
        // Add Text Branding
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(serviceName.toUpperCase(), 600, 1100);
        ctx.fillText(`TOKEN: ${token}`, 600, 1150);
        
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `QR_${token}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (!url) return null;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-between text-center h-full">
      <div className="mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Access Token</h3>
        <p className="text-xl font-black font-mono tracking-widest text-blue-600">{token}</p>
      </div>
      
      <div ref={qrRef} className="bg-white p-4 rounded-3xl border-2 border-black mb-6">
        <QRCodeSVG value={url} size={160} level="H" includeMargin={true} />
      </div>

      <div className="w-full space-y-2 mt-auto">
        <button onClick={handleCopy} className="w-full py-3 bg-gray-100 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors">
          {copied ? "✅ Copied!" : "Copy Link"}
        </button>
        <button onClick={handleDownload} className="w-full py-3 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-colors">
          Download PNG
        </button>
      </div>
    </div>
  );
}