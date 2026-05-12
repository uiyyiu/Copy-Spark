import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Idea, IdeaSectionKey } from '../types';
import IdeaItem from './IdeaItem';
import { CopyIcon, CheckCircleIcon, ChevronDownIcon, LightBulbIcon } from './icons';

interface IdeaCardProps {
  sectionKey: IdeaSectionKey;
  title: string;
  ideas: Idea[];
  color: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose';
  itemIsLoading: Record<string, boolean>;
  onToggleSelect: (sectionKey: IdeaSectionKey, ideaId: string) => void;
  onGenerateAlternative: (sectionKey: IdeaSectionKey, ideaId: string) => void;
  onShare: (idea: Idea) => void;
  onExplain: (idea: Idea) => void;
}

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
  const [isCardExpanded, setIsCardExpanded] = useState(true);
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
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy section text: ', err);
    });
  };

  const colorConfig = {
      sky: { border: 'border-sky-500/50', text: 'text-sky-400', bg: 'bg-sky-500/5' },
      emerald: { border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-500/5' },
      amber: { border: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-500/5' },
      purple: { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-500/5' },
      rose: { border: 'border-rose-500/50', text: 'text-rose-400', bg: 'bg-rose-500/5' }
  };

  const style = colorConfig[color];

  return (
    <div className={`glass-card rounded-[2.5rem] border border-white/5 bg-slate-900/30 overflow-hidden transition-all duration-500 ${isCardExpanded ? 'shadow-2xl' : 'shadow-lg'}`}>
      
      <div 
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        className={`p-8 md:p-10 cursor-pointer flex justify-between items-center transition-all ${style.bg} hover:bg-white/5`}
      >
        <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-2xl shadow-2xl ${style.text}`}>
                <LightBulbIcon className="w-7 h-7" />
            </div>
            
            <div>
                <h3 className="text-2xl font-black text-white font-display italic tracking-tight mb-1">{title}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Suggestions Explorer • {ideas.length} Items</p>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <AnimatePresence>
                {isCardExpanded && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleCopySection}
                        disabled={isCopied}
                        className="p-3.5 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-inner"
                    >
                        {isCopied ? <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> : <CopyIcon className="w-5 h-5" />}
                    </motion.button>
                )}
            </AnimatePresence>
            
            <div className={`p-3.5 rounded-2xl bg-white/5 text-slate-400 transition-all duration-500 ${isCardExpanded ? 'rotate-180 bg-white/10 text-white' : ''}`}>
                <ChevronDownIcon className="w-6 h-6" />
            </div>
        </div>
      </div>

      <AnimatePresence>
          {isCardExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden no-print"
              >
                  <div className="p-8 md:p-10 border-t border-white/5 bg-slate-950/20">
                    <div className="flex flex-col space-y-6">
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
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default IdeaCard;
