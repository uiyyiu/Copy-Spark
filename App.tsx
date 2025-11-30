
import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ResultsDisplay from './components/ResultsDisplay';
import Modal from './components/Modal';
import ChatInterface from './components/ChatInterface';
import type { LessonPlan, Idea, IdeaSectionKey, AgeGroup, ChatMessage } from './types';
import { generateLessonIdeas, generateAlternativeIdea, explainIdea, generateSuggestedQuestions, generateGameIdeas, chatWithPatristicAI } from './services/geminiService';
import { parseLessonExplanation } from './services/exportService';
import Step1Basics from './components/Step1Basics';
import Step2Details from './components/Step2Details';
import ProgressIndicator from './components/ProgressIndicator';
import IntroScreen from './components/IntroScreen';
import ToolsDashboard, { ToolId } from './components/ToolsDashboard';
import GameBankForm from './components/GameBankForm';
import PatristicResearchForm from './components/PatristicResearchForm';
import BibleReader from './components/BibleReader';
import LoadingSpinner from './components/LoadingSpinner';
import InfoModal from './components/InfoModal';

const initialFormData = {
    lessonTitle: '',
    spiritualObjective: '',
    scriptureVerse: '',
    ageGroup: 'ابتدائي' as AgeGroup,
    lessonImages: [] as Array<{ data: string; mimeType: string }>,
};

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  
  // Tool States
  const [currentStep, setCurrentStep] = useState(1); // For Lesson Builder
  const [formData, setFormData] = useState(initialFormData);
  
  // Result States
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [gameResults, setGameResults] = useState<any[] | null>(null);
  
  // Chat State for Patristic Assistant
  const [patristicMessages, setPatristicMessages] = useState<ChatMessage[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [itemIsLoading, setItemIsLoading] = useState<Record<string, boolean>>({});
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    isShare: boolean;
  }>({ isOpen: false, title: '', content: '', isShare: false });

  // Info Modal State (Features, About, etc.)
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  
  const theme = 'dark';
  const toggleTheme = () => {}; 
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setLessonPlan(null);
    setGameResults(null);
    setPatristicMessages([]);
    setError(null);
    setIsLoading(false);
    setItemIsLoading({});
    setSuggestedQuestions([]);
    setCurrentStep(1);
    setSelectedTool(null);
  }, []);

  const { elements: lessonElements, lessonBody, references } = useMemo(() => {
    if (!lessonPlan) return { elements: [], lessonBody: '', references: [] };
    
    // If structured data exists from the API (new format), use it.
    if (lessonPlan.lessonElements && lessonPlan.lessonBody) {
        return {
            elements: lessonPlan.lessonElements,
            lessonBody: lessonPlan.lessonBody,
            references: lessonPlan.references || []
        };
    }

    // Fallback for legacy or error cases
    return parseLessonExplanation(lessonPlan.lessonExplanation);
  }, [lessonPlan]);

  const handleLessonSubmit = useCallback(async () => {
    if (!formData.lessonTitle.trim() || !formData.spiritualObjective.trim()) {
      setError('من فضلك املأ عنوان الدرس والهدف الروحي.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setLessonPlan(null);
    setCurrentStep(0); 

    try {
      const result = await generateLessonIdeas(formData.lessonTitle, formData.spiritualObjective, formData.ageGroup, formData.lessonImages, formData.scriptureVerse);
      setLessonPlan(result);
      
      // Generate questions based on the body if available, otherwise explanation
      const contextForQuestions = result.lessonBody || result.lessonExplanation;
      
      setIsLoadingSuggestions(true);
      generateSuggestedQuestions(contextForQuestions)
          .then(setSuggestedQuestions)
          .catch(e => console.error(e))
          .finally(() => setIsLoadingSuggestions(false));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleGamesSubmit = async (count: string, place: string, tools: string, goal: string) => {
      setIsLoading(true);
      setGameResults(null);
      setError(null);
      try {
          const games = await generateGameIdeas(count, place, tools, goal);
          setGameResults(games);
      } catch (err) {
          setError('حدث خطأ');
      } finally {
          setIsLoading(false);
      }
  };

  const handlePatristicMessage = async (userMessage: string) => {
      if (!userMessage.trim()) return;
      
      const newHistory = [...patristicMessages, { role: 'user' as const, content: userMessage }];
      setPatristicMessages(newHistory);
      setIsLoading(true);
      setError(null);

      try {
          const historyForApi = newHistory.filter(m => m.role !== 'model' || !m.content.includes('Error'));
          const response = await chatWithPatristicAI(historyForApi, userMessage);
          setPatristicMessages(prev => [...prev, { role: 'model' as const, content: response }]);
      } catch (err) {
          setError('حدث خطأ');
          setPatristicMessages(prev => [...prev, { role: 'model' as const, content: "عفواً، حدث خطأ في الاتصال." }]);
      } finally {
          setIsLoading(false);
      }
  };

  const updateIdea = (sectionKey: IdeaSectionKey, ideaId: string, newValues: Partial<Idea>) => {
      if (!lessonPlan) return;
      setLessonPlan(prev => {
          if (!prev) return null;
          const newPlan = { ...prev };
          if (sectionKey === 'verseGame' && newPlan.verseGame) {
            const section = newPlan.verseGame;
            const idx = section.ideas.findIndex(i => i.id === ideaId);
            if (idx > -1) { section.ideas[idx] = { ...section.ideas[idx], ...newValues }; }
          } else if (sectionKey !== 'verseGame') {
            const section = newPlan[sectionKey];
            const idx = section.ideas.findIndex(i => i.id === ideaId);
            if (idx > -1) { section.ideas[idx] = { ...section.ideas[idx], ...newValues }; }
          }
          return newPlan;
      });
  };

  const handlePrint = () => window.print();
  const handleExport = () => {}; 
  const handleExportPdf = () => {}; 

  const handleToggleSelect = useCallback((sectionKey: IdeaSectionKey, ideaId: string) => {
      if (!lessonPlan) return;
      let idea;
      if (sectionKey === 'verseGame' && lessonPlan.verseGame) { idea = lessonPlan.verseGame.ideas.find(i => i.id === ideaId); }
      else if (sectionKey !== 'verseGame') { idea = lessonPlan[sectionKey].ideas.find(i => i.id === ideaId); }
      if(idea) updateIdea(sectionKey, ideaId, { selected: !idea.selected });
  }, [lessonPlan]);

  const handleGenerateAlternative = useCallback(async (sectionKey: IdeaSectionKey, ideaId: string) => {
    if (!lessonPlan) return;
    let section = sectionKey === 'verseGame' ? lessonPlan.verseGame : lessonPlan[sectionKey];
    if (!section) return;
    const idea = section.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    setItemIsLoading(prev => ({ ...prev, [ideaId]: true }));
    try {
      const existingIdeas = section.ideas.map(i => i.text);
      const newIdeaText = await generateAlternativeIdea(formData.lessonTitle, formData.spiritualObjective, section.title, idea.text, existingIdeas, formData.ageGroup, formData.lessonImages, formData.scriptureVerse);
      updateIdea(sectionKey, ideaId, { text: newIdeaText });
    } catch (err) { console.error(err); } finally { setItemIsLoading(prev => ({ ...prev, [ideaId]: false })); }
  }, [lessonPlan, formData]);
  
  const handleShareIdea = (idea: Idea) => { /* ... */ };
  const handleExplainIdea = async (idea: Idea) => {
        setItemIsLoading(prev => ({ ...prev, [idea.id]: true }));
        try {
            const explanation = await explainIdea(idea.text, formData.ageGroup);
            setModalState({ isOpen: true, title: 'شرح الفكرة', content: explanation, isShare: false });
        } catch (err) { /* ... */ } finally {
            setItemIsLoading(prev => ({ ...prev, [idea.id]: false }));
        }
  };
  const handleOpenExplanation = () => { /* ... */ };

  const renderContent = () => {
      if (!showIntro && !selectedTool) {
          return <ToolsDashboard onSelectTool={setSelectedTool} />;
      }

      if (selectedTool === 'lesson-builder') {
          if (lessonPlan) {
              return (
                  <div className="max-w-2xl mx-auto w-full">
                    <ResultsDisplay 
                        isLoading={false}
                        lessonPlan={lessonPlan}
                        lessonTitle={formData.lessonTitle}
                        spiritualObjective={formData.spiritualObjective}
                        scriptureVerse={formData.scriptureVerse}
                        lessonElements={lessonElements}
                        lessonBody={lessonBody}
                        references={references}
                        itemIsLoading={itemIsLoading}
                        onToggleSelect={handleToggleSelect}
                        onGenerateAlternative={handleGenerateAlternative}
                        onShare={handleShareIdea}
                        onExplain={handleExplainIdea}
                        onOpenExplanation={handleOpenExplanation}
                        onToggleChat={() => setIsChatOpen(prev => !prev)}
                    />
                  </div>
              );
          }
          if (isLoading) return <LoadingSpinner />;

          if (currentStep === 1) {
              return <Step1Basics formData={formData} setFormData={setFormData} onNext={() => setCurrentStep(2)} toolId={selectedTool} />;
          }
          if (currentStep === 2) {
              return (
                  <div className="space-y-6 max-w-4xl mx-auto">
                      <ProgressIndicator currentStep={currentStep} totalSteps={2} />
                      <Step2Details formData={formData} setFormData={setFormData} onBack={() => setCurrentStep(1)} onSubmit={handleLessonSubmit} isLoading={isLoading} />
                  </div>
              );
          }
      }

      if (selectedTool === 'game-bank') {
          if (isLoading) return <LoadingSpinner />;
          if (gameResults) {
              return (
                  <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                      <h2 className="spark-h2 text-center text-white mb-6">بنك الألعاب</h2>
                      {gameResults.map((game, idx) => (
                          <div key={idx} className="glass-card p-6 rounded-2xl border-r-4 border-green-500/50">
                              <h3 className="text-xl font-bold text-green-400 mb-2">{game.title}</h3>
                              <p className="text-white mb-4">{game.description}</p>
                              <div className="bg-white/5 p-4 rounded-lg">
                                  <p className="text-slate-200 whitespace-pre-line">{game.rules}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              );
          }
          return <GameBankForm onSubmit={handleGamesSubmit} isLoading={isLoading} />;
      }

      if (selectedTool === 'patristic-assistant') {
          return (
              <PatristicResearchForm 
                messages={patristicMessages}
                onSendMessage={handlePatristicMessage}
                isLoading={isLoading}
              />
          );
      }

      if (selectedTool === 'bible-reader') {
        return <BibleReader />;
      }

      return null;
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 overflow-x-hidden`}>
      <div className="fixed inset-0 bg-[#050505]/80 pointer-events-none mix-blend-multiply z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-[#0f172a]/60 to-black/90 pointer-events-none z-0"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-amber-100/5 via-transparent to-transparent blur-3xl pointer-events-none z-0"></div>

      {showIntro && <IntroScreen onEnter={() => setShowIntro(false)} />}

      <div className={`relative z-10 flex flex-col min-h-screen transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        <Header 
            onReset={handleReset} 
            showActions={!!lessonPlan || !!gameResults || patristicMessages.length > 0} 
            onPrint={handlePrint}
            onExport={handleExport}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenInfoModal={setActiveInfoModal}
        />
        
        <main className={`flex-grow flex flex-col justify-center px-3 py-6 sm:px-6 lg:px-8 transition-all duration-500`}>
             {error && (
                <div className="max-w-4xl mx-auto w-full mb-6 bg-red-900/80 border border-red-600/50 text-red-200 px-4 py-3 rounded-lg relative text-center backdrop-blur-md" role="alert">
                    <strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {selectedTool && (
                <div className="w-full max-w-3xl mx-auto mb-4">
                    <button 
                        onClick={() => {
                            setSelectedTool(null);
                            setLessonPlan(null);
                            setGameResults(null);
                            setPatristicMessages([]);
                            setFormData(initialFormData);
                            setCurrentStep(1);
                        }}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transform rtl:rotate-180">
                            <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                        </svg>
                        العودة للأدوات
                    </button>
                </div>
            )}
            
            {renderContent()}
        </main>

        <Footer />
      </div>

      <Modal isOpen={modalState.isOpen} title={modalState.title} content={modalState.content} isShare={modalState.isShare} onClose={() => setModalState({...modalState, isOpen: false})} />
      
      <InfoModal activeModal={activeInfoModal} onClose={() => setActiveInfoModal(null)} />

      {lessonPlan && <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} lessonContext={lessonPlan.lessonBody || lessonPlan.lessonExplanation} suggestedQuestions={suggestedQuestions} isLoadingSuggestions={isLoadingSuggestions} />}
    </div>
  );
}

export default App;
    