"use client";

import { useState } from "react";

export default function DangerSearch({ placeholder }: { placeholder: string }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className={`flex items-center gap-3 bg-white border-2 px-3 py-2 transition-all duration-200 ${
      focused ? "border-[#009CC5] shadow-[0_0_0_3px_rgba(0,156,197,0.12)]" : "border-gray-200"
    }`}>
      <svg
        className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${focused ? "text-[#009CC5]" : "text-gray-400"}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const q = e.target.value.toLowerCase();
          setQuery(e.target.value);
          document.querySelectorAll<HTMLTableRowElement>("[data-entity-row]").forEach(row => {
            const name = row.dataset.name ?? "";
            row.style.display = name.includes(q) ? "" : "none";
          });
        }}
        className="flex-1 text-xs font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none"
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            document.querySelectorAll<HTMLTableRowElement>("[data-entity-row]").forEach(row => {
              row.style.display = "";
            });
          }}
          className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-all duration-150 text-[9px] font-black animate-bounce-in"
        >
          ✕
        </button>
      )}
    </div>
  );
}