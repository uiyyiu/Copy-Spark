
import React, { useState } from 'react';
import { BookOpenIcon, ChevronDownIcon } from './icons';

interface ReferencesDisplayProps {
  references: string[];
}

const ReferencesDisplay: React.FC<ReferencesDisplayProps> = ({ references }) => {
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  if (references.length === 0) return null;

  // Colors for "References" - Pink/Rose theme
  const bg = 'bg-pink-500/10';
  const hoverBg = 'hover:bg-pink-500/20';
  const border = 'border-pink-500/50';
  const textClass = 'text-pink-400';

  return (
    <div className={`glass-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${isCardExpanded ? 'ring-1 ring-white/20' : ''}`}>
      
      {/* Header */}
      <div 
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        className={`p-4 sm:p-6 cursor-pointer transition-colors duration-300 flex justify-between items-center ${bg} ${hoverBg} border-l-4 ${border}`}
      >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-[#0f172a]/40 flex items-center justify-center border border-white/10 shadow-inner ${textClass}`}>
                <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="spark-h2 text-white mb-1" style={{ margin: 0 }}>المراجع المستخدمة</h3>
                <p className="text-xs text-slate-300 font-medium opacity-80">
                   {references.length} مصادر
                </p>
            </div>
        </div>

        <div className={`p-2 rounded-full bg-white/5 text-slate-300 transition-transform duration-300 ${isCardExpanded ? 'rotate-180 bg-white/10 text-white' : ''}`}>
            <ChevronDownIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCardExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0f172a]/20">
            <ul className="list-disc list-inside space-y-3 text-slate-300 spark-body-serif">
                {references.map((ref, index) => (
                    <li key={index}>{ref}</li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default ReferencesDisplay;
