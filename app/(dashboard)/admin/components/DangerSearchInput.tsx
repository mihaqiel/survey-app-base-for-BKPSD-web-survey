"use client";

import { useState } from "react";

export default function DangerSearch({ placeholder }: { placeholder: string }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 px-3 py-2 focus-within:border-[#009CC5] transition-colors">
      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
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
          className="text-[10px] font-black text-gray-300 hover:text-[#132B4F] transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}