"use client";
import { useState } from "react";
// ✅ Safely imports your stable backend function
import { createDynamicSurvey } from "@/app/action/admin"; 
import Link from "next/link";

export default function NewSurveyPage() {
  const [questions, setQuestions] = useState([{ id: 1, text: "", type: "SCORE" }]);
  const [activeDuration, setActiveDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: "", type: "SCORE" }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // ✅ Injects the smart calculated minutes directly into the form data
    if (activeDuration) {
      formData.set("duration", activeDuration.toString());
    } else {
      formData.delete("duration");
    }

    try {
      await createDynamicSurvey(formData);
    } catch (error) {
      console.error("Deployment failed:", error);
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-10 text-white min-h-screen">
      <Link href="/admin" className="text-gray-500 hover:text-white mb-8 inline-block transition-colors font-black uppercase text-[10px] tracking-widest">
        ← Abort & Return
      </Link>

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Initialize Node</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Configure new data collection matrix</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Node Designation */}
          <div className="bg-gray-900/40 border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-2xl">
             <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] italic">Node Designation (Title)</label>
             <input
                type="text"
                name="title"
                required
                placeholder="e.g., Regional Performance Q3..."
                className="w-full p-6 bg-black/60 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-xl italic text-white placeholder:text-gray-700"
              />
          </div>

          {/* 🚀 THE SMART DURATION UI */}
          <div className="bg-gray-900/40 border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-2xl">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] italic">
              Reporting Window (Duration)
            </label>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g., 15m, 1 hour, 2 days"
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().trim();
                    let minutes = null;
                    
                    if (val) {
                      // The Parser: Translates words into raw minutes
                      const match = val.match(/^(\d+)\s*(m|min|minute|minutes|h|hr|hour|hours|d|day|days)?$/);
                      if (match) {
                        const amount = parseInt(match[1]);
                        const unit = match[2] || 'm'; 
                        
                        if (unit.startsWith('h')) minutes = amount * 60;
                        else if (unit.startsWith('d')) minutes = amount * 60 * 24;
                        else minutes = amount;
                      }
                    }
                    
                    setActiveDuration(minutes);
                  }}
                  className="w-full p-6 bg-black/60 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-xl italic text-white placeholder:text-gray-700"
                />
              </div>
            </div>
            
            {activeDuration ? (
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-green-400">
                <p className="text-[9px] font-black uppercase italic tracking-widest">✓ Valid Format Recognized</p>
                <p className="text-[10px] font-mono">Total: {activeDuration} Minute{activeDuration > 1 ? 's' : ''}</p>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-gray-600">
                <p className="text-[9px] font-black uppercase italic tracking-widest">Awaiting Input (Leave blank for infinite)</p>
              </div>
            )}
          </div>

          {/* Metrics / Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Metrics Payload</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Parameters: {questions.length}</p>
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="bg-gray-900/40 border border-white/5 p-8 rounded-[2rem] space-y-6 relative group transition-all hover:border-blue-500/30 shadow-2xl">
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-red-600 text-white rounded-xl font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-500 shadow-xl"
                  >
                    ×
                  </button>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm border border-blue-500/20">
                    {index + 1}
                  </span>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] italic">Metric Specification</label>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="qText" 
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                      required
                      placeholder="Enter specific parameter..."
                      className="w-full p-6 bg-black/60 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-gray-700"
                    />
                  </div>
                  <div>
                    <select
                      name="qType" 
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, "type", e.target.value)}
                      className="w-full p-6 bg-black/60 border border-white/10 rounded-2xl text-blue-400 font-black uppercase text-[10px] tracking-widest outline-none appearance-none cursor-pointer focus:border-blue-500 transition-all"
                    >
                      <option value="SCORE">Quantitative (1-5)</option>
                      <option value="TEXT">Descriptive (Text)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-8 border-2 border-dashed border-white/10 rounded-[2rem] text-gray-500 font-black uppercase tracking-widest text-[10px] hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all active:scale-[0.98]"
            >
              + Append New Parameter
            </button>
          </div>

          <div className="pt-12">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white p-8 rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(37,99,235,0.3)] active:scale-[0.98]"
            >
              {loading ? "INITIALIZING NODE..." : "DEPLOY DATA NODE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}