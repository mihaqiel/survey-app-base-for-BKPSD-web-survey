"use client";
import { useState, useEffect } from "react";

export function LiveTicker({ surveyId }: { surveyId: string }) {
  const [recentResponses, setRecentResponses] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/surveys/${surveyId}/latest`);
        const data = await res.json();
        setRecentResponses(data);
      } catch (e) {
        console.error("Ticker Sync Failed", e);
      }
    };

    const interval = setInterval(fetchLatest, 5000); // Sync every 5 seconds
    fetchLatest(); 
    return () => clearInterval(interval);
  }, [surveyId]);

  return (
    <div className="bg-gray-950/50 border border-white/5 rounded-[2rem] p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">Live Feed</h4>
        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
      </div>
      
      <div className="space-y-4">
        {recentResponses.length === 0 ? (
          <p className="text-[9px] text-gray-700 font-black uppercase italic">Awaiting node data...</p>
        ) : (
          recentResponses.slice(0, 5).map((resp) => (
            <div key={resp.id} className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[10px] font-black text-gray-400 italic">
                {new Date(resp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-black text-blue-400 uppercase italic">
                {resp.globalScore}% Index
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}