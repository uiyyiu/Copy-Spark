
import React, { useState, useMemo } from 'react';
import { BookOpenIcon, ChevronDownIcon } from './icons';
import { formatTextToHtml } from '../services/exportService';

interface VerseExplanationDisplayProps {
  verse: string;
  explanation: string;
}

const VerseExplanationDisplay: React.FC<VerseExplanationDisplayProps> = ({ verse, explanation }) => {
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const formattedExplanation = useMemo(() => formatTextToHtml(explanation), [explanation]);

  if (!verse || !explanation) return null;

  // Colors for "Verse Explanation" - Cyan/Teal theme
  const bg = 'bg-teal-500/10';
  const hoverBg = 'hover:bg-teal-500/20';
  const border = 'border-teal-500/50';
  const textClass = 'text-teal-400';

  return (
    <div className={`glass-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${isCardExpanded ? 'ring-1 ring-white/20' : ''}`}>
      
      {/* Header */}
      <div 
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        className={`p-4 sm:p-6 cursor-pointer transition-colors duration-300 flex justify-between items-center ${bg} ${hoverBg} border-l-4 ${border}`}
      >
        <div className="flex items-center gap-4 overflow-hidden">
            <div className={`w-12 h-12 rounded-full bg-[#0f172a]/40 flex-shrink-0 flex items-center justify-center border border-white/10 shadow-inner ${textClass}`}>
                <BookOpenIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
                <h3 className="spark-h2 text-white mb-1 truncate" style={{ margin: 0 }}>شرح الآية</h3>
                <p className="text-xs text-slate-300 font-medium opacity-80 truncate font-naskh">
                   {verse}
                </p>
            </div>
        </div>

        <div className={`p-2 rounded-full bg-white/5 text-slate-300 transition-transform duration-300 flex-shrink-0 ${isCardExpanded ? 'rotate-180 bg-white/10 text-white' : ''}`}>
            <ChevronDownIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCardExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0f172a]/20">
             <div 
                className="spark-body-serif formatted-content text-slate-200"
                dangerouslySetInnerHTML={{ __html: formattedExplanation }}
            />
        </div>
      </div>
    </div>
  );
};

export default VerseExplanationDisplay;
