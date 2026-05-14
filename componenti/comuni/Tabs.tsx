'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg
                whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTabContent}
      </div>
    </div>
  );
}