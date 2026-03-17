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

interface TreeNode {
  kategori: string;
  services: Service[];
  expanded: boolean;
}

interface Props {
  services: Service[];
  selected: string | null;
  onSelect: (service: Service) => void;
  ikmColor?: (ikm: number) => string;
}

const UNCATEGORIZED = "Lainnya";

export default function ServiceTree({ services, selected, onSelect, ikmColor }: Props) {
  // Group services by kategori
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

  // Sort: categorized first, uncategorized last
  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    return a.localeCompare(b);
  });

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 gap-2">
        <Folder className="w-8 h-8 text-gray-200" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">
          Belum ada layanan
        </p>
      </div>
    );
  }

  // If no categories assigned — show flat list
  const hasCategories = services.some(s => s.kategori);

  if (!hasCategories) {
    return (
      <div className="divide-y divide-gray-50">
        {services.map((s, i) => (
          <ServiceItem
            key={s.id}
            service={s}
            selected={selected}
            onSelect={onSelect}
            index={i}
            ikmColor={ikmColor}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {sortedGroups.map(group => (
        <div key={group}>
          {/* Group header */}
          <button
            onClick={() => toggleGroup(group)}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#F0F4F8] transition-colors text-left"
          >
            {expanded[group]
              ? <FolderOpen className="w-3.5 h-3.5 text-[#FAE705] shrink-0" />
              : <Folder className="w-3.5 h-3.5 text-[#FAE705] shrink-0" />
            }
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
              {group}
            </span>
            <span className="text-[9px] text-gray-400 mr-1">{grouped[group].length}</span>
            {expanded[group]
              ? <ChevronDown className="w-3 h-3 text-gray-400" />
              : <ChevronRight className="w-3 h-3 text-gray-400" />
            }
          </button>

          {/* Services in group */}
          {expanded[group] && (
            <div className="pl-4 border-l-2 border-[#FAE705]/30 ml-4">
              {grouped[group].map((s, i) => (
                <ServiceItem
                  key={s.id}
                  service={s}
                  selected={selected}
                  onSelect={onSelect}
                  index={i}
                  ikmColor={ikmColor}
                  indented
                />
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
  const color = ikmColor && service.ikm ? ikmColor(service.ikm) : "#009CC5";

  return (
    <button
      onClick={() => onSelect(service)}
      className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-[#F0F4F8] transition-colors text-left group ${
        isSelected ? "bg-[#F0F8FF] border-r-2 border-[#009CC5]" : ""
      }`}
    >
      <FileText className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? "text-[#009CC5]" : "text-gray-300 group-hover:text-[#009CC5]"}`} />
      <p className={`flex-1 text-sm font-bold truncate transition-colors ${isSelected ? "text-[#009CC5]" : "text-[#132B4F] group-hover:text-[#009CC5]"}`}>
        {service.nama}
      </p>
      {service.ikm !== undefined && service.ikm > 0 && (
        <span className="text-[9px] font-black shrink-0" style={{ color }}>
          {service.ikm.toFixed(1)}
        </span>
      )}
      <ChevronRight className={`w-3 h-3 shrink-0 transition-colors ${isSelected ? "text-[#009CC5]" : "text-gray-300"}`} />
    </button>
  );
}