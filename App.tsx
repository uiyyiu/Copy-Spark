

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase, saveLessonToLibrary, signOut, createPatristicChat, updatePatristicChat, getPatristicChats, deletePatristicChat, signInWithGoogle } from './services/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js'; 
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
import SavedItemsModal from './components/SavedItemsModal'; 

const initialFormData = {
    lessonTitle: '',
    spiritualObjective: '',
    scriptureVerse: '',
    ageGroup: 'ابتدائي' as AgeGroup,
    lessonImages: [] as Array<{ data: string; mimeType: string }>,
};

function App() {
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null); // Track active chat session
  const [chatHistoryList, setChatHistoryList] = useState<any[]>([]); // List of previous chats

  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false); 

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

  // Monitor Supabase Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Load Patristic Chat History when tool is selected
  useEffect(() => {
      if (selectedTool === 'patristic-assistant' && user) {
          refreshChatList();
      }
  }, [selectedTool, user]);

  const refreshChatList = async () => {
      if (!user) return;
      try {
          const chats = await getPatristicChats(user.id);
          setChatHistoryList(chats || []);
      } catch (e) {
          console.error("Failed to load chat history", e);
      }
  };

  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setLessonPlan(null);
    setGameResults(null);
    setPatristicMessages([]);
    setCurrentChatId(null); // Reset active chat
    setError(null);
    setIsLoading(false);
    setItemIsLoading({});
    setSuggestedQuestions([]);
    setCurrentStep(1);
    setSelectedTool(null);
    setSaveSuccess(false); 
  }, []);

  // Handle Saving Lesson Plan to Supabase
  const handleSave = async () => {
      if (!lessonPlan) return;

      if (!user) {
          if (confirm("يجب تسجيل الدخول لحفظ الدرس. هل تريد تسجيل الدخول الآن؟")) {
              await signInWithGoogle();
          }
          return;
      }
      
      const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

      setIsSaving(true);
      setError(null);
      try {
          await saveLessonToLibrary(user.id, formData.lessonTitle, lessonPlan, userName);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000); 
      } catch (err: any) {
          console.error("Save error:", err);
          setError("فشل حفظ الدرس. يرجى المحاولة مرة أخرى.");
      } finally {
          setIsSaving(false);
      }
  };

  const { elements: lessonElements, lessonBody, references } = useMemo(() => {
    if (!lessonPlan) return { elements: [], lessonBody: '', references: [] };
    
    if (lessonPlan.lessonElements && lessonPlan.lessonBody) {
        return {
            elements: lessonPlan.lessonElements,
            lessonBody: lessonPlan.lessonBody,
            references: lessonPlan.references || []
        };
    }

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
    setSaveSuccess(false);

    try {
      const result = await generateLessonIdeas(formData.lessonTitle, formData.spiritualObjective, formData.ageGroup, formData.lessonImages, formData.scriptureVerse);
      setLessonPlan(result);
      
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

  // Patristic Chat Handlers
  const handlePatristicNewChat = () => {
      setPatristicMessages([]);
      setCurrentChatId(null);
  };

  const handlePatristicLoadChat = (chat: any) => {
      setPatristicMessages(chat.messages);
      setCurrentChatId(chat.id);
  };

  const handlePatristicDeleteChat = async (id: string) => {
      if (!confirm("هل أنت متأكد من حذف هذه المحادثة؟")) return;
      try {
          await deletePatristicChat(id);
          setChatHistoryList(prev => prev.filter(c => c.id !== id));
          if (currentChatId === id) {
              handlePatristicNewChat();
          }
      } catch (e) {
          console.error("Failed to delete chat", e);
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
          
          const updatedHistory = [...newHistory, { role: 'model' as const, content: response }];
          setPatristicMessages(updatedHistory);

          // Save logic - Only if user is logged in
          if (user) {
              if (currentChatId) {
                  // Update existing chat
                  await updatePatristicChat(currentChatId, updatedHistory);
              } else {
                  // Create new chat (Title is first 40 chars of first message)
                  const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
                  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
                  
                  const newChat = await createPatristicChat(user.id, title, updatedHistory, userName);
                  if (newChat) {
                      setCurrentChatId(newChat.id);
                      setChatHistoryList(prev => [newChat, ...prev]);
                  }
              }
          }

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
          // Pass User to ToolsDashboard
          return <ToolsDashboard onSelectTool={setSelectedTool} user={user} />;
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
                chatHistory={chatHistoryList} // Pass history
                currentChatId={currentChatId} // Pass current ID
                onNewChat={handlePatristicNewChat}
                onLoadChat={handlePatristicLoadChat}
                onDeleteChat={handlePatristicDeleteChat}
              />
          );
      }

      if (selectedTool === 'bible-reader') {
        return <BibleReader user={user} />;
      }

      return null;
  };

  // Auth Guard: Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-serif">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // NOTE: Removed mandatory Sign In Screen. User is now passed as null if not logged in.

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
            onSave={handleSave} 
            isSaving={isSaving} 
            saveSuccess={saveSuccess}
            onSignOut={signOut} 
            onOpenSaved={() => setShowSavedModal(true)} 
            isExportingPdf={isExportingPdf}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenInfoModal={setActiveInfoModal}
            user={user} 
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
                            setCurrentChatId(null);
                            setFormData(initialFormData);
                            setCurrentStep(1);
                            setSaveSuccess(false);
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
      
      <SavedItemsModal isOpen={showSavedModal} onClose={() => setShowSavedModal(false)} userId={user?.id} />

      {lessonPlan && <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} lessonContext={lessonPlan.lessonBody || lessonPlan.lessonExplanation} suggestedQuestions={suggestedQuestions} isLoadingSuggestions={isLoadingSuggestions} />}
    </div>
  );
}

export default App;