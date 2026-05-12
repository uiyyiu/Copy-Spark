import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Idea } from '../types';
import { CheckCircleIcon, ReplaceIcon, ShareIcon, InfoIcon, SparklesIcon, ChevronDownIcon, SpinnerIcon } from './icons';

interface ActionButtonProps {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
    color?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, title, children, disabled, color = "amber" }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-${color}-400 hover:bg-${color}-500/10 disabled:opacity-50 transition-all border border-transparent hover:border-white/10`}
    >
        {children}
    </button>
);

interface IdeaItemProps {
    idea: Idea;
    index: number;
    color: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose';
    isLoading: boolean;
    isExpanded: boolean;
    onToggleSelect: () => void;
    onGenerateAlternative: () => void;
    onShare: () => void;
    onExplain: () => void;
    onToggleExpand: () => void;
}

const IdeaItem: React.FC<IdeaItemProps> = ({
    idea,
    index,
    color,
    isLoading,
    isExpanded,
    onToggleSelect,
    onGenerateAlternative,
    onShare,
    onExplain,
    onToggleExpand,
}) => {
    const [isJustUpdated, setIsJustUpdated] = useState(false);
    const prevTextRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (prevTextRef.current && prevTextRef.current !== idea.text) {
            setIsJustUpdated(true);
            const timer = setTimeout(() => setIsJustUpdated(false), 1000);
            return () => clearTimeout(timer);
        }
        prevTextRef.current = idea.text;
    }, [idea.text]);

    const colorConfig = {
        sky: 'sky', emerald: 'emerald', amber: 'amber', purple: 'purple', rose: 'rose'
    };
    const c = colorConfig[color];

    return (
        <div 
            className={`group rounded-2xl transition-all duration-500 border border-transparent relative overflow-hidden ${idea.selected ? `bg-${c}-500/5 border-${c}-500/20` : 'hover:bg-white/5'}`}
            dir="rtl"
        >
            <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={onToggleExpand}>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect();
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border ${idea.selected ? `bg-${c}-500/20 border-${c}-500/40 text-${c}-400` : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'}`}
                >
                    <CheckCircleIcon className="w-6 h-6" />
                </button>
                
                <span className={`text-sm font-black font-display italic tracking-widest ${idea.selected ? `text-${c}-400` : 'text-slate-500 opacity-60'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                </span>
                
                <p className={`flex-grow text-slate-200 font-spiritual italic text-lg leading-relaxed truncate transition-all ${isJustUpdated ? 'text-amber-400 font-bold' : ''}`}>
                    {idea.text}
                </p>
                
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {isLoading ? (
                        <SpinnerIcon className={`w-5 h-5 text-${c}-400 animate-spin`} />
                    ) : (
                        <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-all duration-500 ${isExpanded ? 'rotate-180 text-white' : ''}`} />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-14 pt-2 pb-6">
                            <p className="text-slate-300 font-spiritual italic text-lg leading-relaxed mb-6 border-r-2 border-white/10 pr-6">
                                {idea.text}
                            </p>
                            <div className="flex items-center gap-3">
                                {isLoading ? (
                                    <div className={`flex items-center gap-3 text-sm text-${c}-400 bg-${c}-500/10 px-4 py-2 rounded-xl`}>
                                        <SparklesIcon className="w-4 h-4 animate-pulse" />
                                        <span className="font-display italic font-bold">جاري الصقل...</span>
                                    </div>
                                ) : (
                                    <>
                                        <ActionButton onClick={onGenerateAlternative} title="توليد فكرة بديلة" color={c}>
                                            <ReplaceIcon className="w-5 h-5" />
                                        </ActionButton>
                                        <ActionButton onClick={onExplain} title="شرح طريقة التنفيذ" color={c}>
                                            <InfoIcon className="w-5 h-5" />
                                        </ActionButton>
                                        <ActionButton onClick={onShare} title="مشاركة الفكرة" color={c}>
                                            <ShareIcon className="w-5 h-5" />
                                        </ActionButton>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IdeaItem;
