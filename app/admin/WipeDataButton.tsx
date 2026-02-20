"use client";

import { clearAllResponses } from "@/app/action/admin";

export function WipeDataButton() {
  const handleWipe = async () => {
    const confirmed = window.confirm(
      "DANGER: This will wipe all current test results and reset Mean/Index scores. Continue?"
    );
    
    if (confirmed) {
      await clearAllResponses();
    }
  };

  return (
    <button 
      onClick={handleWipe}
      className="px-6 py-3 border border-red-900/30 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-red-900/20 transition-all"
    >
      Wipe Test Data
    </button>
  );
}