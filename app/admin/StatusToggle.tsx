"use client";
import { toggleSurveyStatus } from "@/app/action/admin";

interface StatusToggleProps {
  id: string;
  isActive: boolean; // This is the "Actually Active" status from the parent [cite: 2026-02-21]
}

export function StatusToggle({ id, isActive }: StatusToggleProps) {
  return (
    <button 
      onClick={async () => {
        // ✅ SURGICAL FIX: We toggle the current visual state.
        // If it's visually CLOSED (due to time or toggle), this flips it to ACTIVE. [cite: 2026-02-21]
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