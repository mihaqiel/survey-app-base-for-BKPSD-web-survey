  "use client";
  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";

  export function StatusGuard({ surveyId, expiresAt }: { surveyId: string, expiresAt: Date | null }) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
      const interval = setInterval(() => {
        if (expiresAt) {
          const remaining = new Date(expiresAt).getTime() - Date.now();
          setTimeLeft(remaining > 0 ? remaining : 0);
          
          // If time hits zero, force a refresh to show the "Closed" screen
          if (remaining <= 0) router.refresh();
        }
        
        // Heartbeat: Still check the manual "isActive" toggle every 5 seconds
        router.refresh(); 
      }, 1000);

      return () => clearInterval(interval);
    }, [expiresAt, router]);

    // Only show the alert if there are less than 10 minutes (600,000ms) left
    if (timeLeft === null || timeLeft > 600000 || timeLeft === 0) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return (
      <div className="fixed top-0 left-0 w-full z-100 animate-in slide-in-from-top duration-500">
        <div className="bg-red-600 text-white py-2 px-4 flex justify-center items-center gap-4 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
            ⚠️ System Lock Imminent
          </span>
          <div className="font-mono font-black bg-black/20 px-3 py-1 rounded-lg text-lg">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Finalize Transmission
          </span>
        </div>
      </div>
    );
  }