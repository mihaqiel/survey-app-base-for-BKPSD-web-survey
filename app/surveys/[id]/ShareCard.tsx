"use client";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

export default function ShareCard({ surveyId }: { surveyId: string }) {
  // Use state to ensure this only runs in the browser (avoids hydration errors)
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/fill/${surveyId}`);
    }
  }, [surveyId]);

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white text-black p-6 rounded-2xl shadow-xl flex flex-col items-center text-center h-full">
      <h3 className="font-bold text-lg mb-4">Scan to Fill Survey</h3>
      
      {/* QR CODE - Only render if we have a URL */}
      <div className="bg-white p-2 rounded-lg border-2 border-black mb-4">
        {shareUrl ? <QRCode value={shareUrl} size={120} /> : <div className="w-[120] h-[120] bg-gray-200 animate-pulse" />}
      </div>

      <p className="text-xs text-gray-500 mb-3 break-all px-4 font-mono">
        {shareUrl || "Loading link..."}
      </p>

      <button 
        onClick={copyToClipboard}
        className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition w-full"
      >
        Copy Link
      </button>
    </div>
  );
}