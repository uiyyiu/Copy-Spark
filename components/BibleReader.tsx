import React, { useState, useEffect } from 'react';
import { bibleBooks, BibleBook } from '../utils/bibleData';
import { getBibleChapterText, getLinguisticAnalysis, getChapterInterpretation, getSimplifiedExplanation, BibleVerse, LinguisticAnalysisItem } from '../services/geminiService';
import { formatTextToHtml } from '../services/exportService';
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon, SpinnerIcon, RefreshIcon, LanguageIcon, XMarkIcon, InterpretationIcon, CopyIcon, CheckCircleIcon, ChildFaceIcon, BookmarkIcon, MaximizeIcon, MinimizeIcon, TextIncreaseIcon, TextDecreaseIcon, TypefaceIcon } from './icons';
import { saveLessonToLibrary } from '../services/supabase';

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
    
    // Selection State
    const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

    // Reading Settings State
    const [fontSize, setFontSize] = useState<number>(20);
    const [fontType, setFontType] = useState<FontType>('naskh');
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Linguistic Analysis States (Hebrew/Greek)
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState<LinguisticAnalysisItem[]>([]);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

    // Interpretation States
    const [showInterpretation, setShowInterpretation] = useState(false);
    const [interpretationData, setInterpretationData] = useState<string | null>(null);
    const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

    // Simplified Explanation States
    const [showSimpleExplanation, setShowSimpleExplanation] = useState(false);
    const [simpleExplanationData, setSimpleExplanationData] = useState<string | null>(null);
    const [isLoadingSimpleExplanation, setIsLoadingSimpleExplanation] = useState(false);

    // Saving States
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

    // Handle Escape key to exit focus mode
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
            alert("يجب عليك تسجيل الدخول لحفظ المحتوى.");
            return;
        }
        
        const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

        setIsSaving(true);
        try {
            await saveLessonToLibrary(user.id, title, content, userName);
            setSaveSuccess(title);
            setTimeout(() => setSaveSuccess(null), 3000);
        } catch (err) {
            console.error("Error saving:", err);
            alert("فشل الحفظ. حاول مرة أخرى.");
        } finally {
            setIsSaving(false);
        }
    };

    // Organize books by group for better UI
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
        // Reset secondary panels and selection when chapter changes
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
            setError(err.message || 'تعذر تحميل النص. يرجى المحاولة مرة أخرى.');
            console.error(err);
        } finally {
            setIsLoadingText(false);
        }
    };

    const fetchLinguisticAnalysisData = async () => {
        if (!selectedBook) return;
        setIsLoadingAnalysis(true);
        setShowAnalysis(true); // Open the panel immediately
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
                console.error(err);
                setInterpretationData("حدث خطأ في تحميل التفسير. يرجى المحاولة مرة أخرى.");
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
                console.error(err);
                setSimpleExplanationData("حدث خطأ في تحميل الشرح المبسط.");
            } finally {
                setIsLoadingSimpleExplanation(false);
            }
        }
    }

    const toggleVerseSelection = (verseNumber: number) => {
        setSelectedVerses(prev => {
            if (prev.includes(verseNumber)) {
                return prev.filter(v => v !== verseNumber);
            } else {
                return [...prev, verseNumber].sort((a, b) => a - b);
            }
        });
    };

    const handleCopyVerses = () => {
        const textToCopy = selectedVerses
            .map(vNum => {
                const verse = chapterText.find(v => v.number === vNum);
                return verse ? `(${vNum}) ${verse.text}` : '';
            })
            .join('\n');
        
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
        }
        setSelectedVerses([]);
    };

    // Font Control Logic
    const toggleFontType = () => setFontType(prev => prev === 'naskh' ? 'sans' : 'naskh');
    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 40));
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 14));

    const handleTestamentSelect = (testament: 'old' | 'new') => {
        setSelectedTestament(testament);
        setView('book-select');
    };

    const handleBookSelect = (book: BibleBook) => {
        setSelectedBook(book);
        setView('chapter-select');
    };

    const handleChapterSelect = (chapter: number) => {
        if (selectedBook) {
            fetchChapter(selectedBook, chapter);
        }
    };

    const handleNextChapter = () => {
        if (selectedBook && selectedChapter < selectedBook.chapters) {
            fetchChapter(selectedBook, selectedChapter + 1);
        }
    };

    const handlePrevChapter = () => {
        if (selectedBook && selectedChapter > 1) {
            fetchChapter(selectedBook, selectedChapter - 1);
        }
    };

    // Breadcrumb (Hide in Focus Mode)
    const Breadcrumb = () => {
        if (isFocusMode) return null;
        return (
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 font-serif">
                <button onClick={() => {setView('testament-select'); setSelectedBook(null); setSelectedTestament(null); setError(null);}} className="hover:text-white transition-colors">
                    الكتاب المقدس
                </button>
                {selectedTestament && (
                    <>
                        <span className="text-slate-600">/</span>
                        <button onClick={() => {setView('book-select'); setSelectedBook(null); setError(null);}} className="hover:text-white transition-colors">
                            {selectedTestament === 'old' ? 'العهد القديم' : 'العهد الجديد'}
                        </button>
                    </>
                )}
                {selectedBook && (
                    <>
                        <span className="text-slate-600">/</span>
                        <button onClick={() => {setView('chapter-select'); setError(null);}} className="hover:text-white transition-colors">
                            {selectedBook.name}
                        </button>
                    </>
                )}
                {view === 'reading' && (
                    <>
                        <span className="text-slate-600">/</span>
                        <span className="text-amber-400">الأصحاح {selectedChapter}</span>
                    </>
                )}
            </div>
        );
    }

    // --- VIEWS ---

    const TestamentSelect = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up max-w-4xl mx-auto mt-8">
            <button 
                onClick={() => handleTestamentSelect('old')}
                className="group relative overflow-hidden rounded-3xl bg-[#0f172a]/60 border border-white/10 p-8 h-64 flex flex-col items-center justify-center gap-6 hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-4xl">📜</span>
                </div>
                <h3 className="text-3xl font-bold text-white font-serif z-10">العهد القديم</h3>
                <p className="text-slate-400 text-sm z-10">الشريعة، التاريخ، الأنبياء</p>
            </button>

            <button 
                onClick={() => handleTestamentSelect('new')}
                className="group relative overflow-hidden rounded-3xl bg-[#0f172a]/60 border border-white/10 p-8 h-64 flex flex-col items-center justify-center gap-6 hover:border-sky-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
                 <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-4xl">✝️</span>
                </div>
                <h3 className="text-3xl font-bold text-white font-serif z-10">العهد الجديد</h3>
                <p className="text-slate-400 text-sm z-10">الأناجيل، الرسائل، الرؤيا</p>
            </button>
        </div>
    );

    const BookSelect = () => (
        <div className="animate-fade-in space-y-8 pb-20">
            {Object.entries(groupedBooks).map(([group, books]: [string, BibleBook[]]) => (
                <div key={group}>
                    <h3 className="text-xl font-bold text-amber-500 mb-4 font-serif border-b border-white/10 pb-2 inline-block px-2">
                        {group}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {books.map(book => (
                            <button
                                key={book.id}
                                onClick={() => handleBookSelect(book)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-xl p-4 text-center transition-all duration-200 hover:-translate-y-1"
                            >
                                <span className="text-slate-200 font-semibold font-serif block">{book.name}</span>
                                <span className="text-xs text-slate-500 mt-1 block">{book.chapters} أصحاح</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const ChapterSelect = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white font-serif mb-2">{selectedBook?.name}</h2>
                <p className="text-slate-400">اختر الأصحاح</p>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {Array.from({ length: selectedBook?.chapters || 0 }, (_, i) => i + 1).map(num => (
                    <button
                        key={num}
                        onClick={() => handleChapterSelect(num)}
                        className="aspect-square rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/50 flex items-center justify-center text-lg font-bold text-slate-300 hover:text-white transition-all"
                    >
                        {num}
                    </button>
                ))}
            </div>
             {isLoadingText && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <SpinnerIcon className="w-12 h-12 text-amber-500 animate-spin" />
                        <p className="text-white font-serif">جاري تحميل النص...</p>
                    </div>
                </div>
            )}
        </div>
    );

    const ReadingView = () => {
        const isOT = selectedBook?.testament === 'old';
        const analysisLabel = isOT ? 'الأصول العبرية' : 'الأصول اليونانية';
        const originalLabel = isOT ? 'عبري' : 'يوناني';
        const hasSelection = selectedVerses.length > 0;

        const containerClasses = isFocusMode 
            ? "fixed inset-0 z-50 bg-[#0f172a] overflow-y-auto px-4 pt-20 pb-32" 
            : "animate-fade-in max-w-4xl mx-auto pb-32 relative";

        return (
            <div className={containerClasses}>
                <div className={`sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-40 py-4 rounded-b-xl shadow-lg ${isFocusMode ? 'max-w-4xl mx-auto' : ''}`}>
                    {/* Reading Toolbar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 px-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button onClick={handlePrevChapter} disabled={!selectedBook || selectedChapter <= 1} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30">
                                <ChevronDownIcon className="w-5 h-5 rotate-90" />
                            </button>
                            <div className="text-center min-w-[100px]">
                                <h2 className="text-lg font-bold text-amber-500 font-serif">{selectedBook?.name}</h2>
                                <p className="text-xs text-slate-400">{selectedChapter}</p>
                            </div>
                            <button onClick={handleNextChapter} disabled={!selectedBook || selectedChapter >= (selectedBook.chapters || 0)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30">
                                <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                            </button>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-full p-1 border border-white/5">
                            <button onClick={decreaseFontSize} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10" title="تصغير الخط"><TextDecreaseIcon className="w-4 h-4" /></button>
                            <button onClick={toggleFontType} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10" title="تغيير نوع الخط"><TypefaceIcon className="w-4 h-4" /></button>
                            <button onClick={increaseFontSize} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10" title="تكبير الخط"><TextIncreaseIcon className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-white/10 mx-1"></div>
                            <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-2 rounded-full transition-colors ${isFocusMode ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} title={isFocusMode ? "إنهاء التركيز" : "وضع التركيز"}>
                                {isFocusMode ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Permanent Study Tools (outside Focus Mode) */}
                    {!isFocusMode && (
                        <div className="px-2 pt-4">
                            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-around gap-2">
                                <button onClick={fetchSimpleExplanationData} className="flex-1 p-2 rounded-lg hover:bg-green-500/20 text-green-300 hover:text-green-200 transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                                    <ChildFaceIcon className="w-5 h-5" /><span>مبسط</span>
                                </button>
                                <button onClick={fetchInterpretationData} className="flex-1 p-2 rounded-lg hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                                    <InterpretationIcon className="w-5 h-5" /><span>تفسير</span>
                                </button>
                                <button onClick={fetchLinguisticAnalysisData} className="flex-1 p-2 rounded-lg hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                                    <LanguageIcon className="w-5 h-5" /><span>{originalLabel}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Text Content */}
                <div className={`mt-4 mx-auto ${isFocusMode ? 'max-w-3xl' : ''}`}>
                     {isLoadingText ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4"><SpinnerIcon className="w-10 h-10 text-amber-500 animate-spin" /><p className="text-slate-500">جاري استدعاء النص...</p></div>
                     ) : (
                        <div className="flex flex-col space-y-2">
                            {chapterText.map((verse) => {
                                const isSelected = selectedVerses.includes(verse.number);
                                return (
                                    <div key={verse.number} onClick={() => toggleVerseSelection(verse.number)} className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 flex gap-4 items-start ${isSelected ? 'bg-amber-500/10' : 'hover:bg-white/5'}`}>
                                        <span className={`flex-shrink-0 inline-flex items-center justify-center h-6 min-w-[1.5rem] rounded text-xs font-bold mt-1 select-none ${isSelected ? 'bg-amber-500 text-black' : 'text-slate-500 bg-white/5'}`}>{verse.number}</span>
                                        <p className={`flex-grow leading-loose transition-colors ${isSelected ? 'text-amber-50' : 'text-slate-200'}`} style={{fontSize: `${fontSize}px`, fontFamily: fontType === 'naskh' ? '"Noto Naskh Arabic", serif' : '"Cairo", sans-serif', lineHeight: 2 }}>{verse.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                     )}
                </div>

                {!isFocusMode && (<div className="mt-12 text-center pb-8"><p className="text-xs text-slate-500 font-serif">ترجمة فاندايك - مرجعية موقع St-Takla.org</p></div>)}

                {/* Floating Action Bar (for selection and focus mode) */}
                {hasSelection && (
                    <div className="fixed bottom-6 left-0 right-0 z-[60] flex justify-center pointer-events-none animate-fade-in-up transition-all duration-300">
                        <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-2 flex items-center gap-2 pointer-events-auto">
                            <div className="px-3 py-2 border-l border-white/10 text-slate-300 text-sm font-bold"><span className="text-amber-400">{selectedVerses.length}</span></div>
                            <button onClick={handleCopyVerses} className="p-3 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex flex-col items-center gap-1.5 min-w-[60px]"><CopyIcon className="w-6 h-6" /><span className="text-[11px] font-bold">نسخ</span></button>
                            <div className="w-px h-8 bg-white/10"></div>
                            <button onClick={fetchSimpleExplanationData} className="p-3 rounded-xl hover:bg-green-500/20 text-green-300 hover:text-green-200 transition-colors flex flex-col items-center gap-1.5 min-w-[60px]"><ChildFaceIcon className="w-6 h-6" /><span className="text-[11px] font-bold">مبسط</span></button>
                            <button onClick={fetchInterpretationData} className="p-3 rounded-xl hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-colors flex flex-col items-center gap-1.5 min-w-[60px]"><InterpretationIcon className="w-6 h-6" /><span className="text-[11px] font-bold">تفسير</span></button>
                            <button onClick={fetchLinguisticAnalysisData} className="p-3 rounded-xl hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 transition-colors flex flex-col items-center gap-1.5 min-w-[60px]"><LanguageIcon className="w-6 h-6" /><span className="text-[11px] font-bold">{originalLabel}</span></button>
                            <button onClick={() => setSelectedVerses([])} className="p-2 ml-1 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
                
                {/* Modals are unchanged but are included for completeness */}
                {showSimpleExplanation && (
                     <div className="fixed inset-0 z-[70] flex justify-end pointer-events-none">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={() => setShowSimpleExplanation(false)}></div>
                        <div className="relative w-full max-w-2xl h-full bg-[#0f172a]/95 border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col animate-fade-in-right">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <div><h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif"><ChildFaceIcon className="w-5 h-5 text-green-400" />الشرح المبسط</h3><p className="text-xs text-slate-400 mt-1">{selectedVerses.length > 0 ? `للآيات: ${selectedVerses.join('، ')}` : 'للأصحاح بالكامل'}</p></div>
                                <div className="flex items-center gap-2">
                                    {simpleExplanationData && <button onClick={() => handleSaveContent(`شرح مبسط: ${selectedBook?.name} ${selectedChapter}`, { type: 'simple-explanation', body: simpleExplanationData })} disabled={isSaving} className={`p-2 rounded-lg text-slate-300 hover:text-green-400 hover:bg-green-500/10 transition-colors ${saveSuccess ? 'text-green-400' : ''}`}>{isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}</button>}
                                    <button onClick={() => setShowSimpleExplanation(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"><XMarkIcon className="w-6 h-6" /></button>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#1e293b]/30">
                                {isLoadingSimpleExplanation ? <div className="flex flex-col items-center justify-center h-full gap-6 text-center"><SpinnerIcon className="w-12 h-12 text-green-500 animate-spin" /><p className="text-slate-300 font-serif">جاري التبسيط...</p></div> : simpleExplanationData ? <div className="formatted-content spark-body-serif text-slate-200 font-sans leading-loose" dangerouslySetInnerHTML={{ __html: formatTextToHtml(simpleExplanationData) }} /> : <div className="text-center text-slate-500 py-10">لا يوجد شرح.</div>}
                            </div>
                        </div>
                    </div>
                )}
                {showInterpretation && (
                    <div className="fixed inset-0 z-[70] flex justify-end pointer-events-none">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={() => setShowInterpretation(false)}></div>
                        <div className="relative w-full max-w-2xl h-full bg-[#0f172a]/95 border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col animate-fade-in-right">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <div><h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif"><InterpretationIcon className="w-5 h-5 text-purple-400" />التفسير العميق</h3><p className="text-xs text-slate-400 mt-1">{selectedVerses.length > 0 ? `للآيات: ${selectedVerses.join('، ')}` : 'للأصحاح بالكامل'}</p></div>
                                <div className="flex items-center gap-2">
                                    {interpretationData && <button onClick={() => handleSaveContent(`تفسير: ${selectedBook?.name} ${selectedChapter}`, { type: 'interpretation', body: interpretationData })} disabled={isSaving} className={`p-2 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/10 transition-colors ${saveSuccess ? 'text-green-400' : ''}`}>{isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}</button>}
                                    <button onClick={() => setShowInterpretation(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"><XMarkIcon className="w-6 h-6" /></button>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#1e293b]/30">
                                {isLoadingInterpretation ? <div className="flex flex-col items-center justify-center h-full gap-6 text-center"><SpinnerIcon className="w-12 h-12 text-purple-500 animate-spin" /><p className="text-slate-300 font-serif">جاري التفسير...</p></div> : interpretationData ? <div className="formatted-content spark-body-serif text-slate-200" dangerouslySetInnerHTML={{ __html: formatTextToHtml(interpretationData) }} /> : <div className="text-center text-slate-500 py-10">لا يوجد تفسير.</div>}
                            </div>
                        </div>
                    </div>
                )}
                {showAnalysis && (
                    <div className="fixed inset-0 z-[70] flex justify-end pointer-events-none">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={() => setShowAnalysis(false)}></div>
                        <div className="relative w-full max-w-md h-full bg-[#0f172a]/95 border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col animate-fade-in-right">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <div><h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif"><LanguageIcon className="w-5 h-5 text-sky-400" />{analysisLabel}</h3><p className="text-xs text-slate-400 mt-1">{selectedVerses.length > 0 ? `للآيات: ${selectedVerses.join('، ')}` : 'للأصحاح'}</p></div>
                                <div className="flex items-center gap-2">
                                    {analysisData.length > 0 && <button onClick={() => handleSaveContent(`تحليل لغوي: ${selectedBook?.name} ${selectedChapter}`, { type: 'linguistic-analysis', body: analysisData })} disabled={isSaving} className={`p-2 rounded-lg text-slate-300 hover:text-sky-400 hover:bg-sky-500/10 transition-colors ${saveSuccess ? 'text-green-400' : ''}`}>{isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}</button>}
                                    <button onClick={() => setShowAnalysis(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"><XMarkIcon className="w-6 h-6" /></button>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {isLoadingAnalysis ? <div className="flex flex-col items-center justify-center h-64 gap-4 text-center"><SpinnerIcon className="w-10 h-10 text-sky-500 animate-spin" /><p className="text-slate-300 font-serif">جاري التحليل...</p></div> : analysisData.length > 0 ? analysisData.map((item, idx) => (
                                    <div key={idx} className="bg-[#1e293b]/60 border border-white/5 rounded-xl p-4 hover:border-sky-500/30 transition-colors">
                                        <div className="flex items-center gap-2 mb-2"><span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-0.5 rounded-md">آية {item.verseNumber}</span></div>
                                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                            <div className="bg-black/20 p-2 rounded-lg text-center"><span className="block text-xs text-slate-500 mb-1">عربي</span><span className="text-white font-serif">{item.arabicWord}</span></div>
                                            <div className="bg-sky-900/20 p-2 rounded-lg text-center border border-sky-500/10"><span className="block text-xs text-sky-400 mb-1">{originalLabel}</span><span className="text-white font-sans tracking-wide">{item.originalWord}</span></div>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-2"><span className="text-sky-400 font-bold text-lg ml-1">❝</span>{item.explanation}</p>
                                    </div>
                                )) : <div className="text-center text-slate-500 py-10">لا توجد ملاحظات.</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`w-full ${isFocusMode ? '' : 'min-h-[80vh]'} flex flex-col`}>
             {!isFocusMode && (
                <div className="flex items-center justify-center gap-3 mb-8">
                    <BookOpenIcon className="w-8 h-8 text-amber-500" />
                    <h1 className="text-4xl font-bold text-white font-serif drop-shadow-lg">الكتاب المقدس</h1>
                </div>
             )}

            <Breadcrumb />

            {error && !isFocusMode && (
                 <div className="w-full max-w-lg mx-auto mb-8 animate-fade-in-down">
                    <div className="bg-red-900/20 border border-red-500/40 rounded-xl p-4 flex items-center gap-4 text-red-200 shadow-lg backdrop-blur-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <XMarkIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-sm">حدث خطأ في التحميل</h4>
                            <p className="text-xs opacity-90">{error}</p>
                        </div>
                        <button onClick={() => selectedBook && fetchChapter(selectedBook, selectedChapter)} className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-400 transition-colors flex items-center gap-1"><RefreshIcon className="w-3 h-3" />إعادة المحاولة</button>
                    </div>
                 </div>
            )}

            {view === 'testament-select' && <TestamentSelect />}
            {view === 'book-select' && <BookSelect />}
            {view === 'chapter-select' && <ChapterSelect />}
            {view === 'reading' && <ReadingView />}
        </div>
    );
};

export default BibleReader;