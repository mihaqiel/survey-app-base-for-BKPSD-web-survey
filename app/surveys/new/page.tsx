"use client";
import { useState } from "react";
import { createDynamicSurvey } from "@/app/action/admin";

export default function NewSurveyPage() {
  const [questions, setQuestions] = useState([{ text: "", type: "TEXT" }]);
  const [deadline, setDeadline] = useState("");
  const [activeDuration, setActiveDuration] = useState<number | null>(null);

  const addQuestion = () => setQuestions([...questions, { text: "", type: "TEXT" }]);
  const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));

  // ✅ AUTOMATION FIX: Generates full ISO string to bypass "dd/mm/yy" browser errors [cite: 2026-02-21]
  const setDuration = (minutes: number) => {
    const target = new Date();
    target.setMinutes(target.getMinutes() + minutes);
    setDeadline(target.toISOString().slice(0, 19)); // Precise YYYY-MM-DDTHH:MM:SS
    setActiveDuration(minutes);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-l-4 border-blue-600 pl-6 text-left">
           <h1 className="text-4xl font-black italic uppercase tracking-tighter">
             Initialize Regional Node
           </h1>
           <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mt-1">
             Deployment Portal v2.0
           </p>
        </header>

        <form action={createDynamicSurvey} className="space-y-10 text-left">
          {/* 1. Assessment Title */}
          <div className="bg-gray-900/40 border border-white/5 p-8 rounded-[2rem] space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] italic">
              Node Title
            </label>
            <input
              name="title"
              required
              className="w-full p-6 bg-black/60 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-xl italic"
              placeholder="e.g., Regional Performance Review"
            />
          </div>

          {/* 🎯 PROBLEM 3 FIX: Duration-Based UI [cite: 2026-02-21] */}
          <div className="bg-gray-900/40 border border-white/5 p-8 rounded-[2rem] space-y-6">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] italic">
              Reporting Window (Duration)
            </label>
            
            <div className="grid grid-cols-3 gap-4">
              {[1, 5, 60].map(m => (
                <button 
                  key={m} 
                  type="button" 
                  onClick={() => setDuration(m)} 
                  className={`py-6 border rounded-2xl transition-all flex flex-col items-center gap-1 ${
                    activeDuration === m 
                      ? "bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.3)]" 
                      : "bg-white/5 border-white/10 grayscale opacity-40 hover:opacity-100 hover:grayscale-0"
                  }`}
                >
                  <span className="text-2xl font-black italic">+{m === 60 ? '1' : m}</span>
                  <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">
                    {m === 60 ? 'HOUR' : 'MINUTES'}
                  </span>
                </button>
              ))}
            </div>

            {/* Hidden field handles the actual data to satisfy the browser [cite: 2026-02-21] */}
            <input type="hidden" name="deadline" value={deadline} required />
            
            {deadline && (
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <p className="text-[9px] text-blue-400 font-black uppercase italic tracking-widest">
                  Auto-Shutdown Sequence Armed
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  {new Date(deadline).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* 3. Question Mapping */}
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="p-8 bg-gray-900/20 border border-white/5 rounded-[2.5rem] transition-all hover:border-blue-500/30">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-600 tracking-widest italic uppercase">Metric #{i + 1}</span>
                    <button type="button" onClick={() => removeQuestion(i)} className="text-gray-700 hover:text-red-500 font-black">✕</button>
                  </div>
                  <input
                    name="qText"
                    required
                    className="w-full p-4 bg-black/40 rounded-xl border border-white/5 focus:border-blue-500 outline-none font-bold text-lg"
                    placeholder="Metric Name (e.g., Efficiency)..."
                  />
                  <select
                    name="qType"
                    className="w-full p-4 bg-black/40 rounded-xl border border-white/5 text-blue-400 font-black uppercase text-[10px] tracking-widest outline-none"
                  >
                    <option value="TEXT">Descriptive Analysis</option>
                    <option value="SCORE">Quantitative (1-5)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* 4. Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-10">
            <button
              type="button"
              onClick={addQuestion}
              className="flex-1 border-2 border-dashed border-white/10 p-6 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all text-gray-500"
            >
              + Add Metric
            </button>
            <button
              type="submit"
              disabled={!deadline}
              className={`flex-1 p-6 rounded-3xl font-black uppercase italic text-sm tracking-[0.2em] transition-all ${
                deadline 
                  ? "bg-blue-600 hover:bg-blue-500 shadow-[0_20px_40px_rgba(37,99,235,0.2)]" 
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}
            >
              🚀 Publish Regional Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}