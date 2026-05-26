
import React, { useState, useEffect } from 'react';
import { bibleBooks, BibleBook } from '../utils/bibleData';
import { getBibleChapterText, getLinguisticAnalysis, getChapterInterpretation, getSimplifiedExplanation, getBookIntroduction, BibleVerse, LinguisticAnalysisItem, searchThematicBible, ThematicSearchResult, generateLessonHooks, LessonHookResult } from '../services/geminiService';
import { formatTextToHtml } from '../services/exportService';
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon, SpinnerIcon, RefreshIcon, LanguageIcon, XMarkIcon, InterpretationIcon, CopyIcon, CheckCircleIcon, ChildFaceIcon, BookmarkIcon, MaximizeIcon, MinimizeIcon, TextIncreaseIcon, TextDecreaseIcon, TypefaceIcon, InfoIcon, SparklesIcon, LightBulbIcon } from './icons';
import { saveLessonToLibrary, signInWithGoogle } from '../services/supabase';
import GuidedTour, { TourStep } from './GuidedTour';
import { HelpCircle } from 'lucide-react';

interface BibleReaderProps {
    isLoading?: boolean;
    user?: any;
}

type ViewState = 'testament-select' | 'book-select' | 'chapter-select' | 'reading';
type FontType = 'naskh' | 'sans';

const BibleReader: React.FC<BibleReaderProps> = ({ user }) => {
    const [view, setView] = useState<ViewState>('testament-select');
    const [isTourOpen, setIsTourOpen] = useState(false);

    const tourSteps: TourStep[] = [
        {
            targetId: 'tour-bible-trigger-btn',
            title: 'مرحباً بك في قارئ الكتاب المقدس 📖',
            description: 'هذا الركن يمنحك تجربة تفاعلية وبحثية قوية للغاية لدراسة وتحليل كلمة الله لمساعدتك في تحضير الدروس أو للتأمل الذاتي والمقارنة اللغوية.',
            position: 'bottom'
        },
        {
            targetId: 'tour-bible-thematic-search-card',
            title: 'الباحث الموضوعي الذكي بالذكاء الاصطناعي 🔮',
            description: 'اكتب هنا موضوع درسك أو القضية التي تبحث عن آيات وتطبيقات تخصها (مثال: مواجهة القلق، فضيلة الاتضاع، صلاة يسوع). سيقوم الذكاء الاصطناعي بمسح الأسفار وتوليد خطة تطبيقية كاملة وموثقة مذهلة!',
            position: 'bottom'
        },
        {
            targetId: 'tour-bible-testament-cards',
            title: 'تصفح وقراءة الأسفار التقليدي 📜',
            description: 'اختر العهد القديم أو العهد الجديد لتصفح الأسفار وقراءة الأصحاحات مباشرة مع توفير تفسيرات لاهوتية، مقارنات للكلمات العبرية واليونانية الأصلية وشروحات مبسطة للأطفال!',
            position: 'top'
        }
    ];
    const [selectedTestament, setSelectedTestament] = useState<'old' | 'new' | null>(null);
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [chapterText, setChapterText] = useState<BibleVerse[]>([]);
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isOT = selectedBook?.testament === 'old';
    const analysisLabel = isOT ? 'الأصول العبرية' : 'الأصول اليونانية';
    const originalLabel = isOT ? 'عبري' : 'يوناني';
    
    // Selection State
    const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

    // Reading Settings State
    const [fontSize, setFontSize] = useState<number>(20);
    const [fontType, setFontType] = useState<FontType>('naskh');
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Semantic Search States (الباحث الموضوعي الذكي)
    const [themeQuery, setThemeQuery] = useState('');
    const [isSearchingTheme, setIsSearchingTheme] = useState(false);
    const [themeResults, setThemeResults] = useState<ThematicSearchResult[] | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Lesson Hook Generator States (المقترح لمقدمة الدرس)
    const [showHooks, setShowHooks] = useState(false);
    const [isLoadingHooks, setIsLoadingHooks] = useState(false);
    const [lessonHooks, setLessonHooks] = useState<LessonHookResult[] | null>(null);
    const [hooksError, setHooksError] = useState<string | null>(null);

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

    // Book Introduction States
    const [showBookIntro, setShowBookIntro] = useState(false);
    const [bookIntroData, setBookIntroData] = useState<string | null>(null);
    const [isLoadingBookIntro, setIsLoadingBookIntro] = useState(false);

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

    // Lock body-scroll when any slide-up bottom sheet is open on mobile/desktop
    useEffect(() => {
        const isAnySheetOpen = showBookIntro || showSimpleExplanation || showInterpretation || showAnalysis || showHooks;
        if (isAnySheetOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showBookIntro, showSimpleExplanation, showInterpretation, showAnalysis, showHooks]);

    const handleSaveContent = async (title: string, content: any) => {
        if (!user) {
            if (confirm("يجب عليك تسجيل الدخول لحفظ المحتوى. هل تريد تسجيل الدخول الآن؟")) {
                await signInWithGoogle();
            }
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

    const handleThemeSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!themeQuery.trim()) return;
        setIsSearchingTheme(true);
        setSearchError(null);
        setThemeResults(null);
        try {
            const results = await searchThematicBible(themeQuery);
            setThemeResults(results);
        } catch (err: any) {
            setSearchError(err.message || 'فشل البحث الموضوعي. حاول مرة أخرى.');
        } finally {
            setIsSearchingTheme(false);
        }
    };

    const handleFetchHooks = async () => {
        if (!selectedBook) return;
        setIsLoadingHooks(true);
        setHooksError(null);
        setLessonHooks(null);
        setShowHooks(true);
        try {
            const textString = chapterText.map(v => `${v.number}. ${v.text}`).join('\n');
            const hooks = await generateLessonHooks(selectedBook.name, selectedChapter, textString);
            setLessonHooks(hooks);
        } catch (err: any) {
            setHooksError(err.message || 'فشل استخراج الأفكار التشويقية.');
        } finally {
            setIsLoadingHooks(false);
        }
    };

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
                console.error(err);
                setBookIntroData("حدث خطأ في تحميل مقدمة السفر.");
            } finally {
                setIsLoadingBookIntro(false);
            }
        }
    };

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
        setBookIntroData(null); // Reset intro when book changes
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
    const renderBreadcrumb = () => {
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
    };

    // --- VIEWS ---

    // --- VIEWS ---

    const renderTestamentSelect = () => {
        const handleCopyResult = (item: ThematicSearchResult) => {
            const formatted = `الشاهد: ${item.reference}\n\nالآيات:\n${item.versesText}\n\nالمثال والشخصية والقصة العملية:\n${item.biblicalExamples || 'غير متوفر'}\n\nالملاءمة والدلالة:\n${item.relevanceExplanation}\n\nآية الحفظ للأطفال:\n${item.suggestedMemoryVerse}\n\nتطبيق ونشاط تفاعلي:\n${item.lessonApplication}`;
            navigator.clipboard.writeText(formatted);
            alert("تم نسخ النتيجة بالكامل إلى الحافظة!");
        };

        const handleSaveSearchResult = async (item: ThematicSearchResult) => {
            await handleSaveContent(`بحث موضوعي: ${themeQuery} (${item.reference})`, {
                type: 'thematic-search',
                query: themeQuery,
                reference: item.reference,
                versesText: item.versesText,
                relevanceExplanation: item.relevanceExplanation,
                suggestedMemoryVerse: item.suggestedMemoryVerse,
                lessonApplication: item.lessonApplication,
                biblicalExamples: item.biblicalExamples
            });
        };

        return (
            <div className="w-full max-w-4xl mx-auto space-y-10 mt-4 pb-20 animate-fade-in-up">
                {/* 🔍 AI Semantic Theme Search Section */}
                <div id="tour-bible-thematic-search-card" className="bg-gradient-to-b from-[#1e293b]/60 to-[#0f172a]/80 backdrop-blur-xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg">
                                    <SparklesIcon className="w-6 h-6 text-amber-400 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white font-serif flex items-center gap-2">
                                        الباحث الموضوعي الذكي بالذكاء الاصطناعي
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                                        ابحث بالمعنى والصفة والموضوع بدلاً من البحث التقليدي عن كلمة أو آية محددة
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleThemeSearch} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={themeQuery}
                                onChange={(e) => setThemeQuery(e.target.value)}
                                placeholder="اكتب موضوع درسك هنا (مثال: شكر الله وسط التجارب، غسيل الأرجل والتواضع، الصيد العجيب)..."
                                className="flex-grow bg-[#090d16] text-white border border-white/10 hover:border-white/20 focus:border-amber-500/60 rounded-2xl px-5 py-4 text-base placeholder-slate-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all duration-300 shadow-inner"
                                disabled={isSearchingTheme}
                            />
                            <button
                                type="submit"
                                disabled={isSearchingTheme || !themeQuery.trim()}
                                className="sm:w-auto w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0f172a] font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSearchingTheme ? (
                                    <>
                                        <SpinnerIcon className="w-5 h-5 animate-spin" />
                                        <span>جاري البحث الذكي...</span>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        <span>ابحث بالمعنى</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {searchError && (
                            <div className="mt-4 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-300 text-sm flex items-center gap-3 animate-fade-in">
                                <span className="text-lg">⚠️</span>
                                <div className="flex-grow">{searchError}</div>
                            </div>
                        )}

                        {isSearchingTheme && (
                            <div className="mt-8 py-12 flex flex-col items-center justify-center gap-4 text-center rounded-2xl border border-dashed border-white/5 bg-slate-900/10 animate-pulse">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                                    <SparklesIcon className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white font-serif font-bold text-lg">جاري مسح الأسفار بالكامل واستخلاص المعاني الدقيقة...</p>
                                    <p className="text-slate-400 text-sm">يقوم الذكاء الاصطناعي الآن بمطابقة موضوعك مع مئات الأصحاحات واستخلاص شواهد الحفظ والأنشطة والقصص العملية</p>
                                </div>
                            </div>
                        )}

                        {/* Theme Search Results */}
                        {themeResults && themeResults.length > 0 && (
                            <div className="mt-8 space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <h4 className="text-lg font-bold text-amber-400 font-serif flex items-center gap-2">
                                        ✨ نتائج البحث المقترحة لموضوع: "{themeQuery}"
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setThemeResults(null);
                                            setThemeQuery('');
                                        }}
                                        className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
                                    >
                                        إغلاق النتائج ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {themeResults.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-[#0b101b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500/10 to-transparent w-full h-1.5"></div>
                                            
                                            <div className="space-y-4">
                                                {/* Header & Actions */}
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <span className="text-amber-400 font-serif font-bold text-sm md:text-base">
                                                        📍 {item.reference}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleCopyResult(item)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                                            title="نسخ بالكامل"
                                                        >
                                                            <CopyIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleSaveSearchResult(item)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/5 transition-colors"
                                                            title="حفظ للمكتبة"
                                                        >
                                                            <BookmarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Verse Text Area */}
                                                <div className="bg-[#141b2a] border border-white/5 rounded-xl p-4">
                                                    <p className="text-white text-base leading-relaxed font-serif text-right spark-arabic-verse block" style={{ fontSize: '18px' }}>
                                                        {item.versesText}
                                                    </p>
                                                </div>

                                                {/* Biblical Examples Area / Stories (NEW ADDITION) */}
                                                {item.biblicalExamples && (
                                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 space-y-1.5 shadow-sm text-right">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                                            <span>🎭 مواقف وقصص وشخصيات كتابية عملية:</span>
                                                        </div>
                                                        <p className="text-amber-100 text-xs leading-relaxed font-sans block text-right">
                                                            {item.biblicalExamples}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Relevance explanation */}
                                                <div className="space-y-1 text-right">
                                                    <span className="text-xs font-bold text-slate-500 block">💡 سر الملاءمة والدلالة الروحية:</span>
                                                    <p className="text-slate-300 text-xs leading-relaxed">
                                                        {item.relevanceExplanation}
                                                    </p>
                                                </div>

                                                {/* Suggested children's memory verse */}
                                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 space-y-1 text-right">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                                                        <span>👶 آية الحفظ المقترحة للأطفال:</span>
                                                    </div>
                                                    <p className="text-amber-200 text-xs md:text-sm leading-relaxed font-serif text-right">
                                                        {item.suggestedMemoryVerse}
                                                    </p>
                                                </div>

                                                {/* Classroom/Sunday School activity */}
                                                <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-3 space-y-1 text-right">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                                                        <span>🎨 التطبيق العملي والنشاط في الخدمة:</span>
                                                    </div>
                                                    <p className="text-sky-200 text-xs leading-relaxed text-right">
                                                        {item.lessonApplication}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Testament Chooser Cards */}
                <div id="tour-bible-testament-cards">
                    <h4 className="text-center text-slate-400 text-sm mb-6 font-serif">أو تصفح الكتاب المقدس والأسفار بالطريقة التقليدية:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => handleTestamentSelect('old')}
                            className="group relative overflow-hidden rounded-3xl bg-[#0f172a]/60 border border-white/10 p-8 h-64 flex flex-col items-center justify-center gap-6 hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                                <span className="text-4xl">📜</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white font-serif z-10">العهد القديم</h3>
                            <p className="text-slate-400 text-sm z-10">الشريعة، التاريخ، الأنبياء والسفر الرمزي</p>
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
                            <p className="text-slate-400 text-sm z-10">الأناجيل الأربعة، الرسائل، سفر الرؤيا</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderBookSelect = () => (
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

    const renderChapterSelect = () => (
        <div className="animate-fade-in max-w-4xl mx-auto pb-20">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white font-serif mb-2">{selectedBook?.name}</h2>
                <p className="text-slate-400 mb-8">اختر الأصحاح أو ابدأ بدراسة السفر</p>
                
                {/* Book Intro Button */}
                <button 
                    onClick={fetchBookIntroductionData}
                    className="group relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-amber-500/10"
                >
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                        <InfoIcon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                        <span className="block text-amber-400 font-bold text-lg font-serif">مقدمة السفر</span>
                        <span className="block text-slate-400 text-xs mt-0.5">الكاتب، التاريخ، الغرض، الشخصيات</span>
                    </div>
                </button>
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

    const renderReadingView = () => {
        const hasSelection = selectedVerses.length > 0;

        const containerClasses = isFocusMode 
            ? "fixed inset-0 z-50 bg-[#0f172a] overflow-y-auto px-4 sm:px-6 pt-20 pb-32" 
            : "animate-fade-in max-w-4xl mx-auto pb-32 relative px-4 sm:px-6";

        return (
            <div className={containerClasses}>
                <div className={`sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-40 py-4 rounded-b-xl shadow-lg border-b border-white/5 ${isFocusMode ? 'max-w-4xl mx-auto' : ''}`}>
                    {/* Reading Toolbar */}
                    <div className="flex items-center justify-between pb-4 px-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button onClick={handlePrevChapter} disabled={!selectedBook || selectedChapter <= 1} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                                <ChevronDownIcon className="w-5 h-5 rotate-90" />
                            </button>
                            <div className="text-center min-w-[90px] sm:min-w-[120px]">
                                <h2 className="text-base sm:text-lg font-bold text-amber-500 font-serif leading-tight">{selectedBook?.name}</h2>
                                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">أصحاح {selectedChapter}</p>
                            </div>
                            <button onClick={handleNextChapter} disabled={!selectedBook || selectedChapter >= (selectedBook.chapters || 0)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                                <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                            </button>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-full p-1 border border-white/5">
                            <button onClick={decreaseFontSize} className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="تصغير الخط"><TextDecreaseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                            <button onClick={toggleFontType} className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="تغيير نوع الخط"><TypefaceIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                            <button onClick={increaseFontSize} className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="تكبير الخط"><TextIncreaseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                            <div className="w-px h-4 bg-white/10 mx-0.5 sm:mx-1"></div>
                            <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-1.5 sm:p-2 rounded-full transition-all ${isFocusMode ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} title={isFocusMode ? "إنهاء التركيز" : "وضع التركيز"}>
                                {isFocusMode ? <MinimizeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <MaximizeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Permanent Study Tools (outside Focus Mode) */}
                    {!isFocusMode && (
                        <div className="px-2 pt-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
                                <button onClick={fetchSimpleExplanationData} className="p-2 sm:p-3 rounded-lg hover:bg-green-500/10 text-green-300 hover:text-green-200 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs sm:text-xs md:text-sm font-semibold bg-green-500/5 border border-green-500/10 cursor-pointer active:scale-95">
                                    <ChildFaceIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /><span>شرح مبسط</span>
                                </button>
                                <button onClick={fetchInterpretationData} className="p-2 sm:p-3 rounded-lg hover:bg-purple-500/10 text-purple-300 hover:text-purple-200 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs sm:text-xs md:text-sm font-semibold bg-purple-500/5 border border-purple-500/10 cursor-pointer active:scale-95">
                                    <InterpretationIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /><span>التفسير الآبائي</span>
                                </button>
                                <button onClick={fetchLinguisticAnalysisData} className="p-2 sm:p-3 rounded-lg hover:bg-sky-500/10 text-sky-300 hover:text-sky-200 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs sm:text-xs md:text-sm font-semibold bg-sky-500/5 border border-sky-500/10 cursor-pointer active:scale-95">
                                    <LanguageIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /><span>{originalLabel}</span>
                                </button>
                                <button onClick={handleFetchHooks} className="p-2 sm:p-3 rounded-lg hover:bg-amber-500/10 text-amber-300 hover:text-amber-200 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs sm:text-xs md:text-sm font-semibold bg-amber-500/5 border border-amber-500/20 shadow-md cursor-pointer active:scale-95">
                                    <LightBulbIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" /><span>أفكار تشويقية ✨</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Text Content */}
                <div className={`mt-6 mx-auto ${isFocusMode ? 'max-w-3xl' : ''}`}>
                     {isLoadingText ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <SpinnerIcon className="w-10 h-10 text-amber-500 animate-spin" />
                            <p className="text-slate-500 font-serif">جاري استدعاء آيات الأصحاح...</p>
                        </div>
                     ) : (
                        <div className="flex flex-col space-y-3 sm:space-y-4">
                            {chapterText.map((verse) => {
                                const isSelected = selectedVerses.includes(verse.number);
                                return (
                                    <div 
                                        key={verse.number} 
                                        onClick={() => toggleVerseSelection(verse.number)} 
                                        className={`group relative p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 flex gap-3 sm:gap-4 items-start ${
                                            isSelected 
                                                ? 'bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                                                : 'hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        <span className={`flex-shrink-0 inline-flex items-center justify-center h-7 min-w-[1.75rem] px-1 rounded-lg text-xs font-bold mt-1 select-none transition-all ${
                                            isSelected ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' : 'text-slate-400 bg-white/5 group-hover:bg-white/10'
                                        }`}>
                                            {verse.number}
                                        </span>
                                        <p 
                                            className={`flex-grow transition-colors tracking-wide text-right whitespace-pre-line ${
                                                isSelected ? 'text-amber-100 font-medium' : 'text-slate-200/90 group-hover:text-white'
                                            }`} 
                                            style={{
                                                fontSize: `${fontSize}px`, 
                                                fontFamily: fontType === 'naskh' ? '"Noto Naskh Arabic", serif' : '"Cairo", sans-serif', 
                                                lineHeight: fontType === 'naskh' ? 2.3 : 1.9
                                            }}
                                        >
                                            {verse.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                     )}
                </div>

                {!isFocusMode && (
                    <div className="mt-12 text-center pb-8">
                        <p className="text-[11px] text-slate-500 font-serif tracking-wider">ترجمة فاندايك - مرجعية موقع St-Takla.org الأرثوذكسي</p>
                    </div>
                )}

                {/* Floating Action Bar (for selection and focus mode) */}
                {hasSelection && (
                    <div className="fixed bottom-6 left-4 right-4 z-[60] flex justify-center pointer-events-none animate-fade-in-up transition-all duration-300">
                        <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-full overflow-x-auto">
                            <div className="px-3 py-1 text-slate-300 text-xs sm:text-sm font-bold border-l border-white/10 shrink-0">
                                <span className="text-amber-400 font-extrabold">{selectedVerses.length}</span> آيات
                            </div>
                            <button onClick={handleCopyVerses} className="p-2 sm:p-3 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all flex flex-col items-center gap-1 min-w-[50px] sm:min-w-[58px] cursor-pointer">
                                <CopyIcon className="w-5 h-5" />
                                <span className="text-[10px] font-bold">نسخ</span>
                            </button>
                            <div className="w-px h-8 bg-white/10"></div>
                            <button onClick={fetchSimpleExplanationData} className="p-2 sm:p-3 rounded-xl hover:bg-green-500/20 text-green-300 hover:text-green-200 transition-all flex flex-col items-center gap-1 min-w-[50px] sm:min-w-[58px] cursor-pointer">
                                <ChildFaceIcon className="w-5 h-5" />
                                <span className="text-[10px] font-bold">مبسط</span>
                            </button>
                            <button onClick={fetchInterpretationData} className="p-2 sm:p-3 rounded-xl hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-all flex flex-col items-center gap-1 min-w-[50px] sm:min-w-[58px] cursor-pointer">
                                <InterpretationIcon className="w-5 h-5" />
                                <span className="text-[10px] font-bold">تفسير</span>
                            </button>
                            <button onClick={fetchLinguisticAnalysisData} className="p-2 sm:p-3 rounded-xl hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 transition-all flex flex-col items-center gap-1 min-w-[50px] sm:min-w-[58px] cursor-pointer">
                                <LanguageIcon className="w-5 h-5" />
                                <span className="text-[10px] font-bold">{originalLabel}</span>
                            </button>
                            <button onClick={() => setSelectedVerses([])} className="p-1.5 sm:p-2 ml-1 rounded-full hover:bg-red-500/25 text-slate-500 hover:text-red-400 transition-all shrink-0">
                                <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- RENDER MODALS AS SLIDE-UP BOTTOM SHEETS ON MOBILE & SIDE DRAWERS ON DESKTOP ---

    const renderBookIntroModal = () => (
        <div className="fixed inset-0 z-[70] flex justify-end items-stretch pointer-events-none md:justify-end md:items-stretch items-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={() => setShowBookIntro(false)}></div>
            <div className="relative w-full md:max-w-2xl h-[85vh] md:h-full bg-[#0a0f1d] border-t md:border-t-0 md:border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col rounded-t-3xl md:rounded-none animate-fade-in-up md:animate-fade-in-right">
                {/* Drag Handle for Mobile */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 block md:hidden"></div>
                
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0f1d]">
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                            <InfoIcon className="w-5 h-5 text-amber-400" />
                            مقدمة سفر {selectedBook?.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">دراسة تاريخية وروحية شاملة</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {bookIntroData && (
                            <button onClick={() => handleSaveContent(`مقدمة سفر: ${selectedBook?.name}`, { type: 'book-intro', body: bookIntroData })} disabled={isSaving} className={`p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 transition-colors ${saveSuccess ? 'text-green-400' : ''}`} title="حفظ في المكتبة">
                                {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5 animate-skin" /> : <BookmarkIcon className="w-5 h-5" />}
                            </button>
                        )}
                        <button onClick={() => setShowBookIntro(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10" title="إغلاق"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-5 sm:p-8 space-y-4 custom-scrollbar bg-[#111827]/40 leading-relaxed text-right">
                    {isLoadingBookIntro ? (
                        <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                            <SpinnerIcon className="w-12 h-12 text-amber-500 animate-spin" />
                            <p className="text-slate-300 font-serif">جاري جمع وتحليل معلومات السفر...</p>
                        </div>
                    ) : bookIntroData ? (
                        <div className="formatted-content spark-body-serif text-slate-200 text-lg leading-loose font-serif selection:bg-amber-500/20" dangerouslySetInnerHTML={{ __html: formatTextToHtml(bookIntroData) }} />
                    ) : (
                        <div className="text-center text-slate-500 py-10 font-serif">لا توجد معلومات لهذه المقدمة حالياً.</div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderSimpleExplanationModal = () => (
        <div className="fixed inset-0 z-[70] flex justify-end items-stretch pointer-events-none md:justify-end md:items-stretch items-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={() => setShowSimpleExplanation(false)}></div>
            <div className="relative w-full md:max-w-2xl h-[85vh] md:h-full bg-[#0a0f1d] border-t md:border-t-0 md:border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col rounded-t-3xl md:rounded-none animate-fade-in-up md:animate-fade-in-right">
                {/* Drag Handle for Mobile */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 block md:hidden"></div>
                
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0f1d]">
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                            <ChildFaceIcon className="w-5 h-5 text-green-400" />
                            الشرح المبسط المشوق 👶✨
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {selectedVerses.length > 0 ? `للآيات المحددة: ${selectedVerses.join('، ')}` : 'للأصحاح كاملاً - مناسب للأطفال والخدمة'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {simpleExplanationData && (
                            <button onClick={() => handleSaveContent(`شرح مبسط: ${selectedBook?.name} ${selectedChapter}`, { type: 'simple-explanation', body: simpleExplanationData })} disabled={isSaving} className={`p-2 rounded-lg text-slate-300 hover:text-green-400 hover:bg-green-500/10 transition-colors ${saveSuccess ? 'text-green-400' : ''}`} title="حفظ للخدمة">
                                {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                            </button>
                        )}
                        <button onClick={() => setShowSimpleExplanation(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10" title="إغلاق"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-5 sm:p-8 space-y-4 custom-scrollbar bg-[#111827]/40 leading-relaxed text-right">
                    {isLoadingSimpleExplanation ? (
                        <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                            <SpinnerIcon className="w-12 h-12 text-green-500 animate-spin" />
                            <p className="text-slate-300 font-serif">جاري تبسيط النص وحياكة الأفكار للصغار...</p>
                        </div>
                    ) : simpleExplanationData ? (
                        <div className="formatted-content spark-body-serif text-slate-200 text-lg leading-loose font-serif selection:bg-green-500/10" dangerouslySetInnerHTML={{ __html: formatTextToHtml(simpleExplanationData) }} />
                    ) : (
                        <div className="text-center text-slate-500 py-10 font-serif">اضغط على زر الشرح المبسط لبدء التوليد الذكي.</div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderInterpretationModal = () => (
        <div className="fixed inset-0 z-[70] flex justify-end items-stretch pointer-events-none md:justify-end md:items-stretch items-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={() => setShowInterpretation(false)}></div>
            <div className="relative w-full md:max-w-2xl h-[85vh] md:h-full bg-[#0a0f1d] border-t md:border-t-0 md:border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col rounded-t-3xl md:rounded-none animate-fade-in-up md:animate-fade-in-right">
                {/* Drag Handle for Mobile */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 block md:hidden"></div>
                
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0f1d]">
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                            <InterpretationIcon className="w-5 h-5 text-purple-400" />
                            التفسير اللاهوتي والآبائي ⛪
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {selectedVerses.length > 0 ? `للآيات المحددة: ${selectedVerses.join('، ')}` : 'للأصحاح بالكامل بالتفصيل'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {interpretationData && (
                            <button onClick={() => handleSaveContent(`تفسير: ${selectedBook?.name} ${selectedChapter}`, { type: 'interpretation', body: interpretationData })} disabled={isSaving} className={`p-2 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/10 transition-colors ${saveSuccess ? 'text-green-400' : ''}`} title="حفظ للخدمة">
                                {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                            </button>
                        )}
                        <button onClick={() => setShowInterpretation(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10" title="إغلاق"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-5 sm:p-8 space-y-4 custom-scrollbar bg-[#111827]/40 leading-relaxed text-right">
                    {isLoadingInterpretation ? (
                        <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                            <SpinnerIcon className="w-12 h-12 text-purple-500 animate-spin" />
                            <p className="text-slate-300 font-serif">جاري استحضار أقوال الآباء والتأملات بعمق...</p>
                        </div>
                    ) : interpretationData ? (
                        <div className="formatted-content spark-body-serif text-slate-200 text-lg leading-loose font-serif selection:bg-purple-500/10" dangerouslySetInnerHTML={{ __html: formatTextToHtml(interpretationData) }} />
                    ) : (
                        <div className="text-center text-slate-500 py-10 font-serif">اضغط على زر التفسير الآبائي لتحميل الشرح.</div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderAnalysisModal = () => (
        <div className="fixed inset-0 z-[70] flex justify-end items-stretch pointer-events-none md:justify-end md:items-stretch items-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={() => setShowAnalysis(false)}></div>
            <div className="relative w-full md:max-w-md h-[85vh] md:h-full bg-[#0a0f1d] border-t md:border-t-0 md:border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col rounded-t-3xl md:rounded-none animate-fade-in-up md:animate-fade-in-right">
                {/* Drag Handle for Mobile */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 block md:hidden"></div>
                
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0f1d]">
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                            <LanguageIcon className="w-5 h-5 text-sky-400" />
                            {analysisLabel} 🔍
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">الربط اللغوي بالمعنى الأصلي المستهدف</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {analysisData.length > 0 && (
                            <button onClick={() => handleSaveContent(`تحليل لغوي: ${selectedBook?.name} ${selectedChapter}`, { type: 'linguistic-analysis', body: analysisData })} disabled={isSaving} className={`p-2 rounded-lg text-slate-300 hover:text-sky-400 hover:bg-sky-500/10 transition-colors ${saveSuccess ? 'text-green-400' : ''}`} title="حفظ للخدمة">
                                {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                            </button>
                        )}
                        <button onClick={() => setShowAnalysis(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10" title="إغلاق"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 h-full custom-scrollbar bg-[#111827]/40">
                    {isLoadingAnalysis ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                            <SpinnerIcon className="w-12 h-12 text-sky-500 animate-spin" />
                            <p className="text-slate-300 font-serif">جاري الحفر اللغوي والمقارنة مع القواميس العبرية واليونانية...</p>
                        </div>
                    ) : analysisData.length > 0 ? (
                        <div className="space-y-4">
                            {analysisData.map((item, idx) => (
                                <div key={idx} className="bg-[#1e293b]/55 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-sky-500/30 hover:bg-[#1e293b]/80 transition-all duration-250 shadow-md">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="bg-amber-500/15 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/10">آية {item.verseNumber}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-right">
                                        <div className="bg-black/35 p-3 rounded-xl border border-white/5">
                                            <span className="block text-[10px] text-slate-400 mb-1">الكلمة العربية</span>
                                            <span className="text-white text-base font-bold font-serif">{item.arabicWord}</span>
                                        </div>
                                        <div className="bg-sky-950/20 p-3 rounded-xl border border-sky-500/10">
                                            <span className="block text-[10px] text-sky-400 mb-1">{originalLabel} الأصلي</span>
                                            <span className="text-amber-400 text-base font-bold font-sans tracking-wide">{item.originalWord}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-200 text-sm leading-relaxed border-t border-white/5 pt-3 text-right font-serif">
                                        <span className="text-sky-400 font-bold text-xl ml-1">❝</span>{item.explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-10 font-serif">لا توجد ملاحظات لغوية معروضة للأصحاح حالياً.</div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderHooksModal = () => (
        <div className="fixed inset-0 z-[70] flex justify-end items-stretch pointer-events-none md:justify-end md:items-stretch items-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={() => setShowHooks(false)}></div>
            <div className="relative w-full md:max-w-2xl h-[85vh] md:h-full bg-[#0a0f1d] border-t md:border-t-0 md:border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col rounded-t-3xl md:rounded-none animate-fade-in-up md:animate-fade-in-right">
                {/* Drag Handle for Mobile */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 block md:hidden"></div>
                
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0f1d]">
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                            <LightBulbIcon className="w-5 h-5 text-amber-400" />
                            مقدمات تفاعلية مشوقة للدروس 💡✨
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">سفر {selectedBook?.name} - أصحاح {selectedChapter}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {lessonHooks && (
                            <button onClick={() => handleSaveContent(`أفكار تشويقية: ${selectedBook?.name} ${selectedChapter}`, { type: 'lesson-hooks', body: lessonHooks })} disabled={isSaving} className={`p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 transition-colors ${saveSuccess ? 'text-green-400' : ''}`} title="حفظ للمكتبة">
                                {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                            </button>
                        )}
                        <button onClick={() => setShowHooks(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10" title="إغلاق"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar bg-[#111827]/40">
                    {isLoadingHooks ? (
                        <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin"></div>
                                <LightBulbIcon className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-slate-200 font-serif font-bold text-lg">جاري حبك المقدمات وابتكار الوسائل التفاعلية...</p>
                                <p className="text-slate-400 text-sm max-w-md mx-auto">نصوغ الآن ٣ وسائط مشوقة ومجربة للخدمة (قصة عملية، تجربة عملية ملفتة، ولغز ذهني محفز).</p>
                            </div>
                        </div>
                    ) : hooksError ? (
                        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-300 text-sm">{hooksError}</div>
                    ) : lessonHooks ? (
                        <div className="space-y-6">
                            <p className="text-slate-300 text-sm leading-relaxed text-right font-serif">اختر فكرتك المفضلة لبدء خدمتك بطريقة تسلب انتباه الأطفال وتلامس عقولهم لامتصاص الآيات بعمق:</p>
                            {lessonHooks.map((hook, idx) => {
                                const getHookBadge = (type: string) => {
                                    switch (type) {
                                        case 'story': return { text: '🎭 موقف درامي وقصص مشوقة', border: 'border-amber-500/20', textCol: 'text-amber-400', bg: 'bg-amber-500/5' };
                                        case 'science': return { text: '🧪 تجربة عملية أو وسيلة إيضاح', border: 'border-emerald-500/20', textCol: 'text-emerald-400', bg: 'bg-emerald-500/5' };
                                        default: return { text: '❓ لغز فكري وسؤال محير للذهن', border: 'border-purple-500/20', textCol: 'text-purple-400', bg: 'bg-purple-500/5' };
                                    }
                                };
                                const badge = getHookBadge(hook.type);

                                return (
                                    <div key={idx} className="border border-white/5 bg-[#0b101b] rounded-2xl p-5 hover:border-white/10 transition-colors relative overflow-hidden group text-right">
                                        <div className="absolute top-0 right-0 w-2 h-full bg-[#1e293b]"></div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${badge.border} ${badge.textCol} ${badge.bg}`}>{badge.text}</span>
                                                <button onClick={() => {
                                                    navigator.clipboard.writeText(`💡 ${hook.title}\n\nطريقة التنفيذ:\n${hook.description}\n\nالربط بالآية:\n${hook.connectionToVerse}`);
                                                    alert("تم نسخ فكرة المقدمة بنجاح!");
                                                }} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100" title="نسخ الفكرة كاملة"><CopyIcon className="w-4 h-4" /></button>
                                            </div>
                                            <h4 className="text-base font-bold text-white font-serif">{hook.title}</h4>
                                            <div className="space-y-1">
                                                <span className="text-[11px] font-bold text-slate-500 block">🛠️ طريقة وسيناريو التنفيذ:</span>
                                                <p className="text-slate-300 text-sm leading-relaxed">{hook.description}</p>
                                            </div>
                                            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                                                <span className="text-[11px] font-bold text-amber-500 block mb-1">🔗 كيف تربط هذا بمحور آيات الأصحاح؟</span>
                                                <p className="text-slate-400 text-sm leading-relaxed font-serif">{hook.connectionToVerse}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-10 font-serif">تعذر جلب الأفكار التشويقية للأصحاح.</div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className={`w-full ${isFocusMode ? '' : 'min-h-[80vh]'} flex flex-col`}>
             {!isFocusMode && (
                <div className="flex items-center justify-center gap-3 mb-8 relative">
                    <BookOpenIcon className="w-8 h-8 text-amber-500" />
                    <h1 className="text-2xl sm:text-4xl font-bold text-white font-serif drop-shadow-lg text-center">الكتاب المقدس</h1>
                    
                    <button
                        type="button"
                        id="tour-bible-trigger-btn"
                        onClick={() => setIsTourOpen(true)}
                        className="absolute left-0 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer animate-pulse"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">جولة تعليمية 🗺️</span>
                    </button>
                </div>
             )}

            {renderBreadcrumb()}

            {error && !isFocusMode && (
                 <div className="w-full max-w-lg mx-auto mb-8 animate-fade-in-down">
                    <div className="bg-red-900/20 border border-red-500/40 rounded-xl p-4 flex items-center gap-4 text-red-200 shadow-lg backdrop-blur-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <XMarkIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-grow text-right">
                            <h4 className="font-bold text-sm text-right">حدث خطأ في التحميل</h4>
                            <p className="text-xs opacity-90">{error}</p>
                        </div>
                        <button onClick={() => selectedBook && fetchChapter(selectedBook, selectedChapter)} className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-400 transition-colors flex items-center gap-1"><RefreshIcon className="w-3 h-3" />إعادة المحاولة</button>
                    </div>
                 </div>
            )}

            {view === 'testament-select' && renderTestamentSelect()}
            {view === 'book-select' && renderBookSelect()}
            {view === 'chapter-select' && renderChapterSelect()}
            {view === 'reading' && renderReadingView()}

            {/* Unified Study Modals (Rendered Globally for all views) */}
            {showBookIntro && renderBookIntroModal()}
            {showSimpleExplanation && renderSimpleExplanationModal()}
            {showInterpretation && renderInterpretationModal()}
            {showAnalysis && renderAnalysisModal()}
            {showHooks && renderHooksModal()}
            
            <GuidedTour 
                isOpen={isTourOpen} 
                onClose={() => setIsTourOpen(false)} 
                steps={tourSteps} 
                tourKey="bible-reader-tour"
            />
        </div>
    );
};

export default BibleReader;
