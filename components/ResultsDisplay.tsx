
import React, { useState } from 'react';
import type { LessonPlan, Idea, IdeaSectionKey, AgeGroup } from '../types';
import IdeaCard from './IdeaCard';
import LessonExplanationDisplay from './LessonExplanationDisplay';
import ReferencesDisplay from './ReferencesDisplay';
import VerseExplanationDisplay from './VerseExplanationDisplay';
import LoadingSpinner from './LoadingSpinner';
import { 
  PaletteIcon, 
  PuzzleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  PrintIcon, 
  CopyIcon,
  SparklesIcon,
  RefreshIcon
} from './icons';
import { generateCraftActivities, generateWorksheetsAndColoring } from '../services/geminiService';
import { formatTextToHtml } from '../services/exportService';

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
  ageGroup?: string;
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
    ageGroup = 'ابتدائي'
}) => {

  // Custom states for the new on-demand generators
  const [craftContent, setCraftContent] = useState<string | null>(null);
  const [isCraftLoading, setIsCraftLoading] = useState<boolean>(false);
  const [isCraftExpanded, setIsCraftExpanded] = useState<boolean>(false);
  const [craftError, setCraftError] = useState<string | null>(null);

  const [worksheetContent, setWorksheetContent] = useState<string | null>(null);
  const [isWorksheetLoading, setIsWorksheetLoading] = useState<boolean>(false);
  const [isWorksheetExpanded, setIsWorksheetExpanded] = useState<boolean>(false);
  const [worksheetError, setWorksheetError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!lessonPlan) {
    return null;
  }

  // --- Handlers ---
  const handleGenerateCrafts = async () => {
    setIsCraftLoading(true);
    setCraftError(null);
    setIsCraftExpanded(true);
    try {
      const response = await generateCraftActivities(lessonTitle, spiritualObjective, ageGroup as AgeGroup);
      setCraftContent(response);
    } catch (err: any) {
      setCraftError(err.message || 'فشل في توليد الأنشطة اليدوية. حاول مرة أخرى.');
    } finally {
      setIsCraftLoading(false);
    }
  };

  const handleGenerateWorksheets = async () => {
    setIsWorksheetLoading(true);
    setWorksheetError(null);
    setIsWorksheetExpanded(true);
    try {
      const response = await generateWorksheetsAndColoring(lessonTitle, spiritualObjective, ageGroup as AgeGroup);
      setWorksheetContent(response);
    } catch (err: any) {
      setWorksheetError(err.message || 'فشل في توليد أوراق العمل والتلوين. حاول مرة أخرى.');
    } finally {
      setIsWorksheetLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ المحتوى بنجاح!');
  };

  const handlePrintSection = (title: string, content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl" lang="ar">
        <head>
          <title>${lessonTitle} - ${title}</title>
          <style>
            body { font-family: 'Cairo', sans-serif; padding: 20px; line-height: 1.6; }
            h1, h2 { color: #b45309; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <h1>${lessonTitle}</h1>
          <h2>${title}</h2>
          <div style="font-size: 1.1rem;">${formatTextToHtml(content)}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

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

            {/* --- ADDS PREMIUM CREATIVE TOOLS DESIGNED BY EXPERTS --- */}
            <div className="md:col-span-2 pt-2">
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl">
                    <SparklesIcon className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span className="text-white font-bold text-sm">أدوات إبداعية مساعدة في التحضير والأنشطة اليدوية لأقسام مدارس الأحد</span>
                </div>
            </div>

            {/* 6. Crafts Activity Generator - مولد الأشغال والأنشطة اليدوية */}
            <div className="md:col-span-2">
                <div className={`glass-card rounded-2xl shadow-lg border border-white/10 transition-all duration-300 overflow-hidden ${isCraftExpanded ? 'ring-1 ring-white/10' : ''}`}>
                    <div 
                      onClick={() => setIsCraftExpanded(!isCraftExpanded)}
                      className="p-5 cursor-pointer flex justify-between items-center bg-[#b45309]/10 hover:bg-[#b45309]/20 border-l-4 border-amber-500 transition-colors duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-slate-900/60 flex items-center justify-center border border-white/10 text-amber-400 shadow-inner">
                                <PaletteIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-md sm:text-lg font-bold text-white mb-0.5">مولد الأنشطة والأعمال اليدوية (Crafts) ✂️</h3>
                                <p className="text-xs text-slate-400 font-medium">خطوات، خامات بسيطة، وتطبيق روحي مبتكر</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {craftContent && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleGenerateCrafts(); }}
                                className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full transition"
                                title="إعادة التوليد"
                              >
                                <RefreshIcon className="w-4 h-4" />
                              </button>
                            )}
                            <div className={`p-2 rounded-full bg-white/5 text-slate-300 transition-transform ${isCraftExpanded ? 'rotate-180 bg-white/15' : ''}`}>
                                <ChevronDownIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className={`transition-all duration-300 ${isCraftExpanded ? 'block' : 'hidden'}`}>
                        <div className="p-5 border-t border-white/5 bg-slate-950/20">
                            {isCraftLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <LoadingSpinner />
                                    <span className="text-xs text-amber-400 font-medium animate-pulse">جاري ابتكار أفكار الأشغال اليدوية المناسبة للمرحلة السنية...</span>
                                </div>
                            ) : craftError ? (
                                <div className="text-center py-6">
                                    <p className="text-sm text-red-400 font-medium mb-3">{craftError}</p>
                                    <button onClick={handleGenerateCrafts} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg">إعادة المحاولة</button>
                                </div>
                            ) : craftContent ? (
                                <div className="space-y-4">
                                    <div 
                                      className="spark-body formatted-content text-slate-200"
                                      dangerouslySetInnerHTML={{ __html: formatTextToHtml(craftContent) }}
                                    />
                                    <div className="flex gap-2 justify-end border-t border-white/5 pt-4">
                                        <button 
                                          onClick={() => handleCopyText(craftContent)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium rounded-lg transition"
                                        >
                                            <CopyIcon className="w-4 h-4" />
                                            <span>نسخ</span>
                                        </button>
                                        <button 
                                          onClick={() => handlePrintSection('أنشطة الأشغال اليدوية', craftContent)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium rounded-lg transition"
                                        >
                                            <PrintIcon className="w-4 h-4" />
                                            <span>طباعة</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">يمكنك تفصيل أنشطة يدوية تفاعلية متكاملة بالخامات والخطوات والرسائل الروحية الموجهة للأطفال لهذا الدرس بضغطه واحدة:</p>
                                    <button 
                                      onClick={handleGenerateCrafts}
                                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl hover:from-amber-600 hover:to-yellow-700 transition shadow-lg shadow-amber-500/10"
                                    >
                                        ابتكر الأنشطة والأعمال اليدوية لهذا الدرس 🚀
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. Worksheets & Coloring Generator - مولد أوراق العمل والتلوين */}
            <div className="md:col-span-2">
                <div className={`glass-card rounded-2xl shadow-lg border border-white/10 transition-all duration-300 overflow-hidden ${isWorksheetExpanded ? 'ring-1 ring-white/10' : ''}`}>
                    <div 
                      onClick={() => setIsWorksheetExpanded(!isWorksheetExpanded)}
                      className="p-5 cursor-pointer flex justify-between items-center bg-[#0e5a8a]/10 hover:bg-[#0e5a8a]/20 border-l-4 border-sky-500 transition-colors duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-slate-900/60 flex items-center justify-center border border-white/10 text-sky-400 shadow-inner">
                                <PuzzleIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-md sm:text-lg font-bold text-white mb-0.5">مولد أوراق العمل الصيفية والتلوين (Worksheets) 🧩</h3>
                                <p className="text-xs text-slate-400 font-medium">أفكار تصميم التلوين، أسئلة ذكاء، ومسابقات للطباعة</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {worksheetContent && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleGenerateWorksheets(); }}
                                className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full transition"
                                title="إعادة التوليد"
                              >
                                <RefreshIcon className="w-4 h-4" />
                              </button>
                            )}
                            <div className={`p-2 rounded-full bg-white/5 text-slate-300 transition-transform ${isWorksheetExpanded ? 'rotate-180 bg-white/15' : ''}`}>
                                <ChevronDownIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className={`transition-all duration-300 ${isWorksheetExpanded ? 'block' : 'hidden'}`}>
                        <div className="p-5 border-t border-white/5 bg-slate-950/20">
                            {isWorksheetLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <LoadingSpinner />
                                    <span className="text-xs text-sky-400 font-medium animate-pulse">جاري تصميم ورقة العمل، والمسابقات المقترحة، ورسوم التلوين...</span>
                                </div>
                            ) : worksheetError ? (
                                <div className="text-center py-6">
                                    <p className="text-sm text-red-400 font-medium mb-3">{worksheetError}</p>
                                    <button onClick={handleGenerateWorksheets} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg">إعادة المحاولة</button>
                                </div>
                            ) : worksheetContent ? (
                                <div className="space-y-4">
                                    <div 
                                      className="spark-body formatted-content text-slate-200"
                                      dangerouslySetInnerHTML={{ __html: formatTextToHtml(worksheetContent) }}
                                    />
                                    <div className="flex gap-2 justify-end border-t border-white/5 pt-4">
                                        <button 
                                          onClick={() => handleCopyText(worksheetContent)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium rounded-lg transition"
                                        >
                                            <CopyIcon className="w-4 h-4" />
                                            <span>نسخ</span>
                                        </button>
                                        <button 
                                          onClick={() => handlePrintSection('أوراق العمل والتلوين', worksheetContent)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium rounded-lg transition"
                                        >
                                            <PrintIcon className="w-4 h-4" />
                                            <span>طباعة</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">بضغطة واحدة، يمكنك إعداد ورقة تلوين فنية للدرس، لغز مسلية كالمتاهات والرموز، إضافة لأسئلة استيعاب شيقة تناسب عمر الأطفال:</p>
                                    <button 
                                      onClick={handleGenerateWorksheets}
                                      className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl hover:from-sky-600 hover:to-blue-700 transition shadow-lg shadow-sky-500/10"
                                    >
                                        صمّم ورقة العمل والتمارين ومسابقات التلوين الآن 🎨
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 8. Lesson Explanation - شرح الدرس */}
            <div className="md:col-span-2">
                <LessonExplanationDisplay 
                    lessonElements={lessonElements} 
                    lessonBody={lessonBody} 
                    onOpenInNewPage={onOpenExplanation} 
                    onToggleChat={onToggleChat} 
                />
            </div>

             {/* 9. Verse Explanation - شرح الاية */}
             {lessonPlan.verseExplanation && scriptureVerse && (
                <div className="md:col-span-2">
                    <VerseExplanationDisplay 
                        verse={scriptureVerse} 
                        explanation={lessonPlan.verseExplanation} 
                    />
                </div>
            )}

            {/* 10. References - المراجع */}
            <div className="md:col-span-2">
                <ReferencesDisplay references={references} />
            </div>

        </div>
    </div>
  );
};

export default ResultsDisplay;
