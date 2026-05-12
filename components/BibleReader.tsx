import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { bibleBooks, BibleBook } from '../utils/bibleData';
import { getBibleChapterText, getLinguisticAnalysis, getChapterInterpretation, getSimplifiedExplanation, getBookIntroduction, BibleVerse, LinguisticAnalysisItem } from '../services/geminiService';
import { formatTextToHtml } from '../services/exportService';
import { BookOpenIcon, ChevronDownIcon, SpinnerIcon, RefreshIcon, LanguageIcon, XMarkIcon, InterpretationIcon, CopyIcon, CheckCircleIcon, ChildFaceIcon, BookmarkIcon, MaximizeIcon, MinimizeIcon, TextIncreaseIcon, TextDecreaseIcon, TypefaceIcon, InfoIcon } from './icons';
import { saveLessonToLibrary, signInWithGoogle } from '../services/supabase';

interface BibleReaderProps {
    isLoading?: boolean;
    user?: any;
}

type ViewState = 'testament-select' | 'book-select' | 'chapter-select' | 'reading';
type FontType = 'naskh' | 'sans';

const BibleReader: React.FC<BibleReaderProps> = ({ user }) => {
    const [view, setView] = useState<ViewState>('testament-select');
    const [selectedTestament, setSelectedTestament] = useState<'old' | 'new' | null>(null);
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [chapterText, setChapterText] = useState<BibleVerse[]>([]);
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
    const [fontSize, setFontSize] = useState<number>(24);
    const [fontType, setFontType] = useState<FontType>('naskh');
    const [isFocusMode, setIsFocusMode] = useState(false);

    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState<LinguisticAnalysisItem[]>([]);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

    const [showInterpretation, setShowInterpretation] = useState(false);
    const [interpretationData, setInterpretationData] = useState<string | null>(null);
    const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

    const [showSimpleExplanation, setShowSimpleExplanation] = useState(false);
    const [simpleExplanationData, setSimpleExplanationData] = useState<string | null>(null);
    const [isLoadingSimpleExplanation, setIsLoadingSimpleExplanation] = useState(false);

    const [showBookIntro, setShowBookIntro] = useState(false);
    const [bookIntroData, setBookIntroData] = useState<string | null>(null);
    const [isLoadingBookIntro, setIsLoadingBookIntro] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFocusMode) {
                setIsFocusMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode]);

    const handleSaveContent = async (title: string, content: any) => {
        if (!user) {
            if (confirm("يجب عليك تسجيل الدخول لحفظ المحتوى. هل تريد تسجيل الدخول الآن؟")) {
                await signInWithGoogle();
            }
            return;
        }
        setIsSaving(true);
        try {
            const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
            await saveLessonToLibrary(user.id, title, content, userName);
            setSaveSuccess(title);
            setTimeout(() => setSaveSuccess(null), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const groupedBooks = React.useMemo<Record<string, BibleBook[]>>(() => {
        if (!selectedTestament) return {};
        const books = bibleBooks.filter(b => b.testament === selectedTestament);
        const groups: Record<string, BibleBook[]> = {};
        books.forEach(book => {
            if (!groups[book.group]) groups[book.group] = [];
            groups[book.group].push(book);
        });
        return groups;
    }, [selectedTestament]);

    const fetchChapter = async (book: BibleBook, chapter: number) => {
        setIsLoadingText(true);
        setError(null);
        setAnalysisData([]); 
        setShowAnalysis(false);
        setInterpretationData(null);
        setShowInterpretation(false);
        setSimpleExplanationData(null);
        setShowSimpleExplanation(false);
        setSelectedVerses([]);

        try {
            const verses = await getBibleChapterText(book.name, chapter);
            setChapterText(verses);
            setSelectedChapter(chapter);
            setView('reading');
        } catch (err: any) {
            setError('تعذر تحميل النص الإلكتروني. يرجى مراجعة الاتصال.');
        } finally {
            setIsLoadingText(false);
        }
    };

    const fetchLinguisticAnalysisData = async () => {
        if (!selectedBook) return;
        setIsLoadingAnalysis(true);
        setShowAnalysis(true);
        try {
            const analysis = await getLinguisticAnalysis(selectedBook.name, selectedChapter, selectedBook.testament, selectedVerses);
            setAnalysisData(analysis);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    const fetchInterpretationData = async () => {
        if (!selectedBook) return;
        const shouldFetch = selectedVerses.length > 0 || !interpretationData;
        if (shouldFetch) {
            setIsLoadingInterpretation(true);
            setInterpretationData(null);
        }
        setShowInterpretation(true);
        if (shouldFetch) {
            try {
                const interpretation = await getChapterInterpretation(selectedBook.name, selectedChapter, selectedBook.testament, selectedVerses);
                setInterpretationData(interpretation);
            } catch (err) {
                setInterpretationData("حدث عائق تقني أثناء استدعاء التفسير.");
            } finally {
                setIsLoadingInterpretation(false);
            }
        }
    };

    const fetchSimpleExplanationData = async () => {
        if (!selectedBook) return;
        const shouldFetch = selectedVerses.length > 0 || !simpleExplanationData;
        if (shouldFetch) {
            setIsLoadingSimpleExplanation(true);
            setSimpleExplanationData(null);
        }
        setShowSimpleExplanation(true);
        if (shouldFetch) {
            try {
                const simpleExp = await getSimplifiedExplanation(selectedBook.name, selectedChapter, selectedVerses);
                setSimpleExplanationData(simpleExp);
            } catch (err) {
                setSimpleExplanationData("تعذر تبسيط النص حالياً.");
            } finally {
                setIsLoadingSimpleExplanation(false);
            }
        }
    }

    const fetchBookIntroductionData = async () => {
        if (!selectedBook) return;
        if (!bookIntroData) {
            setIsLoadingBookIntro(true);
            setBookIntroData(null);
        }
        setShowBookIntro(true);
        if (!bookIntroData) {
            try {
                const intro = await getBookIntroduction(selectedBook.name);
                setBookIntroData(intro);
            } catch (err) {
                setBookIntroData("تعذر تحميل مقدمة السفر.");
            } finally {
                setIsLoadingBookIntro(false);
            }
        }
    };

    const toggleVerseSelection = (verseNumber: number) => {
        setSelectedVerses(prev => prev.includes(verseNumber) ? prev.filter(v => v !== verseNumber) : [...prev, verseNumber].sort((a, b) => a - b));
    };

    const handleCopyVerses = () => {
        const textToCopy = selectedVerses.map(vNum => {
            const verse = chapterText.find(v => v.number === vNum);
            return verse ? `(${vNum}) ${verse.text}` : '';
        }).join('\n');
        if (textToCopy) navigator.clipboard.writeText(textToCopy);
        setSelectedVerses([]);
    };

    const handleBookSelect = (book: BibleBook) => {
        setSelectedBook(book);
        if (book.chapters === 1) {
            fetchChapter(book, 1);
        } else {
            setView('chapter-select');
        }
    };

    const handleChapterSelect = (chapter: number) => {
        if (selectedBook) {
            fetchChapter(selectedBook, chapter);
        }
    };

    const Breadcrumb = () => {
        if (isFocusMode) return null;
        return (
            <div className="flex items-center gap-3 text-xs font-black tracking-widest text-slate-500 mb-10 overflow-x-auto whitespace-nowrap pb-4 uppercase" dir="rtl">
                <button onClick={() => {setView('testament-select'); setSelectedBook(null); setSelectedTestament(null);}} className="hover:text-amber-500 transition-colors">المكتبة الكبرى</button>
                {selectedTestament && (
                    <>
                        <span className="opacity-30">/</span>
                        <button onClick={() => {setView('book-select'); setSelectedBook(null);}} className="hover:text-amber-500 transition-colors">{selectedTestament === 'old' ? 'العهد القديم' : 'العهد الجديد'}</button>
                    </>
                )}
                {selectedBook && (
                    <>
                        <span className="opacity-30">/</span>
                        <button onClick={() => setView('chapter-select')} className="hover:text-amber-500 transition-colors">{selectedBook.name}</button>
                    </>
                )}
                {view === 'reading' && (
                    <>
                        <span className="opacity-30">/</span>
                        <span className="text-amber-500 font-display italic">الأصحاح {selectedChapter}</span>
                    </>
                )}
            </div>
        );
    }

    const ReadingView = () => {
        const isOT = selectedBook?.testament === 'old';
        const originalLabel = isOT ? 'الأصل العبري' : 'الأصل اليوناني';
        const hasSelection = selectedVerses.length > 0;

        const containerClasses = isFocusMode 
            ? "fixed inset-0 z-[60] bg-slate-950 overflow-y-auto px-6 pt-24 pb-40 custom-scrollbar" 
            : "animate-fade-in max-w-5xl mx-auto pb-40 relative";

        return (
            <div className={containerClasses} dir="rtl">
                <div className={`sticky top-0 bg-slate-950/80 backdrop-blur-3xl z-50 py-6 rounded-b-[2rem] border-b border-white/5 shadow-2xl mb-10 transition-all ${isFocusMode ? 'max-w-4xl mx-auto px-8' : 'px-4'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => selectedChapter > 1 && fetchChapter(selectedBook!, selectedChapter - 1)} disabled={selectedChapter <= 1} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 disabled:opacity-20 transition-all"><ChevronDownIcon className="w-6 h-6 rotate-90" /></button>
                            <div className="text-center min-w-[120px]">
                                <h2 className="text-2xl font-black text-amber-500 font-display italic tracking-tight">{selectedBook?.name}</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-1">الأصحاح {selectedChapter}</p>
                            </div>
                            <button onClick={() => selectedBook && selectedChapter < selectedBook.chapters && fetchChapter(selectedBook, selectedChapter + 1)} disabled={!selectedBook || selectedChapter >= selectedBook.chapters} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 disabled:opacity-20 transition-all"><ChevronDownIcon className="w-6 h-6 -rotate-90" /></button>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-2xl border border-white/5">
                            <button onClick={() => setFontSize(s => Math.max(14, s-2))} className="p-3 text-slate-500 hover:text-white transition-colors"><TextDecreaseIcon className="w-5 h-5" /></button>
                            <div className="h-6 w-px bg-white/10"></div>
                            <button onClick={() => setFontType(t => t === 'naskh' ? 'sans' : 'naskh')} className="p-3 text-slate-500 hover:text-white transition-colors"><TypefaceIcon className="w-5 h-5" /></button>
                            <div className="h-6 w-px bg-white/10"></div>
                            <button onClick={() => setFontSize(s => Math.min(40, s+2))} className="p-3 text-slate-500 hover:text-white transition-colors"><TextIncreaseIcon className="w-5 h-5" /></button>
                            <div className="w-4"></div>
                            <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-3 rounded-xl transition-all ${isFocusMode ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}>
                                {isFocusMode ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`mt-10 mx-auto ${isFocusMode ? 'max-w-3xl' : ''}`}>
                    {isLoadingText ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-6">
                            <SpinnerIcon className="w-16 h-16 text-amber-500 animate-spin" />
                            <p className="text-slate-500 font-display italic tracking-widest uppercase text-xs opacity-60">Summoning Sacred Text...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {chapterText.map((verse) => {
                                const isSelected = selectedVerses.includes(verse.number);
                                return (
                                    <motion.div 
                                        key={verse.number} 
                                        onClick={() => toggleVerseSelection(verse.number)} 
                                        className={`group relative p-6 rounded-3xl cursor-pointer transition-all duration-700 flex gap-8 items-start border-2 ${isSelected ? 'bg-amber-500/10 border-amber-500/20 shadow-2xl' : 'hover:bg-white/5 border-transparent'}`}
                                    >
                                        <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${isSelected ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg shadow-amber-500/30' : 'text-slate-600 bg-slate-900 shadow-inner'}`}>{verse.number}</span>
                                        <p className={`flex-grow transition-colors duration-500 font-spiritual italic`} style={{fontSize: `${fontSize}px`, lineHeight: 1.8 }}>{verse.text}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {hasSelection && (
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-10 left-0 right-0 z-[70] flex justify-center px-4"
                        >
                            <div className="glass-card bg-slate-950/90 backdrop-blur-3xl border border-amber-500/30 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] p-3 flex items-center gap-2">
                                <div className="px-5 border-l border-white/10 text-amber-500 font-black font-display italic text-xl pr-6">{selectedVerses.length}</div>
                                <button onClick={handleCopyVerses} className="p-4 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white transition-all flex flex-col items-center gap-1 min-w-[70px]"><CopyIcon className="w-6 h-6" /><span className="text-[10px] uppercase font-black tracking-widest">Copy</span></button>
                                <div className="w-px h-10 bg-white/10 md:mx-2"></div>
                                <button onClick={fetchSimpleExplanationData} className="p-4 rounded-2xl hover:bg-emerald-500/10 text-emerald-400 transition-all flex flex-col items-center gap-1 min-w-[70px] group"><ChildFaceIcon className="w-6 h-6 group-hover:scale-110 transition-transform" /><span className="text-[10px] uppercase font-black tracking-widest">Simple</span></button>
                                <button onClick={fetchInterpretationData} className="p-4 rounded-2xl hover:bg-purple-500/10 text-purple-400 transition-all flex flex-col items-center gap-1 min-w-[70px] group"><InterpretationIcon className="w-6 h-6 group-hover:scale-110 transition-transform" /><span className="text-[10px] uppercase font-black tracking-widest">Study</span></button>
                                <button onClick={fetchLinguisticAnalysisData} className="p-4 rounded-2xl hover:bg-sky-500/10 text-sky-400 transition-all flex flex-col items-center gap-1 min-w-[70px] group"><LanguageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" /><span className="text-[10px] uppercase font-black tracking-widest">Origin</span></button>
                                <button onClick={() => setSelectedVerses([])} className="w-12 h-12 ml-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-all flex items-center justify-center"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto" dir="rtl">
            {!isFocusMode && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-4 mb-20 text-center"
                >
                    <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-2xl relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150"></div>
                        <BookOpenIcon className="w-10 h-10 text-amber-500 relative z-10" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white font-display italic tracking-tighter uppercase drop-shadow-2xl">الكتاب المقدس</h1>
                    <div className="h-1.5 w-24 bg-amber-500 rounded-full opacity-30 mt-2"></div>
                </motion.div>
            )}

            <Breadcrumb />

            {error && !isFocusMode && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl mx-auto mb-16 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 flex flex-col items-center gap-6"
                >
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500"><XMarkIcon className="w-8 h-8" /></div>
                    <div className="text-center">
                        <h4 className="text-xl font-bold text-white mb-2">عائق في الاتصال</h4>
                        <p className="text-rose-200/60 font-spiritual italic">{error}</p>
                    </div>
                    <button onClick={() => selectedBook && fetchChapter(selectedBook, selectedChapter)} className="px-10 py-4 bg-rose-500 text-slate-950 font-black uppercase text-xs rounded-2xl hover:bg-rose-400 transition-all flex items-center gap-3"><RefreshIcon className="w-4 h-4" /> محاولة ثانية</button>
                </motion.div>
            )}

            {view === 'testament-select' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    {[
                        { id: 'old' as const, title: 'العهد القديم', sub: 'النبوات والظلال', icon: '📜', color: 'amber' },
                        { id: 'new' as const, title: 'العهد الجديد', sub: 'الحق والمجد', icon: '✝️', color: 'sky' }
                    ].map((t, i) => (
                        <motion.button 
                            key={t.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => { setSelectedTestament(t.id); setView('book-select'); }}
                            className={`glass-card p-12 rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center gap-8 group relative overflow-hidden transition-all duration-700 hover:border-${t.color}-500/50 hover:-translate-y-4 hover:shadow-2xl`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-${t.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                            <div className={`w-24 h-24 rounded-[2rem] bg-${t.color}-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-all duration-700 group-hover:bg-${t.color}-500/20`}>
                                <span className="text-5xl group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{t.icon}</span>
                            </div>
                            <div className="text-center relative z-10">
                                <h3 className="text-4xl font-black text-white font-display italic tracking-tight mb-2 uppercase">{t.title}</h3>
                                <p className="text-slate-500 font-spiritual italic text-lg tracking-widest">{t.sub}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {view === 'book-select' && (
                <div className="space-y-16 pb-40">
                    {Object.entries(groupedBooks).map(([group, books], gIdx) => (
                        <motion.div 
                            key={group}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: gIdx * 0.1 }}
                        >
                            <h3 className="text-2xl font-black text-amber-500/60 mb-8 font-display italic uppercase tracking-widest border-r-4 border-amber-500/20 pr-6">{group}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {books.map((book, bIdx) => (
                                    <motion.button
                                        key={book.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: (gIdx * 0.1) + (bIdx * 0.02) }}
                                        onClick={() => handleBookSelect(book)}
                                        className="glass-card p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-500 text-center flex flex-col gap-2 group"
                                    >
                                        <span className="text-white font-black font-display italic text-lg group-hover:text-amber-400 transition-colors">{book.name}</span>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{book.chapters} CH</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {view === 'chapter-select' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto pb-40">
                    <div className="text-center mb-16">
                        <h2 className="text-6xl font-black text-white font-display italic tracking-tighter mb-10">{selectedBook?.name}</h2>
                        
                        <motion.button 
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={fetchBookIntroductionData}
                            className="group p-1 rounded-[3rem] bg-gradient-to-r from-amber-500/30 to-amber-900/30 inline-block shadow-2xl"
                        >
                            <div className="bg-slate-950/80 backdrop-blur-3xl px-12 py-6 rounded-[2.8rem] flex items-center gap-6 border border-white/5">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-500">
                                    <InfoIcon className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <span className="block text-amber-400 font-black text-2xl font-display italic tracking-tight">مقدِمة السفر</span>
                                    <span className="block text-slate-500 text-xs font-spiritual italic uppercase tracking-widest mt-1">تاريخ • لاهوت • برهان</span>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4">
                        {Array.from({ length: selectedBook?.chapters || 0 }, (_, i) => i + 1).map((num, i) => (
                            <motion.button
                                key={num}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.01 }}
                                onClick={() => handleChapterSelect(num)}
                                className="aspect-square rounded-2xl bg-white/5 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/50 flex items-center justify-center text-2xl font-black text-slate-400 hover:text-white transition-all font-display italic"
                            >
                                {num}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {view === 'reading' && <ReadingView />}

            <AnimatePresence>
                {(showBookIntro || showSimpleExplanation || showInterpretation || showAnalysis) && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex justify-end p-4 md:p-8 no-print"
                    >
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={() => {
                             setShowBookIntro(false); setShowSimpleExplanation(false); setShowInterpretation(false); setShowAnalysis(false);
                        }}></div>
                        
                        <motion.div 
                            initial={{ x: 600, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 600, opacity: 0 }}
                            className="relative w-full max-w-2xl h-full bg-slate-900/90 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden flex flex-col z-10"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800 shadow-inner ${
                                        showBookIntro ? 'text-amber-400' : showSimpleExplanation ? 'text-emerald-400' : showInterpretation ? 'text-purple-400' : 'text-sky-400'
                                    }`}>
                                        {showBookIntro ? <InfoIcon className="w-6 h-6" /> : showSimpleExplanation ? <ChildFaceIcon className="w-6 h-6" /> : showInterpretation ? <InterpretationIcon className="w-6 h-6" /> : <LanguageIcon className="w-6 h-6" />}
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-xl font-black text-white font-display italic tracking-tight">{showBookIntro ? 'مقدمات الأسفار' : showSimpleExplanation ? 'تبسيط العبارة' : showInterpretation ? 'تفسير الآيات' : 'أصول الكلمة'}</h3>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Sacred Analysis Layer</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => {
                                        const type = showBookIntro ? 'intro' : showSimpleExplanation ? 'simple' : showInterpretation ? 'study' : 'origin';
                                        const contentForSave = showBookIntro ? bookIntroData : showSimpleExplanation ? simpleExplanationData : showInterpretation ? interpretationData : analysisData;
                                        handleSaveContent(`AI Research - ${selectedBook?.name} ${type}`, contentForSave);
                                    }} className={`p-3 rounded-xl hover:bg-white/5 transition-all ${saveSuccess ? 'text-emerald-400' : 'text-slate-400'}`}>{isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}</button>
                                    <button onClick={() => {
                                         setShowBookIntro(false); setShowSimpleExplanation(false); setShowInterpretation(false); setShowAnalysis(false);
                                    }} className="p-3 text-slate-500 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-slate-950/20 shadow-inner">
                                {(isLoadingBookIntro || isLoadingSimpleExplanation || isLoadingInterpretation || isLoadingAnalysis) ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
                                        <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                                        <p className="text-slate-500 font-display italic tracking-[0.4em] uppercase text-[10px] animate-pulse">Filtering through the ages...</p>
                                    </div>
                                ) : showAnalysis ? (
                                    <div className="space-y-6">
                                        {analysisData.map((item, idx) => (
                                            <div key={idx} className="glass-card bg-white/5 border border-white/5 rounded-3xl p-6 group hover:border-sky-500/30 transition-all duration-500">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">Verse {item.verseNumber}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-slate-950 p-4 rounded-2xl text-center border border-white/5"><span className="block text-[9px] text-slate-600 font-black uppercase mb-2 tracking-widest">Arabic</span><span className="text-white font-spiritual text-xl italic">{item.arabicWord}</span></div>
                                                    <div className="bg-sky-950/30 p-4 rounded-2xl text-center border border-sky-500/20"><span className="block text-[9px] text-sky-600 font-black uppercase mb-2 tracking-widest">Linguistic</span><span className="text-white font-sans text-xl tracking-wider">{item.originalWord}</span></div>
                                                </div>
                                                <p className="text-slate-300 font-spiritual italic leading-relaxed pt-4 border-t border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">{item.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div 
                                        className="formatted-content font-spiritual italic text-slate-300 leading-loose prose prose-invert max-w-none text-xl" 
                                        dangerouslySetInnerHTML={{ __html: formatTextToHtml(bookIntroData || simpleExplanationData || interpretationData || '') }} 
                                    />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BibleReader;
