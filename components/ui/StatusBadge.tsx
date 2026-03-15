interface StatusBadgeProps {
  ikm: number;
  size?: "sm" | "md";
}

export function ikmLabel(ikm: number) {
  if (ikm === 0)    return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65)    return "Kurang Baik";
  return "Tidak Baik";
}

export function ikmColor(ikm: number) {
  if (ikm === 0)    return "#94a3b8";
  if (ikm >= 88.31) return "#16a34a";
  if (ikm >= 76.61) return "#009CC5";
  if (ikm >= 65)    return "#d97706";
  return "#dc2626";
}

export default function StatusBadge({ ikm, size = "md" }: StatusBadgeProps) {
  const label = ikmLabel(ikm);

  const styles: Record<string, { bg: string; text: string }> = {
    "Sangat Baik": { bg: "bg-green-50",  text: "text-green-700"  },
    "Baik":        { bg: "bg-sky-50",    text: "text-sky-700"    },
    "Kurang Baik": { bg: "bg-amber-50",  text: "text-amber-700"  },
    "Tidak Baik":  { bg: "bg-red-50",    text: "text-red-700"    },
    "No Data":     { bg: "bg-gray-100",  text: "text-gray-400"   },
  };

  const s = styles[label];
  const padding = size === "sm" ? "px-2 py-0.5 text-[8px]" : "px-3 py-1 text-[9px]";

  return (
    <span
      className={`inline-flex items-center rounded-full font-black uppercase tracking-wide ${padding} ${s.bg} ${s.text}`}
    >
      {label}
    </span>
  );
}