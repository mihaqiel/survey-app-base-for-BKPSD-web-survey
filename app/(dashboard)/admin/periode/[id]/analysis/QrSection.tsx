"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useRef, useEffect } from "react";

export default function QrSection({ periodeId, label, serviceName }: { periodeId: string, label: string, serviceName: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  // 1. 🌍 GET ORIGIN SAFELY (Client-side)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/assessment/${periodeId}`);
    }
  }, [periodeId]);

  // 2. 📋 COPY LINK
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 3. 💾 DOWNLOAD IMAGE
  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Convert SVG to String
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // High Res Canvas
      canvas.width = 1200;
      canvas.height = 1200;
      if (ctx) {
        // White Background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR
        ctx.drawImage(img, 100, 100, 1000, 1000);
        
        // Add Text (Service Name)
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(serviceName.toUpperCase(), 600, 1150);
        
        // Add Period Label
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "gray";
        ctx.fillText(label.toUpperCase(), 600, 50);

        // Download
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${serviceName.replace(/\s+/g, "_")}_${label.replace(/\s+/g, "_")}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;
  };

  if (!url) return null;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-between text-center h-full">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Scan to Assess</h3>
      
      {/* QR CONTAINER */}
      <div ref={qrRef} className="bg-white p-4 rounded-3xl border-2 border-black mb-6">
        <QRCodeSVG 
          value={url} 
          size={160} 
          level="H" 
          includeMargin={true}
        />
      </div>

      <div className="w-full space-y-2 mt-auto">
        <button 
          onClick={handleCopy} 
          className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${copied ? "bg-green-500 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`}
        >
          {copied ? "Link Copied!" : "Copy Link"}
        </button>
        <button 
          onClick={handleDownload} 
          className="w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border border-black bg-black text-white hover:bg-gray-800 transition-all active:scale-95"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}