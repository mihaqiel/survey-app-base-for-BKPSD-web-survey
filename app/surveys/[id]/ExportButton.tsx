"use client";
import * as XLSX from "xlsx-js-style";

export default function ExportButton({ survey }: { survey: any }) {
  const downloadExcel = () => {
    // 🎨 Score Mapping: Aligns Excel colors with your UI badges
    const labels: Record<string, { text: string; color: string }> = {
      "5": { text: "Excellent", color: "C6EFCE" }, // Green
      "4": { text: "Very Good", color: "DDEBF7" }, // Cyan/Blue
      "3": { text: "Good", color: "FFF2CC" },    // Yellow
      "2": { text: "Fair", color: "FCE4D6" },    // Orange
      "1": { text: "Poor", color: "FFC7CE" }     // Red
    };

    // 1. Prepare Header Row
    const headerRow = [
      "Date Submitted",
      ...survey.questions.map((q: any) => q.text),
      "KPI Mean",
      "Global Index (%)"
    ];

    // 2. Map Data with Style
    const dataRows = survey.responses.map((resp: any) => {
      const row: any[] = [new Date(resp.createdAt).toLocaleDateString()];

      survey.questions.forEach((q: any) => {
        const answer = resp.answers.find((a: any) => a.questionId === q.id);
        const val = answer?.value || answer?.content || "-";
        
        // If it's a score, apply the specific color and "Excellent (5)" format
        if (q.type === "SCORE" && labels[val]) {
          row.push({
            v: `${labels[val].text} (${val})`,
            s: {
              fill: { fgColor: { rgb: labels[val].color } },
              font: { bold: true, sz: 10 },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } }
              }
            }
          });
        } else {
          row.push(val);
        }
      });

      // Add the final system math
      row.push(resp.primaryScore.toFixed(2));
      row.push(`${Math.round(resp.globalScore)}%`); // Round to avoid long decimals
      return row;
    });

    // 3. Build Worksheet
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

    // 4. Auto-Width: Prevents the "cut-off" headers seen in your test
    ws["!cols"] = headerRow.map((h, i) => ({
      wch: Math.max(h.length + 5, 15) // Dynamic width based on text length
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Surgical Analysis");

    // 5. Save File
    XLSX.writeFile(wb, `${survey.title.replace(/\s+/g, "_")}_Surgical_Report.xlsx`);
  };

  return (
    <button 
      onClick={downloadExcel}
      className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all italic border-b-4 border-green-800 active:scale-95 shadow-lg shadow-green-900/20 flex items-center gap-2"
    >
      <span className="text-sm">↓</span> Export Surgical Excel
    </button>
  );
}