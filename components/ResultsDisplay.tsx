import React from 'react';
import { motion } from 'motion/react';
import type { LessonPlan, Idea, IdeaSectionKey } from '../types';
import IdeaCard from './IdeaCard';
import LessonExplanationDisplay from './LessonExplanationDisplay';
import ReferencesDisplay from './ReferencesDisplay';
import VerseExplanationDisplay from './VerseExplanationDisplay';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon, BookOpenIcon, TargetIcon } from './icons';

interface ResultsDisplayProps {
  isLoading: boolean;
  lessonPlan: LessonPlan | null;
  lessonTitle: string;
  spiritualObjective: string;
  scriptureVerse: string;
  lessonElements: string[];
  lessonBody: string;
  references: string[];
  itemIsLoading: Record<string, boolean>;
  onToggleSelect: (sectionKey: IdeaSectionKey, ideaId: string) => void;
  onGenerateAlternative: (sectionKey: IdeaSectionKey, ideaId: string) => void;
  onShare: (idea: Idea) => void;
  onExplain: (idea: Idea) => void;
  onOpenExplanation: () => void;
  onToggleChat: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
    isLoading,
    lessonPlan, 
    lessonTitle,
    spiritualObjective,
    scriptureVerse,
    lessonElements,
    lessonBody,
    references,
    itemIsLoading,
    onToggleSelect,
    onGenerateAlternative,
    onShare,
    onExplain,
    onOpenExplanation,
    onToggleChat,
}) => {

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!lessonPlan) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div id="lesson-plan-content" className="space-y-12 animate-fade-in pb-32" dir="rtl">
        {/* Cinematic Header Card */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 md:p-14 rounded-[3rem] border border-white/10 bg-slate-900/40 shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
            <div className="relative z-10 flex flex-col gap-6 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-4">
                    <SparklesIcon className="w-8 h-8 text-amber-500/70" />
                    <h1 className="text-4xl md:text-6xl font-black text-white font-display italic tracking-tight">{lessonTitle}</h1>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mt-4">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <TargetIcon className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">الهدف الروحي للمخدوم</span>
                        </div>
                        <p className="text-2xl text-slate-200 font-spiritual italic leading-relaxed">{spiritualObjective}</p>
                    </div>
                    
                    {scriptureVerse && (
                        <div className="w-full md:w-auto bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-inner">
                            <div className="flex items-center gap-3 text-amber-500/70 mb-2">
                                <BookOpenIcon className="w-5 h-5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">الشاهد الكتابي</span>
                            </div>
                            <p className="text-xl text-white font-spiritual font-bold italic" dir="ltr">{scriptureVerse}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>

        {/* Actionable Ideas Grid */}
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
            <motion.div variants={item}>
                <IdeaCard 
                    sectionKey="warmUp"
                    title={lessonPlan.warmUp.title} 
                    ideas={lessonPlan.warmUp.ideas} 
                    color="sky" 
                    itemIsLoading={itemIsLoading}
                    onToggleSelect={onToggleSelect}
                    onGenerateAlternative={onGenerateAlternative}
                    onShare={onShare}
                    onExplain={onExplain}
                />
            </motion.div>

            <motion.div variants={item}>
                <IdeaCard 
                    sectionKey="illustration"
                    title={lessonPlan.illustration.title} 
                    ideas={lessonPlan.illustration.ideas} 
                    color="emerald" 
                    itemIsLoading={itemIsLoading}
                    onToggleSelect={onToggleSelect}
                    onGenerateAlternative={onGenerateAlternative}
                    onShare={onShare}
                    onExplain={onExplain}
                />
            </motion.div>

            {lessonPlan.verseGame && lessonPlan.verseGame.ideas.length > 0 && (
                <motion.div variants={item}>
                    <IdeaCard 
                        sectionKey="verseGame"
                        title={lessonPlan.verseGame.title} 
                        ideas={lessonPlan.verseGame.ideas} 
                        color="amber" 
                        itemIsLoading={itemIsLoading}
                        onToggleSelect={onToggleSelect}
                        onGenerateAlternative={onGenerateAlternative}
                        onShare={onShare}
                        onExplain={onExplain}
                    />
                </motion.div>
            )}

            <motion.div variants={item}>
                <IdeaCard 
                    sectionKey="practice"
                    title={lessonPlan.practice.title} 
                    ideas={lessonPlan.practice.ideas} 
                    color="purple" 
                    itemIsLoading={itemIsLoading}
                    onToggleSelect={onToggleSelect}
                    onGenerateAlternative={onGenerateAlternative}
                    onShare={onShare}
                    onExplain={onExplain}
                />
            </motion.div>

            <motion.div variants={item} className="md:col-span-2">
                <IdeaCard 
                    sectionKey="application"
                    title={lessonPlan.application.title} 
                    ideas={lessonPlan.application.ideas} 
                    color="rose" 
                    itemIsLoading={itemIsLoading}
                    onToggleSelect={onToggleSelect}
                    onGenerateAlternative={onGenerateAlternative}
                    onShare={onShare}
                    onExplain={onExplain}
                />
            </motion.div>

            {/* Deep Content Sections */}
            <motion.div variants={item} className="md:col-span-2">
                <div className="glass-card rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                    <LessonExplanationDisplay 
                        lessonElements={lessonElements} 
                        lessonBody={lessonBody} 
                        onOpenInNewPage={onOpenExplanation} 
                        onToggleChat={onToggleChat} 
                    />
                </div>
            </motion.div>

            {lessonPlan.verseExplanation && scriptureVerse && (
                <motion.div variants={item} className="md:col-span-2">
                    <VerseExplanationDisplay 
                        verse={scriptureVerse} 
                        explanation={lessonPlan.verseExplanation} 
                    />
                </motion.div>
            )}

            <motion.div variants={item} className="md:col-span-2">
                <ReferencesDisplay references={references} />
            </motion.div>
        </motion.div>

        {/* Print only watermark */}
        <div className="print-only hidden opacity-20 text-center mt-20 border-t border-black pt-8">
            <p className="text-sm font-mono tracking-widest uppercase">Generated by SPARK Platform • Authentic Spiritual Growth</p>
        </div>
    </div>
  );
};

export default ResultsDisplay;
