"use client";

import * as XLSX from "xlsx-js-style";

interface ExportButtonProps {
  data: any[];
  periodLabel: string;
  agencyName: string;
  serviceName: string;
}

export default function ExportButton({ data, periodLabel, agencyName, serviceName }: ExportButtonProps) {
  
  const handleDownload = () => {
    // 1. 📊 HEADER INFORMATION
    const headers = [
      [`PEMERINTAH DAERAH`],
      [agencyName.toUpperCase()],
      [`LAPORAN SURVEI KEPUASAN MASYARAKAT`],
      [`LAYANAN: ${serviceName.toUpperCase()}`],
      [`PERIODE: ${periodLabel}`],
      [""], // Spacer
    ];

    // 2. 📋 TABLE COLUMNS (Standard SKM)
    const tableHead = [
      "No", "Tanggal", 
      "U1 (Syarat)", "U2 (Prosedur)", "U3 (Waktu)", 
      "U4 (Biaya)", "U5 (Produk)", "U6 (Kompetensi)", 
      "U7 (Perilaku)", "U8 (Penanganan)", "U9 (Sarana)", 
      "Saran / Masukan"
    ];

    // 3. 📝 DATA MAPPING
    const tableBody = data.map((res: any, index: number) => [
      index + 1,
      new Date(res.createdAt).toLocaleDateString("id-ID"),
      res.u1, res.u2, res.u3, res.u4, res.u5, res.u6, res.u7, res.u8, res.u9,
      res.saran || "-"
    ]);

    // 4. 🎨 CREATE WORKBOOK
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...headers, tableHead, ...tableBody]);

    // 5. 💅 STYLING (Column Widths)
    ws["!cols"] = [
      { wch: 5 },  { wch: 15 }, 
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
      { wch: 50 } // Wide column for Saran
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Rekap SKM");
    
    // 6. 💾 DOWNLOAD
    const safeName = `${serviceName}_${periodLabel}`.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `Laporan_SKM_${safeName}.xlsx`);
  };

  return (
    <button 
      onClick={handleDownload}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-green-900/20 active:scale-95"
    >
      <span>↓</span> Download Excel Rekap
    </button>
  );
}