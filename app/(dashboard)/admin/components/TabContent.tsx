"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabContentProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function TabContent({ tabs, defaultTab = tabs[0]?.id }: TabContentProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      {/* TAB NAVIGATION */}
      <div className="bg-white border-b border-gray-200 sticky top-[70px] z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? "border-[#009CC5] text-[#009CC5]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#009CC5] to-[#009CC5]/30 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto w-full p-6 lg:p-8">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`transition-all duration-300 ${activeTab === tab.id ? "opacity-100 visible" : "opacity-0 invisible absolute"}`}
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
