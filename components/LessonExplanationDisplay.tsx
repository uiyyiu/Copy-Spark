
import React, { useState, useMemo } from 'react';
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon, ChatBubbleIcon, TargetIcon } from './icons';
import { formatTextToHtml } from '../services/exportService';

interface LessonExplanationDisplayProps {
  lessonElements: string[];
  lessonBody: string;
  onOpenInNewPage: () => void;
  onToggleChat: () => void;
}

const LessonExplanationDisplay: React.FC<LessonExplanationDisplayProps> = ({ lessonElements, lessonBody, onOpenInNewPage, onToggleChat }) => {
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  
  const formattedExplanation = useMemo(() => formatTextToHtml(lessonBody), [lessonBody]);

  // Colors for "Lesson Explanation" - utilizing a specific color theme (Cyan/Sky)
  const bg = 'bg-sky-500/10';
  const hoverBg = 'hover:bg-sky-500/20';
  const border = 'border-sky-500/50';
  const textClass = 'text-sky-400';

  return (
    <div className={`glass-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${isCardExpanded ? 'ring-1 ring-white/20' : ''}`}>
      
      {/* Header (Clickable) */}
      <div 
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        className={`p-4 sm:p-6 cursor-pointer transition-colors duration-300 flex justify-between items-center ${bg} ${hoverBg} border-l-4 ${border}`}
      >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-[#0f172a]/40 flex items-center justify-center border border-white/10 shadow-inner ${textClass}`}>
                <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="spark-h2 text-white mb-1" style={{ margin: 0 }}>شرح الدرس</h3>
                <p className="text-xs text-slate-300 font-medium opacity-80">
                   العناصر، الشرح التفصيلي
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
             <div className="flex items-center gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleChat(); }}
                    className="p-2 rounded-full transition-colors text-slate-400 hover:bg-white/10 hover:text-white"
                    title="اسأل عن الشرح"
                >
                    <ChatBubbleIcon className="w-5 h-5" />
                </button>
                {/* 
                <button
                    onClick={(e) => { e.stopPropagation(); onOpenInNewPage(); }}
                    className="p-2 rounded-full transition-colors text-slate-400 hover:bg-white/10 hover:text-white"
                    title="فتح في صفحة جديدة"
                >
                    <ExternalLinkIcon className="w-5 h-5" />
                </button>
                */}
            </div>

            <div className={`p-2 rounded-full bg-white/5 text-slate-300 transition-transform duration-300 ${isCardExpanded ? 'rotate-180 bg-white/10 text-white' : ''}`}>
                <ChevronDownIcon className="w-5 h-5" />
            </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCardExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0f172a]/20">
            
            {/* Elements Section */}
            {lessonElements && lessonElements.length > 0 && (
                <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <TargetIcon className="w-5 h-5 text-amber-400" />
                        <h4 className="spark-h3 text-amber-300" style={{margin: 0}}>عناصر الدرس</h4>
                    </div>
                    <ul className="space-y-2 pr-4 list-disc list-inside spark-body text-slate-300">
                        {lessonElements.map((element, index) => (
                            <li key={index}>{element}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Full Body */}
            <div 
                className="spark-body-serif formatted-content break-words text-slate-200"
                dangerouslySetInnerHTML={{ __html: formattedExplanation }}
            />
          </div>
      </div>
    </div>
  );
};

export default LessonExplanationDisplay;
