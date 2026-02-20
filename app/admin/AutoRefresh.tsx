"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh() {
  const [enabled, setEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (enabled) {
      // 🚀 Logic: Refresh the server data every 10 seconds
      interval = setInterval(() => {
        router.refresh();
      }, 10000);
    }

    return () => clearInterval(interval);
  }, [enabled, router]);

  return (
    <div className="flex items-center gap-3 bg-gray-900/50 border border-white/10 px-4 py-2 rounded-full">
      <span className={`text-[9px] font-black uppercase tracking-widest ${enabled ? 'text-green-500 animate-pulse' : 'text-gray-500'}`}>
        {enabled ? "Live Feed Active" : "Static Mode"}
      </span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${enabled ? 'bg-green-600' : 'bg-gray-700'}`}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}