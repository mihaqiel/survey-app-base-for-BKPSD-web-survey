"use client";
import { toggleSurveyStatus } from "@/app/action/admin"; //

export function StatusToggle({ id, isActive }: { id: string, isActive: boolean }) {
  return (
    <button 
      onClick={async () => {
        // This manually flips the isActive boolean in the database
        await toggleSurveyStatus(id, isActive);
      }}
      className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all border ${
        isActive 
          ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white" 
          : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
      }`}
    >
      {isActive ? "● ACTIVE" : "○ CLOSED"}
    </button>
  );
}