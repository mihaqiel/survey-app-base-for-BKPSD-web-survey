"use client";

export default function ExportButton({ survey }: { survey: any }) {
  
  const downloadCSV = () => {
    // 1. Create the Headers (Date + Question Texts)
    const headers = ["Date Submitted", ...survey.questions.map((q: any) => q.text.replace(/,/g, ""))];
    
    // 2. Create the Rows (One row per response)
    const rows = survey.responses.map((resp: any) => {
      // Format the date nicely
      const date = new Date(resp.createdAt).toLocaleString().replace(/,/g, "");
      
      // Get answers in the same order as headers
      const answers = survey.questions.map((q: any) => {
        const answer = resp.answers.find((a: any) => a.questionId === q.id);
        // Clean up text (remove commas/newlines to not break CSV)
        return answer ? `"${answer.content.replace(/"/g, '""')}"` : "-";
      });

      return [date, ...answers].join(",");
    });

    // 3. Combine Headers and Rows
    const csvContent = [headers.join(","), ...rows].join("\n");

    // 4. Trigger the Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${survey.title.replace(/\s+/g, "_")}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={downloadCSV}
      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 text-sm"
    >
      <span>↓</span> Export to Excel
    </button>
  );
}