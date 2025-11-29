
import React, { useState } from 'react';
import { Idea, IdeaSectionKey } from '../types';
import IdeaItem from './IdeaItem';
import { CopyIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, LightBulbIcon } from './icons';

interface IdeaCardProps {
  sectionKey: IdeaSectionKey;
  title: string;
  ideas: Idea[];
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
  itemIsLoading: Record<string, boolean>;
  onToggleSelect: (sectionKey: IdeaSectionKey, ideaId: string) => void;
  onGenerateAlternative: (sectionKey: IdeaSectionKey, ideaId: string) => void;
  onShare: (idea: Idea) => void;
  onExplain: (idea: Idea) => void;
}

const colorClasses = {
    blue:   { border: 'border-blue-500/50',   text: 'text-blue-400',   bg: 'bg-blue-500/10', hoverBg: 'hover:bg-blue-500/20' },
    green:  { border: 'border-green-500/50',  text: 'text-green-400',  bg: 'bg-green-500/10', hoverBg: 'hover:bg-green-500/20' },
    purple: { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-500/10', hoverBg: 'hover:bg-purple-500/20' },
    orange: { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-500/10', hoverBg: 'hover:bg-orange-500/20' },
    yellow: { border: 'border-amber-500/50',  text: 'text-amber-400',  bg: 'bg-amber-500/10', hoverBg: 'hover:bg-amber-500/20' }
};

const IdeaCard: React.FC<IdeaCardProps> = ({ 
    sectionKey,
    title, 
    ideas, 
    color, 
    itemIsLoading,
    onToggleSelect,
    onGenerateAlternative,
    onShare,
    onExplain,
}) => {
  const { border, text, bg, hoverBg } = colorClasses[color];
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleToggleExpand = (ideaId: string) => {
    setExpandedIdeaId(prevId => (prevId === ideaId ? null : ideaId));
  };

  const handleCopySection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCopied) return;
    
    const textToCopy = ideas.map((idea, index) => `${index + 1}. ${idea.text}`).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy section text: ', err);
    });
  };

  return (
    <div className={`glass-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${isCardExpanded ? 'ring-1 ring-white/20' : ''}`}>
      
      {/* Glass Header (Clickable) */}
      <div 
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        className={`p-4 sm:p-6 cursor-pointer transition-colors duration-300 flex justify-between items-center ${bg} ${hoverBg} border-l-4 ${border}`}
      >
        <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div className={`w-12 h-12 rounded-full bg-[#0f172a]/40 flex items-center justify-center border border-white/10 shadow-inner ${text}`}>
                <LightBulbIcon className="w-6 h-6" />
            </div>
            
            <div>
                <h3 className={`spark-h2 text-white mb-1`} style={{ margin: 0 }}>{title}</h3>
                <p className="text-xs text-slate-300 font-medium opacity-80">
                    {ideas.length} أفكار مقترحة
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {isCardExpanded && (
                <button
                onClick={handleCopySection}
                disabled={isCopied}
                className="hidden sm:flex items-center gap-2 text-xs font-semibold bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 py-2 px-3 rounded-lg transition-all duration-200 disabled:cursor-default border border-white/5"
                >
                {isCopied ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                ) : (
                    <CopyIcon className="w-4 h-4" />
                )}
                </button>
            )}
            
            <div className={`p-2 rounded-full bg-white/5 text-slate-300 transition-transform duration-300 ${isCardExpanded ? 'rotate-180 bg-white/10 text-white' : ''}`}>
                <ChevronDownIcon className="w-5 h-5" />
            </div>
        </div>
      </div>

      {/* Content (Collapsible) */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCardExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0f172a]/20">
            <div className="flex flex-col space-y-3">
                {ideas.map((idea, index) => (
                <IdeaItem
                    key={idea.id}
                    idea={idea}
                    index={index}
                    color={color}
                    isLoading={itemIsLoading[idea.id] || false}
                    isExpanded={expandedIdeaId === idea.id}
                    onToggleExpand={() => handleToggleExpand(idea.id)}
                    onToggleSelect={() => onToggleSelect(sectionKey, idea.id)}
                    onGenerateAlternative={() => onGenerateAlternative(sectionKey, idea.id)}
                    onShare={() => onShare(idea)}
                    onExplain={() => onExplain(idea)}
                />
                ))}
            </div>
          </div>
      </div>
    </div>
  );
};

export default IdeaCard;
