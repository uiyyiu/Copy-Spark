
import React from 'react';
import type { LessonPlan, Idea, IdeaSectionKey } from '../types';
import IdeaCard from './IdeaCard';
import LessonExplanationDisplay from './LessonExplanationDisplay';
import ReferencesDisplay from './ReferencesDisplay';
import VerseExplanationDisplay from './VerseExplanationDisplay';
import LoadingSpinner from './LoadingSpinner';

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

  return (
    <div id="lesson-plan-content" className="space-y-6 animate-fade-in pb-20">
        <div className="print-only hidden mb-8 text-center border-b-2 border-black pb-4">
            <h1 className="spark-h1 print-header-title">{lessonTitle}</h1>
            <p className="spark-body print-header-objective">{spiritualObjective}</p>
        </div>

        {/* Grid Layout for Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            
            {/* 1. Warm Up - التمهيد */}
            <IdeaCard 
                sectionKey="warmUp"
                title={lessonPlan.warmUp.title} 
                ideas={lessonPlan.warmUp.ideas} 
                color="blue" 
                itemIsLoading={itemIsLoading}
                onToggleSelect={onToggleSelect}
                onGenerateAlternative={onGenerateAlternative}
                onShare={onShare}
                onExplain={onExplain}
            />

             {/* 2. Illustration - وسيلة الايضاح */}
             <IdeaCard 
                sectionKey="illustration"
                title={lessonPlan.illustration.title} 
                ideas={lessonPlan.illustration.ideas} 
                color="green" 
                itemIsLoading={itemIsLoading}
                onToggleSelect={onToggleSelect}
                onGenerateAlternative={onGenerateAlternative}
                onShare={onShare}
                onExplain={onExplain}
            />

             {/* 3. Verse Game - لعبة الاية */}
             {lessonPlan.verseGame && lessonPlan.verseGame.ideas.length > 0 && (
                <IdeaCard 
                    sectionKey="verseGame"
                    title={lessonPlan.verseGame.title} 
                    ideas={lessonPlan.verseGame.ideas} 
                    color="yellow" 
                    itemIsLoading={itemIsLoading}
                    onToggleSelect={onToggleSelect}
                    onGenerateAlternative={onGenerateAlternative}
                    onShare={onShare}
                    onExplain={onExplain}
                />
            )}

             {/* 4. Practice - التدريب */}
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

            {/* 5. Application - التطبيق */}
            <IdeaCard 
                sectionKey="application"
                title={lessonPlan.application.title} 
                ideas={lessonPlan.application.ideas} 
                color="orange" 
                itemIsLoading={itemIsLoading}
                onToggleSelect={onToggleSelect}
                onGenerateAlternative={onGenerateAlternative}
                onShare={onShare}
                onExplain={onExplain}
            />

            {/* 6. Lesson Explanation - شرح الدرس */}
            <div className="md:col-span-2">
                <LessonExplanationDisplay 
                    lessonElements={lessonElements} 
                    lessonBody={lessonBody} 
                    onOpenInNewPage={onOpenExplanation} 
                    onToggleChat={onToggleChat} 
                />
            </div>

             {/* 7. Verse Explanation - شرح الاية */}
             {lessonPlan.verseExplanation && scriptureVerse && (
                <div className="md:col-span-2">
                    <VerseExplanationDisplay 
                        verse={scriptureVerse} 
                        explanation={lessonPlan.verseExplanation} 
                    />
                </div>
            )}

            {/* 8. References - المراجع */}
            <div className="md:col-span-2">
                <ReferencesDisplay references={references} />
            </div>

        </div>
    </div>
  );
};

export default ResultsDisplay;
