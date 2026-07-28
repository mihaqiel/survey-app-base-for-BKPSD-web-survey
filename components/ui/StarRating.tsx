"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const LABELS = [
  "",
  "Tidak Memuaskan",
  "Kurang Memuaskan",
  "Cukup",
  "Memuaskan",
  "Sangat Memuaskan",
];

export default function StarRating({
  value,
  onChange,
  name = "rating",
}: {
  value: number;
  onChange: (v: number) => void;
  name?: string;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <fieldset className="border-0 p-0 m-0">
        <legend className="sr-only">Rating kepuasan pegawai, 1 sampai 5 bintang</legend>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              className="relative cursor-pointer flex items-center justify-center rounded-lg transition-transform duration-150 hover:scale-110 focus-within:ring-2 focus-within:ring-[#FAE705] focus-within:ring-offset-2 focus-within:ring-offset-transparent"
              style={{ minWidth: 44, minHeight: 44 }}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            >
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                className="sr-only"
                aria-label={`${star} dari 5 bintang — ${LABELS[star]}`}
              />
              <Star
                className="w-12 h-12 transition-all duration-200"
                style={{
                  color:  star <= active ? "#FAE705" : "#e2e8f0",
                  fill:   star <= active ? "#FAE705" : "none",
                  filter: star <= active ? "drop-shadow(0 0 6px #FAE70588)" : "none",
                }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div
        className="text-center min-h-[48px] flex flex-col items-center justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        {active > 0 ? (
          <>
            <p className="text-3xl font-black text-white">{active}</p>
            <p
              className="text-sm font-semibold mt-1"
              style={{ color: "#FAE705", fontFamily: "var(--pf-body)" }}
            >
              {LABELS[active]}
            </p>
          </>
        ) : (
          <p
            className="text-sm font-medium"
            style={{ fontFamily: "var(--pf-body)", color: "rgba(255,255,255,0.35)" }}
          >
            Ketuk bintang untuk memberi rating
          </p>
        )}
      </div>

      {value > 0 && (
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width:      s <= value ? 28 : 8,
                background: s <= value ? "#FAE705" : "#e2e8f0",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
