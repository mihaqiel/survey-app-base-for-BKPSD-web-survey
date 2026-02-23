"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function StatusGuard({ surveyId, expiresAt }: { surveyId: string, expiresAt: Date | string | null }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // 1. Time Calculation Function
    const calculateTime = () => {
      if (!expiresAt) return;
      
      const target = new Date(expiresAt).getTime();
      const now = Date.now();
      const remaining = target - now;

      // Update state
      setTimeLeft(remaining > 0 ? remaining : 0);

      // 🚨 DEADLINE HIT: Only refresh exactly when time hits zero
      if (remaining <= 0) {
        router.refresh(); 
      }
    };

    // Run immediately on mount
    calculateTime();

    // 2. Ticker Interval (Updates the visual timer every second)
    const timerInterval = setInterval(calculateTime, 1000);

    // 3. Heartbeat (Checks for manual "Stop" from Admin)
    // ✅ FIX: Only polls the server every 10 seconds (instead of 1s) to save performance
    const heartbeatInterval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(heartbeatInterval);
    };
  }, [expiresAt, router]);

  // ✅ HYDRATION FIX: Returns null initially to prevent server/client mismatch
  // Only shows banner if:
  // 1. Time is calculated (not null)
  // 2. Less than 10 minutes remain (> 600000ms)
  // 3. Time is not already zero
  if (timeLeft === null || timeLeft > 600000 || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="fixed top-0 left-0 w-full z-50 animate-in slide-in-from-top duration-500 pointer-events-none">
      <div className="bg-red-600 text-white py-2 px-4 flex justify-center items-center gap-4 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          ⚠️ System Lock Imminent
        </span>
        <div className="font-mono font-black bg-black/20 px-3 py-1 rounded-lg text-lg min-w-[60px] text-center">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden sm:inline">
          Finalize Transmission
        </span>
      </div>
    </div>
  );
}