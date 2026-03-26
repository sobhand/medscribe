import { useState } from 'react';

export default function EditableCard({ title, icon, defaultExpanded = false, badge, children }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/50 transition"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <h3 className="text-base font-semibold text-gray-800 truncate">{title}</h3>
          {badge && (
            <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}
