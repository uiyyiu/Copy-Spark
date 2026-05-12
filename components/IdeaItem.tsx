import React, { useState, useEffect, useRef } from 'react';
import { Idea } from '../types';
import { CheckCircleIcon, ReplaceIcon, ShareIcon, InfoIcon, SparklesIcon, ChevronDownIcon, SpinnerIcon } from './icons';

interface ActionButtonProps {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, title, children, disabled }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className="p-1.5 rounded-full text-[var(--text-light-secondary)] hover:bg-gray-500/10 hover:text-[var(--text-light-primary)] disabled:opacity-50 transition-colors"
    >
        {children}
    </button>
);

interface IdeaItemProps {
    idea: Idea;
    index: number;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
    isLoading: boolean;
    isExpanded: boolean;
    onToggleSelect: () => void;
    onGenerateAlternative: () => void;
    onShare: () => void;
    onExplain: () => void;
    onToggleExpand: () => void;
}

const colorClasses = {
    blue:   { bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300', ring: 'ring-blue-500' },
    green:  { bg: 'bg-green-500/10', text: 'text-green-700 dark:text-green-300', ring: 'ring-green-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-300', ring: 'ring-purple-500' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-700 dark:text-orange-300', ring: 'ring-orange-500' },
    yellow: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-500' },
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
    const selectedClasses = colorClasses[color];
    const [isJustUpdated, setIsJustUpdated] = useState(false);
    const prevTextRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (prevTextRef.current && prevTextRef.current !== idea.text) {
            setIsJustUpdated(true);
            const timer = setTimeout(() => setIsJustUpdated(false), 700); // Animation duration
            return () => clearTimeout(timer);
        }
        prevTextRef.current = idea.text;
    }, [idea.text]);

    return (
        <div 
            className={`idea-item rounded-lg transition-all duration-300 ${idea.selected ? `${selectedClasses.bg} selected` : 'bg-transparent hover:bg-gray-500/5'}`}
        >
            <div className="flex items-center gap-2 p-2 cursor-pointer" onClick={onToggleExpand}>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect();
                    }}
                    title={idea.selected ? "إلغاء التحديد" : "تحديد كفكرة مختارة"}
                    className="p-1 rounded-full flex-shrink-0"
                >
                    <CheckCircleIcon className={`w-6 h-6 transition-colors ${idea.selected ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-400'}`} />
                </button>
                
                <span className={`font-semibold spark-caption ${idea.selected ? selectedClasses.text : 'text-[var(--text-light-secondary)]'}`}>
                    {index + 1}.
                </span>
                
                <p className={`spark-body flex-grow text-[var(--text-light-primary)] truncate ${isJustUpdated ? 'animate-flash' : ''}`}>{idea.text}</p>
                
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center pl-2">
                    {isLoading ? (
                        <SpinnerIcon className="w-5 h-5 text-[var(--accent-gold)] animate-spin" />
                    ) : (
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                </div>
            </div>

            {isExpanded && (
                 <div className="animate-fade-in-down pl-12 pr-4 pb-3">
                    <p className="spark-body text-[var(--text-light-secondary)] whitespace-normal mb-3">{idea.text}</p>
                    <div className="flex items-center gap-1">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-[var(--accent-gold)] h-8">
                                <SparklesIcon className="w-4 h-4 animate-pulse" />
                                <span className="spark-caption">جاري العمل...</span>
                            </div>
                        ) : (
                            <>
                                <ActionButton onClick={onGenerateAlternative} title="توليد فكرة بديلة">
                                    <ReplaceIcon className="w-5 h-5" />
                                </ActionButton>
                                <ActionButton onClick={onExplain} title="شرح طريقة التنفيذ">
                                    <InfoIcon className="w-5 h-5" />
                                </ActionButton>
                                <ActionButton onClick={onShare} title="مشاركة الفكرة">
                                    <ShareIcon className="w-5 h-5" />
                                </ActionButton>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdeaItem;