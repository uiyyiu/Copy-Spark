import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase, saveLessonToLibrary, signOut, createPatristicChat, updatePatristicChat, getPatristicChats, deletePatristicChat, signInWithGoogle } from './services/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js'; 
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import ResultsDisplay from './components/ResultsDisplay';
import Modal from './components/Modal';
import ChatInterface from './components/ChatInterface';
import type { LessonPlan, Idea, IdeaSectionKey, AgeGroup, ChatMessage } from './types';
import { generateLessonIdeas, generateAlternativeIdea, explainIdea, generateSuggestedQuestions, generateGameIdeas, chatWithPatristicAI, generateCurriculum, CurriculumLesson } from './services/geminiService';
import { parseLessonExplanation } from './services/exportService';
import Step1Basics from './components/Step1Basics';
import Step2Details from './components/Step2Details';
import ProgressIndicator from './components/ProgressIndicator';
import IntroScreen from './components/IntroScreen';
import ToolsDashboard, { ToolId } from './components/ToolsDashboard';
import GameBankForm from './components/GameBankForm';
import CurriculumBuilderForm from './components/CurriculumBuilderForm';
import PatristicResearchForm from './components/PatristicResearchForm';
import BibleReader from './components/BibleReader';
import LoadingSpinner from './components/LoadingSpinner';
import InfoModal from './components/InfoModal';
import SavedItemsModal from './components/SavedItemsModal';
import SettingsModal from './components/SettingsModal';
import { BookOpenIcon, TargetIcon, LightBulbIcon, SparklesIcon } from './components/icons'; 

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
  const [curriculumResults, setCurriculumResults] = useState<CurriculumLesson[] | null>(null);
  
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
    setCurriculumResults(null);
    setPatristicMessages([]);
    setCurrentChatId(null); 
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
      if (!user) {
          if (confirm("يجب تسجيل الدخول لحفظ الدرس في مكتبتك.\nهل تريد تسجيل الدخول الآن؟")) {
              await signInWithGoogle();
          }
          return;
      }
      
      const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
      let titleToSave = "";
      let contentToSave = null;

      if (lessonPlan) {
          titleToSave = formData.lessonTitle;
          contentToSave = lessonPlan;
      } else if (curriculumResults) {
          titleToSave = `خطة منهج: ${curriculumResults[0]?.linkToObjective || 'بدون عنوان'}`;
          contentToSave = { lessonBody: JSON.stringify(curriculumResults) };
      } else {
          return;
      }

      setIsSaving(true);
      setError(null);
      try {
          await saveLessonToLibrary(user.id, titleToSave, contentToSave, userName);
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

  const handleCurriculumSubmit = async (objective: string, duration: number, ageGroup: AgeGroup, notes: string) => {
      setIsLoading(true);
      setCurriculumResults(null);
      setError(null);
      try {
          const results = await generateCurriculum(objective, duration, ageGroup, notes);
          setCurriculumResults(results);
      } catch (err: any) {
          setError(err.message || 'حدث خطأ في توليد المنهج');
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

          if (user) {
              if (currentChatId) {
                  await updatePatristicChat(currentChatId, updatedHistory);
              } else {
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
  
  const handleExplainIdea = async (idea: Idea) => {
        setItemIsLoading(prev => ({ ...prev, [idea.id]: true }));
        try {
            const explanation = await explainIdea(idea.text, formData.ageGroup);
            setModalState({ isOpen: true, title: 'شرح الفكرة', content: explanation, isShare: false });
        } catch (err) { /* ... */ } finally {
            setItemIsLoading(prev => ({ ...prev, [idea.id]: false }));
        }
  };

  const renderContent = () => {
      if (!showIntro && !selectedTool) {
          return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
            >
                <ToolsDashboard onSelectTool={setSelectedTool} user={user} />
            </motion.div>
          );
      }

      if (selectedTool === 'lesson-builder') {
          if (lessonPlan) {
              return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto w-full"
                >
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
                        onShare={() => {}}
                        onExplain={handleExplainIdea}
                        onOpenExplanation={() => {}}
                        onToggleChat={() => setIsChatOpen(prev => !prev)}
                    />
                </motion.div>
              );
          }
          if (isLoading) return <LoadingSpinner />;

          if (currentStep === 1) {
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Step1Basics formData={formData} setFormData={setFormData} onNext={() => setCurrentStep(2)} toolId={selectedTool} />
                </motion.div>
              );
          }
          if (currentStep === 2) {
              return (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8 max-w-4xl mx-auto"
                  >
                      <ProgressIndicator currentStep={currentStep} totalSteps={2} />
                      <Step2Details formData={formData} setFormData={setFormData} onBack={() => setCurrentStep(1)} onSubmit={handleLessonSubmit} isLoading={isLoading} />
                  </motion.div>
              );
          }
      }

      if (selectedTool === 'game-bank') {
          if (isLoading) return <LoadingSpinner />;
          if (gameResults) {
              return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-3xl mx-auto space-y-6"
                  >
                       {gameResults.map((game: any, index: number) => (
                           <motion.div 
                             key={index}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: index * 0.1 }}
                             className="glass-card p-8 rounded-[2rem] border border-emerald-500/10 hover:border-emerald-500/20"
                           >
                               <h3 className="text-2xl font-bold text-emerald-400 mb-4 font-display italic">{game.title}</h3>
                               <p className="text-slate-300 mb-6 font-spiritual text-lg italic leading-relaxed">{game.description}</p>
                               <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                                   <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest">طريقة اللعب:</h4>
                                   <p className="text-slate-300 text-base font-spiritual leading-relaxed italic">{game.rules}</p>
                               </div>
                           </motion.div>
                       ))}
                       <button onClick={() => setGameResults(null)} className="w-full py-4 mt-8 glass-card rounded-2xl text-slate-400 hover:text-white transition-all font-bold tracking-widest uppercase text-sm">عودة للمحرك</button>
                  </motion.div>
              );
          }
          return <GameBankForm onSubmit={handleGamesSubmit} isLoading={isLoading} />;
      }

      if (selectedTool === 'curriculum-builder') {
          if (isLoading) return <LoadingSpinner />;
          if (curriculumResults) {
              return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-5xl mx-auto space-y-12"
                  >
                      <div className="text-center mb-12">
                          <h2 className="text-5xl font-black text-white mb-4 font-display italic tracking-tighter">الخطة الاستراتيجية</h2>
                          <div className="h-1.5 w-32 bg-purple-500 mx-auto rounded-full mb-4"></div>
                          <p className="text-purple-300/80 font-spiritual italic text-xl">مسار نمو روحي متكامل وممنهج</p>
                      </div>
                      
                      <div className="space-y-12">
                          {curriculumResults.map((lesson, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-8 md:p-10 rounded-[2.5rem] border border-purple-500/10 hover:border-purple-500/30 group"
                              >
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                      <div className="flex items-center gap-6">
                                          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-2xl font-black text-purple-400 font-display">
                                              {lesson.week}
                                          </div>
                                          <div>
                                              <span className="text-[10px] font-bold text-purple-450 uppercase tracking-[0.2em] opacity-60 mb-2 block">الأسبوع الدراسي</span>
                                              <h3 className="text-3xl font-black text-white font-display italic tracking-tight group-hover:text-purple-400 transition-colors">{lesson.title}</h3>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                                          <BookOpenIcon className="w-6 h-6 text-amber-500/70" />
                                          <span className="text-lg text-slate-300 font-spiritual italic" dir="ltr">{lesson.scripture}</span>
                                      </div>
                                  </div>
                                  
                                  <p className="text-xl text-slate-300 mb-8 leading-relaxed font-spiritual italic border-r-4 border-purple-500/30 pr-6">{lesson.summary}</p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 hover:border-purple-600/20 transition-all">
                                          <div className="flex items-center gap-3 mb-4 text-purple-400">
                                              <TargetIcon className="w-5 h-5" />
                                              <span className="text-xs font-bold uppercase tracking-widest opacity-60">الرابط بالهدف</span>
                                          </div>
                                          <p className="text-base text-slate-300 leading-relaxed font-spiritual italic">{lesson.linkToObjective}</p>
                                      </div>
                                      <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 hover:border-amber-600/20 transition-all">
                                          <div className="flex items-center gap-3 mb-4 text-amber-400">
                                              <LightBulbIcon className="w-5 h-5" />
                                              <span className="text-xs font-bold uppercase tracking-widest opacity-60">المنهجية</span>
                                          </div>
                                          <p className="text-base text-slate-300 leading-relaxed font-spiritual italic">{lesson.methodology}</p>
                                      </div>
                                      <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 hover:border-emerald-600/20 transition-all">
                                          <div className="flex items-center gap-3 mb-4 text-emerald-400">
                                              <SparklesIcon className="w-5 h-5" />
                                              <span className="text-xs font-bold uppercase tracking-widest opacity-60">نشاط مقترح</span>
                                          </div>
                                          <p className="text-base text-slate-300 leading-relaxed font-spiritual italic">{lesson.activityIdea}</p>
                                      </div>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                      <button onClick={() => setCurriculumResults(null)} className="w-full py-5 glass-card rounded-[2rem] text-slate-400 hover:text-white transition-all font-bold tracking-widest uppercase text-xs mt-12">العودة للوحة التحكم</button>
                  </motion.div>
              );
          }
          return <CurriculumBuilderForm onSubmit={handleCurriculumSubmit} isLoading={isLoading} />;
      }

      if (selectedTool === 'patristic-assistant') {
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <PatristicResearchForm 
                    messages={patristicMessages}
                    onSendMessage={handlePatristicMessage}
                    isLoading={isLoading}
                    chatHistory={chatHistoryList}
                    currentChatId={currentChatId}
                    onNewChat={handlePatristicNewChat}
                    onLoadChat={handlePatristicLoadChat}
                    onDeleteChat={handlePatristicDeleteChat}
                />
            </motion.div>
          );
      }

      if (selectedTool === 'bible-reader') {
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <BibleReader user={user} />
            </motion.div>
          );
      }

      return null;
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-white`}>
      <div className="fixed inset-0 pointer-events-none z-[-2]">
          <div className="absolute inset-0 bg-slate-950"></div>
          <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-amber-500/5 blur-[12rem] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[5%] w-[40rem] h-[40rem] bg-blue-500/5 blur-[12rem] rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>
      
      {showIntro ? (
          <IntroScreen onEnter={() => setShowIntro(false)} />
      ) : (
          <div className="flex flex-col min-h-screen">
            <Header 
                onReset={handleReset} 
                showActions={!!lessonPlan || !!curriculumResults}
                onPrint={() => window.print()} 
                onExport={() => {}}
                onExportPdf={() => {}}
                onSave={(lessonPlan || curriculumResults) ? handleSave : undefined}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                isExportingPdf={isExportingPdf}
                theme={theme as 'light'|'dark'}
                toggleTheme={toggleTheme}
                onOpenSaved={() => setShowSavedModal(true)}
                onOpenInfoModal={(id) => setActiveInfoModal(id)}
                onOpenSettings={() => setShowSettingsModal(true)}
                user={user}
            />

            <main className="flex-grow container mx-auto px-4 py-12 relative z-10">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-6 rounded-[1.5rem] mb-10 text-center font-spiritual italic"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
                {renderContent()}
            </main>

            <Footer />

            <ChatInterface 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)}
                lessonContext={lessonPlan ? lessonPlan.lessonExplanation : ''}
                suggestedQuestions={suggestedQuestions}
                isLoadingSuggestions={isLoadingSuggestions}
            />

            <Modal
                isOpen={modalState.isOpen}
                title={modalState.title}
                content={modalState.content}
                isShare={modalState.isShare}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
            />

            <InfoModal 
                activeModal={activeInfoModal} 
                onClose={() => setActiveInfoModal(null)} 
            />

            <SavedItemsModal
                isOpen={showSavedModal}
                onClose={() => setShowSavedModal(false)}
                userId={user?.id}
            />

            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
          </div>
      )}
    </div>
  );
}

export default App;
