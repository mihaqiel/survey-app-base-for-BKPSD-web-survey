"use client";

import { useState } from "react";

const WHITE      = "FFFFFFFF";
const YELLOW     = "FFFAE705";
const LIGHT_BLUE = "FFD6EAF8";
const NAVY_HDR   = "FF1F4E79";

interface Response {
  id: string;
  nama: string;
  tglLayanan?: Date | string | null;
  createdAt: Date | string;
  jenisKelamin: string;
  pendidikan: string;
  usia: number;
  pekerjaan: string;
  isDifabel?: string | null;
  jenisDisabilitas?: string | null;
  u1: number; u2: number; u3: number; u4: number; u5: number;
  u6: number; u7: number; u8: number; u9: number;
  saran?: string | null;
  pegawai?: { nama: string } | null;
}

interface Props {
  layananNama: string;
  periodLabel: string;
  responses: Response[];
}

export default function LayananExportButton({ layananNama, periodLabel, responses }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "BKPSDM Anambas";

      // ── SHEET 1: DATA ───────────────────────────────────────────────
      const wsData = wb.addWorksheet("Data");
      wsData.columns = [
        { header: "Silahkan Pilih Perangkat Daerah Yang Anda Terima Layanannya", key: "opd", width: 55 },
        { header: "Jenis Layanan Yang Anda Terima", key: "layanan", width: 35 },
        { header: "Tanggal Menerima Layanan", key: "tgl", width: 22 },
        { header: "Jenis Kelamin", key: "jk", width: 14 },
        { header: "Pendidikan Terakhir", key: "pend", width: 22 },
        { header: "Usia", key: "usia", width: 16 },
        { header: "Pekerjaan", key: "kerja", width: 18 },
        { header: "Apakah Anda merupakan penyandang disabilitas/pendamping penyandang disabilitas?", key: "difabel", width: 20 },
        { header: "Jika ya, jenis disabilitas apa yang Anda miliki/dampingi? (Jika tidak, lewati)", key: "jenisDifabel", width: 22 },
        { header: "Persyaratan", key: "u1", width: 14 },
        { header: "Prosedur", key: "u2", width: 12 },
        { header: "Jangka Waktu", key: "u3", width: 14 },
        { header: "Tarif", key: "u4", width: 10 },
        { header: "Produk", key: "u5", width: 12 },
        { header: "Kompetensi", key: "u6", width: 14 },
        { header: "Perilaku", key: "u7", width: 12 },
        { header: "Pengaduan", key: "u8", width: 12 },
        { header: "Sarpras", key: "u9", width: 12 },
      ];

      const dataHeaderRow = wsData.getRow(1);
      dataHeaderRow.height = 40;
      dataHeaderRow.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_HDR } };
        cell.font = { bold: true, color: { argb: WHITE }, size: 10, name: "Arial" };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: WHITE } },
          bottom: { style: "thin", color: { argb: WHITE } },
          left: { style: "thin", color: { argb: WHITE } },
          right: { style: "thin", color: { argb: WHITE } },
        };
      });

      responses.forEach((r, idx) => {
        const tgl = r.tglLayanan
          ? new Date(r.tglLayanan).toLocaleDateString("id-ID")
          : new Date(r.createdAt).toLocaleDateString("id-ID");
        const row = wsData.addRow([
          "Badan Kepegawaian dan Pengembangan Sumber Daya Manusia",
          layananNama, tgl,
          r.jenisKelamin, r.pendidikan, r.usia, r.pekerjaan,
          r.isDifabel ?? "Tidak", r.jenisDisabilitas ?? "-",
          r.u1, r.u2, r.u3, r.u4, r.u5, r.u6, r.u7, r.u8, r.u9,
        ]);
        const isEven = (idx % 2 === 0);
        row.eachCell(cell => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isEven ? LIGHT_BLUE : WHITE } };
          cell.font = { size: 10, name: "Arial" };
          cell.border = {
            top: { style: "hair", color: { argb: "FFBDC3C7" } },
            bottom: { style: "hair", color: { argb: "FFBDC3C7" } },
            left: { style: "hair", color: { argb: "FFBDC3C7" } },
            right: { style: "hair", color: { argb: "FFBDC3C7" } },
          };
        });
      });

      wsData.autoFilter = { from: "A1", to: "R1" };
      wsData.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

      // ── SHEET 2: REKAP ──────────────────────────────────────────────
      const wsRekap = wb.addWorksheet("Rekap");
      wsRekap.columns = [
        { key: "a", width: 35 }, { key: "b", width: 16 },
        { key: "c", width: 13 }, { key: "d", width: 13 },
        { key: "e", width: 13 }, { key: "f", width: 10 },
        { key: "g", width: 13 }, { key: "h", width: 13 },
        { key: "i", width: 12 }, { key: "j", width: 12 },
        { key: "k", width: 12 }, { key: "l", width: 22 },
        { key: "m", width: 10 }, { key: "n", width: 16 },
      ];

      const rekapHeader = wsRekap.addRow([
        "Jenis Layanan", "Total Responden",
        "Persyaratan", "Prosedur", "Jangka Waktu", "Tarif", "Produk",
        "Kompetensi", "Perilaku", "Pengaduan", "Sarpras",
        "IKM Per Jenis Layanan", "MUTU", "PREDIKAT",
      ]);
      rekapHeader.height = 36;
      rekapHeader.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_HDR } };
        cell.font = { bold: true, color: { argb: WHITE }, size: 10, name: "Arial" };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: WHITE } },
          bottom: { style: "thin", color: { argb: WHITE } },
          left: { style: "thin", color: { argb: WHITE } },
          right: { style: "thin", color: { argb: WHITE } },
        };
      });

      if (responses.length > 0) {
        const dataRow = wsRekap.addRow([
          layananNama,
          { formula: "COUNTIFS(Data!B:B,A2)" },
          { formula: "IFERROR((AVERAGEIFS(Data!J:J,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR((AVERAGEIFS(Data!K:K,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR((AVERAGEIFS(Data!L:L,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR((AVERAGEIFS(Data!M:M,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR((AVERAGEIFS(Data!N:N,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR((AVERAGEIFS(Data!O:O,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR((AVERAGEIFS(Data!P:P,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR((AVERAGEIFS(Data!Q:Q,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR((AVERAGEIFS(Data!R:R,Data!$B:$B,$A2))*25,0)" },
          { formula: "IFERROR(AVERAGE(C2:K2),0)" },
          { formula: 'IFERROR(IF(L2>=88.31,"A",IF(L2>=76.61,"B",IF(L2>=65,"C","D"))),"-")' },
          { formula: 'IFERROR(IF(L2>=88.31,"Sangat Baik",IF(L2>=76.61,"Baik",IF(L2>=65,"Kurang Baik","Tidak Baik"))),"-")' },
        ]);
        dataRow.eachCell(cell => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_BLUE } };
          cell.font = { size: 10, name: "Arial" };
          cell.alignment = { horizontal: "center" };
          cell.numFmt = '#,##0.00';
          cell.border = {
            top: { style: "hair", color: { argb: "FFBDC3C7" } },
            bottom: { style: "hair", color: { argb: "FFBDC3C7" } },
            left: { style: "hair", color: { argb: "FFBDC3C7" } },
            right: { style: "hair", color: { argb: "FFBDC3C7" } },
          };
        });
        dataRow.getCell(1).alignment = { horizontal: "left" };
        dataRow.getCell(12).font = { bold: true, size: 10, name: "Arial" };
        dataRow.getCell(13).font = { bold: true, size: 10, name: "Arial" };
        dataRow.getCell(14).font = { bold: true, size: 10, name: "Arial" };
      }

      // Summary rows — yellow
      const summaryDefs = [
        ["Rerata IKM Per Unsur", "", { formula: "IFERROR(AVERAGE(C2:C2),0)" }, { formula: "IFERROR(AVERAGE(D2:D2),0)" }, { formula: "IFERROR(AVERAGE(E2:E2),0)" }, { formula: "IFERROR(AVERAGE(F2:F2),0)" }, { formula: "IFERROR(AVERAGE(G2:G2),0)" }, { formula: "IFERROR(AVERAGE(H2:H2),0)" }, { formula: "IFERROR(AVERAGE(I2:I2),0)" }, { formula: "IFERROR(AVERAGE(J2:J2),0)" }, { formula: "IFERROR(AVERAGE(K2:K2),0)" }, { formula: "IFERROR(AVERAGE(L2:L2),0)" }, "", ""],
        ["IKM Unit Layanan", "", { formula: "IFERROR(AVERAGE(C3:K3),0)" }, "", "", "", "", "", "", "", "", "", "", ""],
        ["Mutu Unit Layanan", "", { formula: 'IFERROR(IF(C4>=88.31,"A",IF(C4>=76.61,"B",IF(C4>=65,"C","D"))),"-")' }, "", "", "", "", "", "", "", "", "", "", ""],
        ["Predikat", "", { formula: 'IFERROR(IF(C4>=88.31,"Sangat Baik",IF(C4>=76.61,"Baik",IF(C4>=65,"Kurang Baik","Tidak Baik"))),"-")' }, "", "", "", "", "", "", "", "", "", "", ""],
      ];

      summaryDefs.forEach(rowData => {
        const sumRow = wsRekap.addRow(rowData);
        sumRow.height = 20;
        sumRow.eachCell(cell => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: YELLOW } };
          cell.font = { bold: true, size: 10, name: "Arial", color: { argb: "FF000000" } };
          cell.alignment = { horizontal: "center" };
          cell.numFmt = '#,##0.00';
          cell.border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        });
        sumRow.getCell(1).alignment = { horizontal: "left" };
      });

      wsRekap.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = layananNama.replace(/[:\/\\?*\[\]\s]/g, "_").substring(0, 40);
      link.download = `SKM_${safeName}_${periodLabel.replace(/\s/g, "_")}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal menghasilkan laporan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 hover:opacity-90"
      style={{ backgroundColor: "#132B4F" }}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {loading ? "Generating..." : "Export Excel"}
    </button>
  );
}