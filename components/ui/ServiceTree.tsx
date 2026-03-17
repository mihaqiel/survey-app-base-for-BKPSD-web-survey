"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react";

interface Service {
  id: string;
  nama: string;
  kategori?: string | null;
  count?: number;
  ikm?: number;
}

interface Props {
  services: Service[];
  selected: string | null;
  onSelect: (service: Service) => void;
  ikmColor?: (ikm: number) => string;
}

const UNCATEGORIZED = "Lainnya";

export default function ServiceTree({ services, selected, onSelect, ikmColor }: Props) {
  const grouped = services.reduce((acc, s) => {
    const key = s.kategori || UNCATEGORIZED;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.keys(grouped).reduce((acc, k) => ({ ...acc, [k]: true }), {})
  );

  const toggleGroup = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    return a.localeCompare(b);
  });

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 gap-2">
        <Folder className="w-8 h-8 text-slate-200" />
        <p className="text-sm text-slate-400 text-center">Belum ada layanan</p>
      </div>
    );
  }

  const hasCategories = services.some(s => s.kategori);

  if (!hasCategories) {
    return (
      <div className="divide-y divide-gray-50">
        {services.map((s, i) => (
          <ServiceItem key={s.id} service={s} selected={selected} onSelect={onSelect} index={i} ikmColor={ikmColor} />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {sortedGroups.map(group => (
        <div key={group}>
          <button onClick={() => toggleGroup(group)}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
            {expanded[group]
              ? <FolderOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              : <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            }
            <span className="flex-1 text-xs font-semibold text-slate-700">{group}</span>
            <span className="text-xs text-slate-400 mr-1">{grouped[group].length}</span>
            {expanded[group]
              ? <ChevronDown className="w-3 h-3 text-slate-400" />
              : <ChevronRight className="w-3 h-3 text-slate-400" />
            }
          </button>

          {expanded[group] && (
            <div className="pl-4 border-l-2 border-blue-100 ml-4">
              {grouped[group].map((s, i) => (
                <ServiceItem key={s.id} service={s} selected={selected} onSelect={onSelect} index={i} ikmColor={ikmColor} indented />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceItem({ service, selected, onSelect, index, ikmColor, indented }: {
  service: Service;
  selected: string | null;
  onSelect: (s: Service) => void;
  index: number;
  ikmColor?: (ikm: number) => string;
  indented?: boolean;
}) {
  const isSelected = selected === service.id;
  const color = ikmColor && service.ikm ? ikmColor(service.ikm) : "#3b82f6";

  return (
    <button onClick={() => onSelect(service)}
      className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left group ${
        isSelected ? "bg-blue-50 border-r-2 border-blue-600" : ""
      }`}>
      <FileText className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? "text-blue-600" : "text-slate-300 group-hover:text-blue-600"}`} />
      <p className={`flex-1 text-sm font-medium truncate transition-colors ${isSelected ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"}`}>
        {service.nama}
      </p>
      {service.ikm !== undefined && service.ikm > 0 && (
        <span className="text-xs font-bold shrink-0" style={{ color }}>{service.ikm.toFixed(1)}</span>
      )}
      <ChevronRight className={`w-3 h-3 shrink-0 transition-colors ${isSelected ? "text-blue-600" : "text-slate-300"}`} />
    </button>
  );
}
