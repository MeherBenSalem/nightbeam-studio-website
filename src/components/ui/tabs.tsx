"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function Tabs({ tabs, initialTab, onTabChange }: { tabs: TabItem[]; initialTab?: string; onTabChange?: (id: string) => void }) {
  const id = useId();
  const [active, setActive] = useState(initialTab ?? tabs[0]?.id);

  function select(tabId: string) {
    setActive(tabId);
    onTabChange?.(tabId);
  }

  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div>
      <div role="tablist" aria-label="Project sections" className="flex flex-wrap gap-1 border-b border-night-600/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`${id}-${tab.id}-tab`}
            aria-selected={activeTab?.id === tab.id}
            aria-controls={`${id}-${tab.id}-panel`}
            tabIndex={activeTab?.id === tab.id ? 0 : -1}
            onClick={() => select(tab.id)}
            className={cn(
              "rounded-t-md px-3 py-2 text-sm font-medium transition-colors sm:px-4",
              activeTab?.id === tab.id
                ? "border border-b-0 border-night-500/60 bg-night-800/70 text-pixel-cyan"
                : "text-slate-400 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-${activeTab?.id}-panel`}
        aria-labelledby={`${id}-${activeTab?.id}-tab`}
        className="py-6"
      >
        {activeTab?.content}
      </div>
    </div>
  );
}
