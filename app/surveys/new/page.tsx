"use client";
import { useState } from "react";
import { createDynamicSurvey } from "@/app/action/admin";

export default function NewSurveyPage() {
  const [questions, setQuestions] = useState([{ text: "", type: "TEXT" }]);

  const addQuestion = () =>
    setQuestions([...questions, { text: "", type: "TEXT" }]);
  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-10 text-white max-w-3xl mx-auto">
      {/* Visual Alignment with Dashboard Style */}
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8">Create New Assessment</h1>

      <form action={createDynamicSurvey} className="space-y-6">
        <div className="space-y-4">
          {/* Assessment Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Assessment Title</label>
            <input
              name="title"
              className="w-full p-4 bg-gray-900 border border-white/5 rounded-xl outline-none focus:border-blue-500 transition-colors font-bold"
              placeholder="e.g., Regional Performance Review"
              required
            />
          </div>

          {/* Deadline Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Set Deadline & Hour (Optional)</label>
            <input
              type="datetime-local"
              name="deadline"
              className="w-full p-4 bg-gray-900 border border-white/5 rounded-xl outline-none focus:border-blue-500 text-white font-bold"
            />
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div
              key={i}
              className="flex gap-4 items-start p-6 bg-gray-900/50 border border-white/5 rounded-2xl group transition-all hover:border-blue-500/20"
            >
              <div className="flex-1 space-y-4">
                <input
                  name="qText"
                  placeholder={`Question #${i + 1}`}
                  className="w-full p-3 bg-black/40 rounded-xl border border-gray-800 focus:border-blue-500 outline-none font-bold"
                  required
                />
                <select
                  name="qType"
                  className="w-full p-3 bg-black/40 rounded-xl border border-gray-800 text-blue-400 font-black uppercase text-[10px] tracking-widest outline-none cursor-pointer hover:bg-black/60 transition-colors"
                >
                  <option value="TEXT">Text Explanation</option>
                  {/* ✅ FIX: Updated to (1-5) to match Likert logic */}
                  <option value="SCORE">Rating Scale (1-5)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-gray-600 hover:text-red-500 p-2 transition-colors font-black"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={addQuestion}
            className="flex-1 border border-white/5 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            + Add Question
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 p-4 rounded-2xl font-black uppercase italic text-xs tracking-[0.2em] hover:bg-blue-500 transition-all active:scale-[0.98] shadow-2xl shadow-blue-900/20"
          >
            Publish to Regions
          </button>
        </div>
      </form>
    </div>
  );
}