import React, { useState, useEffect } from 'react';
import { bibleBooks, BibleBook } from '../utils/bibleData';
import { getBibleChapterText, getLinguisticAnalysis, getChapterInterpretation, getSimplifiedExplanation, BibleVerse, LinguisticAnalysisItem } from '../services/geminiService';
import { formatTextToHtml } from '../services/exportService';
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon, SpinnerIcon, RefreshIcon, LanguageIcon, XMarkIcon, InterpretationIcon, CopyIcon, CheckCircleIcon, ChildFaceIcon } from './icons';

interface BibleReaderProps {
    isLoading?: boolean;
}

type ViewState = 'testament-select' | 'book-select' | 'chapter-select' | 'reading';

const BibleReader: React.FC<BibleReaderProps> = () => {
    const [view, setView] = useState<ViewState>('testament-select');
    const [selectedTestament, setSelectedTestament] = useState<'old' | 'new' | null>(null);
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [chapterText, setChapterText] = useState<BibleVerse[]>([]);
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Selection State
    const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

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
        
        // Logic to re-fetch if selection changed is complex, for now always fetch if selection present or if no data
        const shouldFetch = selectedVerses.length > 0 || !interpretationData;

        if (shouldFetch) {
            setIsLoadingInterpretation(true);
            setInterpretationData(null); // Clear old data to show loading for new selection
        }
        
        setShowInterpretation(true); // Open panel
        
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
            // Optional: Show toast
        }
        // Clear selection after copy? Maybe keep it.
        setSelectedVerses([]);
    };

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

    const Breadcrumb = () => (
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

        return (
            <div className="animate-fade-in max-w-4xl mx-auto pb-32 relative">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-10 py-4 px-2 rounded-b-xl shadow-lg">
                    <button 
                        onClick={handlePrevChapter}
                        disabled={!selectedBook || selectedChapter <= 1}
                        className="px-3 sm:px-4 py-2 text-sm font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronDownIcon className="w-4 h-4 rotate-90" />
                        <span className="hidden sm:inline">السابق</span>
                    </button>
                    
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-amber-500 font-serif">{selectedBook?.name}</h2>
                        <p className="text-slate-400 text-sm">أصحاح {selectedChapter}</p>
                    </div>

                    <div className="flex items-center gap-2">
                         {/* Top Bar Actions (Context Agnostic or Full Chapter) */}
                         {!hasSelection && (
                            <>
                                <button
                                    onClick={fetchSimpleExplanationData}
                                    className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors flex items-center gap-2"
                                    title="شرح مبسط (عامية مصرية)"
                                >
                                    <ChildFaceIcon className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={fetchInterpretationData}
                                    className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                                    title="تفسير الأصحاح بالكامل"
                                >
                                    <InterpretationIcon className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={fetchLinguisticAnalysisData}
                                    className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition-colors flex items-center gap-2"
                                    title={`تحليل لغوي للأصحاح`}
                                >
                                    <LanguageIcon className="w-5 h-5" />
                                </button>
                            </>
                         )}
                        
                        <button 
                            onClick={handleNextChapter}
                            disabled={!selectedBook || selectedChapter >= (selectedBook.chapters || 0)}
                            className="px-3 sm:px-4 py-2 text-sm font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span className="hidden sm:inline">التالي</span>
                            <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                        </button>
                    </div>
                </div>

                {/* Verse List View */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden min-h-[500px]">
                     {isLoadingText ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <SpinnerIcon className="w-10 h-10 text-amber-500 animate-spin" />
                            <p className="text-slate-500">جاري استدعاء النص...</p>
                        </div>
                     ) : (
                        <div className="flex flex-col">
                            {chapterText.map((verse) => {
                                const isSelected = selectedVerses.includes(verse.number);
                                return (
                                    <div 
                                        key={verse.number} 
                                        onClick={() => toggleVerseSelection(verse.number)}
                                        className={`group relative p-4 md:p-5 border-b border-white/5 cursor-pointer transition-all duration-200 flex gap-4 md:gap-6 items-start
                                            ${isSelected 
                                                ? 'bg-amber-500/10 hover:bg-amber-500/15' 
                                                : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-sans font-bold text-sm transition-colors
                                            ${isSelected 
                                                ? 'bg-amber-500 text-white' 
                                                : 'bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300'
                                            }`}>
                                            {isSelected ? <CheckCircleIcon className="w-5 h-5" /> : verse.number}
                                        </div>
                                        <p className={`flex-grow font-naskh text-xl md:text-2xl leading-[2.2] transition-colors ${isSelected ? 'text-amber-50' : 'text-slate-200'}`} style={{fontFeatureSettings: '"ss01" 1'}}>
                                            {verse.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                     )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 font-serif">
                        ترجمة فاندايك - مرجعية موقع St-Takla.org
                    </p>
                </div>

                {/* Floating Action Bar for Selection */}
                {hasSelection && (
                    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none animate-fade-in-up">
                        <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-2 flex items-center gap-2 pointer-events-auto">
                            <div className="px-3 py-2 border-l border-white/10 text-slate-300 text-sm font-bold">
                                تم تحديد <span className="text-amber-400">{selectedVerses.length}</span>
                            </div>
                            
                            <button 
                                onClick={handleCopyVerses}
                                className="p-3 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex flex-col items-center gap-1 min-w-[60px]"
                                title="نسخ الآيات"
                            >
                                <CopyIcon className="w-5 h-5" />
                                <span className="text-[10px]">نسخ</span>
                            </button>
                            
                            <div className="w-px h-8 bg-white/10"></div>

                            <button 
                                onClick={fetchSimpleExplanationData}
                                className="p-3 rounded-xl hover:bg-green-500/20 text-green-300 hover:text-green-200 transition-colors flex flex-col items-center gap-1 min-w-[80px]"
                                title="شرح مبسط (عامية)"
                            >
                                <ChildFaceIcon className="w-5 h-5" />
                                <span className="text-[10px]">مبسط</span>
                            </button>

                            <button 
                                onClick={fetchInterpretationData}
                                className="p-3 rounded-xl hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-colors flex flex-col items-center gap-1 min-w-[80px]"
                                title="تفسير الآيات المحددة فقط"
                            >
                                <InterpretationIcon className="w-5 h-5" />
                                <span className="text-[10px]">تفسير عميق</span>
                            </button>

                            <button 
                                onClick={fetchLinguisticAnalysisData}
                                className="p-3 rounded-xl hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 transition-colors flex flex-col items-center gap-1 min-w-[80px]"
                                title="تحليل لغوي للآيات المحددة"
                            >
                                <LanguageIcon className="w-5 h-5" />
                                <span className="text-[10px]">{analysisLabel}</span>
                            </button>

                            <button 
                                onClick={() => setSelectedVerses([])}
                                className="p-2 ml-1 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Simplified Explanation Modal/Panel */}
                {showSimpleExplanation && (
                     <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                        <div 
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in"
                            onClick={() => setShowSimpleExplanation(false)}
                        ></div>
                        
                        <div className="relative w-full max-w-2xl h-full bg-[#0f172a]/95 border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col animate-fade-in-right transform transition-transform duration-300">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                                        <ChildFaceIcon className="w-5 h-5 text-green-400" />
                                        الشرح المبسط
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {selectedVerses.length > 0 
                                            ? `شرح مبسط (عامية) للآيات: ${selectedVerses.join('، ')}` 
                                            : 'شرح مبسط للأصحاح بالكامل (عامية مصرية)'}
                                    </p>
                                </div>
                                <button onClick={() => setShowSimpleExplanation(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#1e293b]/30">
                                {isLoadingSimpleExplanation ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                                        <SpinnerIcon className="w-12 h-12 text-green-500 animate-spin" />
                                        <div>
                                            <p className="text-slate-300 font-serif text-lg mb-2">جاري تبسيط المعلومة...</p>
                                            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                بنكتب شرح سهل وبسيط بالعامية المصرية عشان يوصل القلب بسرعة.
                                            </p>
                                        </div>
                                    </div>
                                ) : simpleExplanationData ? (
                                    <div 
                                        className="formatted-content spark-body-serif text-slate-200 font-sans leading-loose"
                                        dangerouslySetInnerHTML={{ __html: formatTextToHtml(simpleExplanationData) }} 
                                    />
                                ) : (
                                    <div className="text-center text-slate-500 py-10">
                                        لم يتم العثور على شرح.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Interpretation Modal/Panel */}
                {showInterpretation && (
                    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                        <div 
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in"
                            onClick={() => setShowInterpretation(false)}
                        ></div>
                        
                        <div className="relative w-full max-w-2xl h-full bg-[#0f172a]/95 border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col animate-fade-in-right transform transition-transform duration-300">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                                        <InterpretationIcon className="w-5 h-5 text-purple-400" />
                                        التفسير العميق
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {selectedVerses.length > 0 
                                            ? `تفسير خاص للآيات: ${selectedVerses.join('، ')}` 
                                            : 'شرح شامل للأصحاح مع أقوال الآباء'}
                                    </p>
                                </div>
                                <button onClick={() => setShowInterpretation(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#1e293b]/30">
                                {isLoadingInterpretation ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                                        <SpinnerIcon className="w-12 h-12 text-purple-500 animate-spin" />
                                        <div>
                                            <p className="text-slate-300 font-serif text-lg mb-2">جاري إعداد التفسير...</p>
                                            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                نبحث في تفاسير القمص تادرس يعقوب، القمص أنطونيوس فكري، وكتابات الآباء.
                                            </p>
                                        </div>
                                    </div>
                                ) : interpretationData ? (
                                    <div 
                                        className="formatted-content spark-body-serif text-slate-200"
                                        dangerouslySetInnerHTML={{ __html: formatTextToHtml(interpretationData) }} 
                                    />
                                ) : (
                                    <div className="text-center text-slate-500 py-10">
                                        لم يتم العثور على تفسير.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Linguistic Analysis Modal/Panel */}
                {showAnalysis && (
                    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                        <div 
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in"
                            onClick={() => setShowAnalysis(false)}
                        ></div>
                        
                        <div className="relative w-full max-w-md h-full bg-[#0f172a]/95 border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col animate-fade-in-right transform transition-transform duration-300">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                                        <LanguageIcon className="w-5 h-5 text-sky-400" />
                                        {analysisLabel}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {selectedVerses.length > 0
                                         ? `تحليل للآيات: ${selectedVerses.join('، ')}`
                                         : 'أبرز الفروقات اللغوية في الأصحاح'}
                                    </p>
                                </div>
                                <button onClick={() => setShowAnalysis(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {isLoadingAnalysis ? (
                                    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                                        <SpinnerIcon className="w-10 h-10 text-sky-500 animate-spin" />
                                        <p className="text-slate-300 font-serif">جاري تحليل النص الأصلي...</p>
                                    </div>
                                ) : analysisData.length > 0 ? (
                                    analysisData.map((item, idx) => (
                                        <div key={idx} className="bg-[#1e293b]/60 border border-white/5 rounded-xl p-4 hover:border-sky-500/30 transition-colors">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-0.5 rounded-md">
                                                    آية {item.verseNumber}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                                <div className="bg-black/20 p-2 rounded-lg text-center">
                                                    <span className="block text-xs text-slate-500 mb-1">عربي</span>
                                                    <span className="text-white font-serif">{item.arabicWord}</span>
                                                </div>
                                                <div className="bg-sky-900/20 p-2 rounded-lg text-center border border-sky-500/10">
                                                    <span className="block text-xs text-sky-400 mb-1">{originalLabel}</span>
                                                    <span className="text-white font-sans tracking-wide">{item.originalWord}</span>
                                                </div>
                                            </div>

                                            <p className="text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-2">
                                                <span className="text-sky-400 font-bold text-lg ml-1">❝</span>
                                                {item.explanation}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-500 py-10">
                                        لا توجد ملاحظات لغوية بارزة.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full min-h-[80vh] flex flex-col">
             <div className="flex items-center justify-center gap-3 mb-8">
                <BookOpenIcon className="w-8 h-8 text-amber-500" />
                <h1 className="text-4xl font-bold text-white font-serif drop-shadow-lg">الكتاب المقدس</h1>
            </div>

            <Breadcrumb />

            {error && (
                 <div className="w-full max-w-lg mx-auto mb-8 animate-fade-in-down">
                    <div className="bg-red-900/20 border border-red-500/40 rounded-xl p-4 flex items-center gap-4 text-red-200 shadow-lg backdrop-blur-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-sm">حدث خطأ في التحميل</h4>
                            <p className="text-xs opacity-90">{error}</p>
                        </div>
                        <button 
                            onClick={() => selectedBook && fetchChapter(selectedBook, selectedChapter)}
                            className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-400 transition-colors flex items-center gap-1"
                        >
                            <RefreshIcon className="w-3 h-3" />
                            إعادة المحاولة
                        </button>
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