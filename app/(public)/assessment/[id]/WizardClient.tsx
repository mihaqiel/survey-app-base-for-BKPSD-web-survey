"use client";

import { useState } from "react";
import { submitResponse } from "@/app/action/submit";
import { CountdownTimer } from "./CountdownTimer";

const RATING_OPTIONS = [
  { value: "1", label: "Poor", activeClass: "bg-red-600 border-red-500" },
  { value: "2", label: "Fair", activeClass: "bg-orange-600 border-orange-500" },
  { value: "3", label: "Good", activeClass: "bg-blue-600 border-blue-500" },
  { value: "4", label: "Very Good", activeClass: "bg-indigo-600 border-indigo-500" },
  { value: "5", label: "Excellent", activeClass: "bg-green-600 border-green-500" },
];

export default function WizardClient({ survey }: { survey: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const totalQuestions = survey.questions.length;
  const activeQuestion = survey.questions[currentStep];

  // Logic to move forward
  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Logic to move backward
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Save answer to browser memory
  const setAnswer = (val: string) => {
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: val }));
  };

  // Validation: Check if current question has an answer
  const hasAnsweredCurrent = !!answers[activeQuestion.id] && answers[activeQuestion.id].trim() !== "";
  const isLastQuestion = currentStep === totalQuestions - 1;

  return (
    <form action={submitResponse} className="flex flex-col md:flex-row h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* Hidden inputs to securely transmit all answers to the backend at once */}
      <input type="hidden" name="surveyId" value={survey.id} />
      {survey.questions.map((q: any) => (
        <input key={`hidden-${q.id}`} type="hidden" name={`answer_${q.id}`} value={answers[q.id] || ""} />
      ))}

      {/* 🚀 LEFT PANEL: Smart Expanding Accordion Table */}
      <aside className="hidden md:flex flex-col w-1/3 max-w-sm bg-[#0A0A0A] border-r border-white/5 overflow-y-auto relative z-10 p-10 shadow-2xl">
        
        {/* Title Area (Informasi -> Survey Title) */}
        <div className="mb-10 border-b border-white/10 pb-8 space-y-4">
          <p className="text-blue-500 font-black tracking-[0.3em] text-[10px] uppercase">Informasi Survei</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white">
            {survey.title}
          </h1>
          {survey.expiresAt && <CountdownTimer expiresAt={survey.expiresAt} />}
        </div>
        
        {/* The Vertical Map (Accordion Style) */}
        <div className="flex-1 space-y-2">
          {survey.questions.map((q: any, idx: number) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            
            return (
              <div key={q.id} className="flex flex-col">
                
                {/* Question Header & Expanding Box */}
                <div className={`transition-all duration-300 p-4 rounded-xl border ${isActive ? "bg-white/[0.05] border-white/10 shadow-lg" : "border-transparent"}`}>
                  
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? "text-blue-500" : isCompleted ? "text-green-500" : "text-gray-600"}`}>
                    {isCompleted ? "✓ " : ""}Pertanyaan {idx + 1}
                  </h3>
                  
                  {/* EXPANDING TEXT: ONLY shows if this is the active step */}
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-gray-300 font-medium leading-relaxed italic border-l-2 border-blue-500 pl-4">
                        {q.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* The | | | Connecting Line (Shorter and cleaner now) */}
                {idx !== survey.questions.length - 1 && (
                  <div className={`ml-6 my-1 border-l-2 border-dashed h-6 transition-colors duration-500 ${isCompleted ? "border-green-500/50" : "border-white/10"}`}></div>
                )}
                
              </div>
            );
          })}
        </div>
      </aside>

      {/* 🚀 RIGHT PANEL: Active Question (Main View on Mobile) */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#050505]">
        
        {/* Mobile Header (Only visible on small screens) */}
        <header className="md:hidden flex flex-col px-6 py-6 border-b border-white/5 bg-[#0A0A0A] shrink-0 z-10 shadow-xl">
           <p className="text-blue-500 font-black tracking-[0.3em] text-[8px] uppercase mb-1">Informasi Survei</p>
           <h1 className="text-xl font-black italic uppercase tracking-tighter leading-tight truncate mb-3">{survey.title}</h1>
           {survey.expiresAt && <CountdownTimer expiresAt={survey.expiresAt} />}
        </header>

        {/* Dynamic Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-16 flex flex-col justify-center">
          <div className="max-w-xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500" key={activeQuestion.id}>
            
            {/* Mobile Progress Indicator */}
            <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4 md:hidden">
              Pertanyaan {currentStep + 1} dari {totalQuestions}
            </p>

            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight mb-10 text-white">
              {activeQuestion.text}
            </h2>

            {/* Answer Inputs */}
            {activeQuestion.type === "SCORE" ? (
              <div className="flex flex-col gap-3">
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = answers[activeQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswer(opt.value)}
                      className={`w-full text-left px-6 py-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${
                        isSelected 
                        ? `${opt.activeClass} text-white scale-[1.02] shadow-2xl` 
                        : "bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <span className="font-black text-2xl italic">{opt.value}</span>
                        <span className="text-sm font-black uppercase tracking-widest opacity-80">{opt.label}</span>
                      </div>
                      
                      {/* Custom Radio Button UI */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-white bg-white/20" : "border-white/20 bg-black/50"}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answers[activeQuestion.id] || ""}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide descriptive feedback here..."
                className="w-full p-8 bg-white/[0.02] border border-white/10 rounded-[2rem] outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all h-64 text-sm font-medium resize-none shadow-inner"
              />
            )}
          </div>
        </div>

        {/* 🚀 STICKY BOTTOM ACTION BAR */}
        <div className="shrink-0 p-6 md:p-10 bg-[#0A0A0A] md:bg-transparent border-t border-white/5 md:border-none flex items-center justify-between z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none">
          
          <button 
            type="button" 
            onClick={handlePrev} 
            className={`px-4 py-4 font-black uppercase text-[10px] tracking-widest text-gray-500 hover:text-white transition-colors ${currentStep === 0 ? "invisible" : ""}`}
          >
            ← Kembali
          </button>

          {!isLastQuestion ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className={`px-10 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-3 ${
                hasAnsweredCurrent ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95" : "bg-white/5 text-white/20 cursor-not-allowed border border-white/10"
              }`}
            >
              Lanjut →
            </button>
          ) : (
            <button
              type="submit"
              disabled={!hasAnsweredCurrent}
              className={`px-8 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-3 ${
                hasAnsweredCurrent ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 border-b-4 border-blue-800" : "bg-white/5 text-white/20 cursor-not-allowed border border-white/10"
              }`}
            >
              Kirim ✓
            </button>
          )}
        </div>
      </main>
    </form>
  );
}