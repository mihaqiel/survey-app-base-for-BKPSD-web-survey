"use client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function DownloadReport({ title }: { title: string }) {
  const handleDownload = async () => {
    const element = document.getElementById("analysis-report");
    if (!element) return;

    // 🚀 Logic: Create a high-quality capture of the dashboard [cite: 2026-02-17]
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for professional printing
      useCORS: true,
      backgroundColor: "#000000", // Maintain your Command Center theme
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${title.replace(/\s+/g, "_")}_Report.pdf`);
  };

  return (
    <button 
      onClick={handleDownload}
      className="no-print bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(37,99,235,0.3)]"
    >
      Download Regional Report
    </button>
  );
}