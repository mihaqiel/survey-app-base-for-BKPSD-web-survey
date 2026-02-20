"use client";
import * as XLSX from "xlsx";

export function DownloadReport({ title, survey }: { title: string, survey: any }) {
  const handleExportExcel = () => {
    if (!survey) return;

    // 🎨 Label Mapping for Surgical Clarity
    const labels: Record<string, string> = {
      "5": "Excellent",
      "4": "Very Good",
      "3": "Good",
      "2": "Fair",
      "1": "Poor"
    };

    const dataToExport = survey.responses.map((resp: any) => {
      const row: any = {
        "Submission Date": new Date(resp.createdAt).toLocaleDateString(),
      };

      // ✅ Map individual question scores with labels
      survey.questions.forEach((q: any) => {
        const answer = resp.answers.find((a: any) => a.questionId === q.id);
        const val = answer?.value || answer?.content || "-";
        
        row[q.text] = q.type === "SCORE" && labels[val] 
          ? `${labels[val]} (${val})` 
          : val;
      });

      // ✅ Include your "Perfect Mean" and Index math
      row["Mean Score"] = resp.primaryScore.toFixed(2);
      row["Index (%)"] = `${resp.globalScore}%`;
      return row;
    });

    // Generate and Download Workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Regional Analysis");

    XLSX.writeFile(workbook, `${title.replace(/\s+/g, "_")}_Results.xlsx`);
  };

  return (
    <button 
      onClick={handleExportExcel}
      className="no-print bg-green-600 hover:bg-green-500 text-white font-black py-4 px-8 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(34,197,94,0.3)] border-b-4 border-green-800 italic"
    >
      ↓ Export to Excel
    </button>
  );
}