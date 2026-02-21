"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function CountdownTimer({ expiresAt }: { expiresAt: string | Date }) {
  const router = useRouter(); // ✅ SURGICAL FIX: Use Next.js router for smooth transitions
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target - now;

      // ✅ AUTOMATIC LOCKOUT: Trigger server guard seamlessly
      if (distance <= 0) {
        setTimeLeft("00m 00s");
        router.refresh(); // Forces page.tsx to re-run its server checks without a white flash
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // 🚨 URGENCY SIGNAL: Pulse red when less than 10 seconds remains
      setIsUrgent(distance < 10000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimer(); // ✅ Kills the 1-second "stutter" by calculating immediately
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, router]);

  // Prevents rendering an empty pill during the first microsecond of client hydration
  if (!timeLeft) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-black italic tracking-widest text-[10px] uppercase transition-all duration-300 ${
        isUrgent
          ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse"
          : "bg-blue-500/10 border-blue-500/20 text-blue-400"
      }`}
    >
      <span className={isUrgent ? "" : "animate-pulse"}>●</span>
      {isUrgent ? "Closing Soon: " : "Remaining: "} {timeLeft}
    </div>
  );
}
