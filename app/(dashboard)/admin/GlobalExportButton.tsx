"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { getGlobalExportData } from "@/app/action/admin";

export default function GlobalExportButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // 1. Fetch Data
      const result = await getGlobalExportData();
      if (!result) {
        alert("No active period found.");
        return;
      }

      const { periodLabel, data } = result;
      const wb = XLSX.utils.book_new();

      // 2. Loop through each Service and create a Sheet
      data.forEach(service => {
        // A. Define Sheet Data
        const sheetData = [];

        // Title Row
        sheetData.push([`LAPORAN SKM: ${service.serviceName.toUpperCase()}`]);
        sheetData.push([`Periode: ${periodLabel}`]);
        sheetData.push([]); // Empty row

        if (service.totalRespondents === 0) {
          sheetData.push(["BELUM ADA DATA RESPONDEN UNTUK LAYANAN INI"]);
        } else {
          // Summary Section
          sheetData.push(["RINGKASAN KINERJA"]);
          sheetData.push(["Total Responden", service.totalRespondents]);
          sheetData.push(["Nilai IKM", service.ikm]);
          sheetData.push(["Mutu Pelayanan", Number(service.ikm) > 88.3 ? "A (Sangat Baik)" : "B (Baik)"]);
          sheetData.push([]);

          // Demographics Section
          sheetData.push(["PROFIL RESPONDEN"]);
          sheetData.push(["Laki-laki", service.demographics.gender.L]);
          sheetData.push(["Perempuan", service.demographics.gender.P]);
          sheetData.push([]);

          // Scores Per Unsur
          sheetData.push(["RATA-RATA PER UNSUR (U1-U9)"]);
          const unsurLabels = ["U1 (Syarat)", "U2 (Prosedur)", "U3 (Waktu)", "U4 (Biaya)", "U5 (Produk)", "U6 (Kompetensi)", "U7 (Perilaku)", "U8 (Maklumat)", "U9 (Sarana)"];
          sheetData.push(unsurLabels);
          sheetData.push(service.averagePerUnsur);
          sheetData.push([]);

          // Detail Table Header
          sheetData.push(["DATA DETIL RESPONDEN"]);
          sheetData.push(["No", "Tanggal", "Nama", "Umur", "JK", "Pendidikan", "Pekerjaan", "Pegawai Dilayanai", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9", "Saran"]);

          // Detail Rows
          service.rawResponses.forEach(r => {
            sheetData.push([
              r.No, r.Tanggal, r.Nama, r.Umur, r.JK, r.Pendidikan, r.Pekerjaan, r.Pegawai,
              r.U1, r.U2, r.U3, r.U4, r.U5, r.U6, r.U7, r.U8, r.U9, r.Saran
            ]);
          });
        }

        // B. Create Sheet
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        
        // C. Clean Sheet Name (Max 31 chars, no special chars)
        const safeName = service.serviceName.replace(/[:\/\\?*\[\]]/g, "").substring(0, 30);
        XLSX.utils.book_append_sheet(wb, ws, safeName);
      });

      // 3. Download File
      const filename = `Laporan_SKM_Lengkap_${periodLabel.replace(/\s/g, "_")}.xlsx`;
      XLSX.writeFile(wb, filename);

    } catch (error) {
      console.error(error);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-500 shadow-xl shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <span>Generating...</span>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Download Laporan Lengkap (XLSX)
        </>
      )}
    </button>
  );
}