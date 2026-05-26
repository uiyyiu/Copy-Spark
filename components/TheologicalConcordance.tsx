import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    Search, 
    BookOpen, 
    Layers, 
    Quote, 
    Music, 
    Activity, 
    Sparkles, 
    ArrowRight, 
    Globe, 
    Volume2,
    Calendar,
    ChevronDown,
    Map
} from 'lucide-react';
import { generateTheologicalConcordance } from '../services/geminiService';
import type { ConcordanceResult } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface TheologicalConcordanceProps {
    onBack: () => void;
    user?: any;
    onError: (err: string) => void;
}

const PRESET_TERMS = [
    { label: 'أغابي (المحبة الباذلة)', term: 'المحبة أغابي agape' },
    { label: 'خاريس (النعمة المجانية)', term: 'النعمة خاريس charis' },
    { label: 'كوانونيا (شركة الروح)', term: 'الشركة كوانونيا koinonia' },
    { label: 'لوغوس (الكلمة المتجسد)', term: 'الكلمة لوغوس logos' },
    { label: 'أناكاينوسيس (تجديد الطبيعة)', term: 'تجديد الطبيعة أناكاينوسيس anakainosis' },
    { label: 'ليترون (الفداء الثمين)', term: 'الفداء ليترون lytron' },
    { label: 'هاجياسموس (القداسة والتكريس)', term: 'القداسة هاجياسموس hagiasmos' },
    { label: 'إيريني (السلام الإلهي)', term: 'السلام إيريني eirene' }
];

export const TheologicalConcordance: React.FC<TheologicalConcordanceProps> = ({ onBack, user, onError }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ConcordanceResult | null>(null);
    const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);

    const handleSearch = async (termToSearch: string) => {
        const query = termToSearch.trim();
        if (!query) return;

        setIsLoading(true);
        setSearchTerm(query);
        try {
            const data = await generateTheologicalConcordance(query);
            setResult(data);
        } catch (err: any) {
            onError(err.message || 'حدث خطأ أثناء الاتصال بمحرك البحث اللاهوتي.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in text-right" dir="rtl">
            {/* Header section with clean layout */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-amber-500/10 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3 font-serif">
                        <span className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            <Globe className="w-7 h-7" />
                        </span>
                        قاموس الجذور والترابط الاصطلاحي
                    </h2>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed max-w-xl">
                        بربط المصطلحات اللاهوتية بجذورها اللغوية الأصلية (اليونانية والعبرية) وتتبع استخدامها في السبعينية والعهد الجديد والأباء والليتورجيا الأرثوذكسية.
                    </p>
                </div>
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 text-white rounded-xl transition-all"
                >
                    <ArrowRight className="w-5 h-5 ml-1 text-amber-500" />
                    العودة للاستوديو
                </button>
            </div>

            {/* Input & Presets Container */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-amber-500/15 shadow-xl relative overflow-hidden bg-gradient-to-br from-amber-950/10 to-indigo-950/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] pointer-events-none"></div>

                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="relative">
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch(searchTerm);
                            }}
                            placeholder="ابحث عن مصطلح لاهوتي (مثال: نيافة، أغابي، لاهوت، فداء، نعمة، شركة...)"
                            className="w-full pr-14 pl-24 py-4.5 bg-slate-900/60 border-2 border-white/10 focus:border-amber-500/50 focus:ring-0 rounded-2xl text-white text-lg placeholder:text-slate-500 font-sans tracking-wide transition-all"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-500">
                            <Search className="w-6 h-6" />
                        </div>
                        <button 
                            disabled={isLoading}
                            onClick={() => handleSearch(searchTerm)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 text-sm"
                        >
                            <span>بحث لغوي</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-slate-400 text-xs font-bold block">مفاهيم لاهوتية معتمدة للدراسة العميقة:</label>
                        <div className="flex flex-wrap gap-2.5">
                            {PRESET_TERMS.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSearch(preset.term)}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/5 bg-white/5 text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/15 hover:text-amber-200 transition-all cursor-pointer"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Spinner */}
            {isLoading && (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <LoadingSpinner />
                    <p className="text-amber-400/90 font-serif animate-pulse text-lg mt-2">
                        جاري جمع المعاجم، تتبع السبعينية، والروابط الآبائية والطقسية...
                    </p>
                </div>
            )}

            {/* Theological Bento Grid result */}
            {result && !isLoading && (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* Welcome Concept Card */}
                    <div className="p-6 md:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-indigo-900/15 relative overflow-hidden shadow-xl">
                        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[50%] rounded-full bg-amber-500/10 blur-[80px]"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                            <div>
                                <span className="inline-block px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold mb-3">
                                    تأصيل لغوي عقيدي
                                </span>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-white font-serif mb-2">
                                    {result.term}
                                </h1>
                                <p className="text-slate-300 text-base max-w-3xl leading-relaxed mt-2 font-light">
                                    المعنى اللاهوتي الشامل والترابط اللغوي للمفهوم في المعجم اللاهوتي الأرثوذكسي العريق.
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 min-w-[200px] text-center w-full md:w-auto">
                                <span className="text-xs font-bold text-amber-500 tracking-widest uppercase">الأصل المسجّل</span>
                                <span className="text-3xl font-serif text-white font-bold my-1 tracking-wide" dir="ltr">
                                    {result.originalRoot.word}
                                </span>
                                <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                                    <span>النطق:</span>
                                    <span className="font-bold text-amber-300">"{result.originalRoot.phoneticPronunciation}"</span>
                                    <span className="text-slate-500">({result.originalRoot.transliteration})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        
                        {/* Box 1: Original Language Card (Span 3) */}
                        <div className="md:col-span-3 glass-card p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col justify-between shadow-lg relative bg-gradient-to-br from-amber-950/5 to-[#1e1b4b]/20">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                                    <Globe className="w-5 h-5 text-amber-400" />
                                    <span>الاشتقاق والخصائص المعجمية</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white font-serif">الأصل اللغوي والمفهوم الحرفي</h3>
                                <p className="text-slate-300 text-base leading-relaxed font-light">
                                    ينبع هذا المصطلح من اللغة <span className="font-bold text-amber-300">{result.originalRoot.language}</span>، حيث يرمز اللفظ <span className="text-white font-mono" dir="ltr">{result.originalRoot.word}</span> إلى:
                                </p>
                                <div className="bg-amber-500/10 border-r-4 border-amber-500 p-4 rounded-l-xl">
                                    <p className="text-amber-200 text-sm leading-relaxed italic">
                                        "{result.originalRoot.literalTranslation}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: Semantic Web - LXX / NT Bridge (Span 3) */}
                        <div className="md:col-span-3 glass-card p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col justify-between shadow-lg relative bg-gradient-to-br from-[#1e1b4b]/10 to-amber-950/5">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                                    <Layers className="w-5 h-5 text-indigo-400" />
                                    <span>التطور اللاهوتي والترجمة السبعينية</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white font-serif">دائرة العلاقات اللغوية</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-bold text-indigo-300 block mb-1">العهد القديم (الترجمة السبعينية LXX):</span>
                                        <p className="text-slate-300 leading-relaxed font-light">{result.semanticWeb.oldTestamentSeptuagint}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-amber-300 block mb-1">العهد الجديد (الكمال الروحي):</span>
                                        <p className="text-slate-300 leading-relaxed font-light">{result.semanticWeb.newTestamentDevelopment}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box 3: Patristic Golden Quote (Span 6 - FULL WIDTH GOLDEN BOX) */}
                        <div className="md:col-span-6 border border-amber-500/20 bg-amber-950/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                            <div className="absolute right-4 bottom-4 text-amber-500/5 select-none pointer-events-none">
                                <Quote className="w-48 h-48" />
                            </div>
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                                    <Quote className="w-5 h-5 text-amber-400" />
                                    <span>الامتداد الآبائي والعقيدة الأرثوذكسية</span>
                                </div>
                                
                                <div className="text-center max-w-4xl mx-auto space-y-4 py-3">
                                    <p className="text-amber-100 font-serif text-xl md:text-2xl font-medium leading-relaxed italic block px-4">
                                        " {result.patristicDogma.goldenQuote} "
                                    </p>
                                    <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-slate-300 text-xs font-bold">
                                        — {result.patristicDogma.fatherName}
                                    </span>
                                </div>

                                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 text-sm md:text-base leading-relaxed">
                                    <h4 className="font-bold text-amber-400 mb-2">الدراسة والتفسير العقائدي:</h4>
                                    <p className="text-slate-300 leading-relaxed font-light">{result.patristicDogma.analyticalExplanation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Box 4: Liturgical Echo Card (Span 3) */}
                        <div className="md:col-span-3 glass-card p-6 md:p-8 rounded-3xl border border-white/5 shadow-lg space-y-4 bg-gradient-to-b from-slate-900 via-slate-900 to-[#1e1b4b]/20">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                <Music className="w-5 h-5" />
                                <span>الصلوات الطقسية الحالية</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white font-serif">الصدى الليتورجي في الكنيسة</h3>
                            <div className="space-y-4 text-xs md:text-sm">
                                <div className="bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/10">
                                    <span className="font-bold text-emerald-400 block mb-1">في القداس الإلهي:</span>
                                    <p className="text-slate-300 leading-relaxed font-light">{result.liturgicalEcho.liturgyMentions}</p>
                                </div>
                                <div className="bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/10">
                                    <span className="font-bold text-indigo-400 block mb-1">في التسبحة والأبصالمودية:</span>
                                    <p className="text-slate-300 leading-relaxed font-light">{result.liturgicalEcho.copticPraiseMentions}</p>
                                </div>
                            </div>
                        </div>

                        {/* Box 5: Servants Spiritual Guide (Span 3) */}
                        <div className="md:col-span-3 glass-card p-6 md:p-8 rounded-3xl border border-white/5 shadow-lg space-y-4 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                                <Activity className="w-5 h-5" />
                                <span>للوحة الخادم - توجيه روحي للخدمة</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white font-serif">التطبيق المنهجي والوجداني للأبناء</h3>
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
                                {result.liturgicalEcho.spiritualReflection}
                            </p>
                            <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-xs text-slate-400">
                                <span className="font-bold text-amber-300 block mb-1">💡 نصيحة الخدمة:</span>
                                قم بشرح أصل الكلمة ورسم شكلها باليونانية على اللوحة للأبناء، لتشويقهم وتعميق رابطهم بلغة التسبحة والآباء.
                            </div>
                        </div>

                    </div>

                    {/* Quick Golden Info Bento Cards (Sleek Horizontal Container) */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white font-serif pr-1">شذرات لاهوتية سريعة:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {result.bentoCards && result.bentoCards.map((card, idx) => (
                                <div key={idx} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            <span className="text-xs font-bold text-amber-400">{card.title}</span>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed font-light">{card.content}</p>
                                    </div>
                                    <span className="text-slate-600 text-[10px] uppercase font-mono mt-3 text-left">
                                        #{card.iconType || 'theology'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scripture References Concordance Panel */}
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-amber-500/15 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2.5 text-amber-400">
                                <BookOpen className="w-6 h-6" />
                                <h3 className="text-2xl font-bold text-white font-serif">شواهد الآيات وسياقها اللغوي</h3>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">اختر آية لعرض تفسير لاهوتي مكثف</span>
                        </div>

                        {/* Interactive Verses Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            
                            {/* Verses List Tabs (4 Columns) */}
                            <div className="md:col-span-4 space-y-2.5">
                                {result.keyVerses.map((verse, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveVerseIndex(index)}
                                        className={`w-full text-right p-4 rounded-xl border transition-all text-sm flex flex-col gap-1.5 focus:outline-none ${
                                            activeVerseIndex === index
                                                ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                                                : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="font-bold text-amber-400 font-serif">{verse.reference}</span>
                                        <p className="text-xs text-slate-300 font-light truncate w-full">{verse.verseText}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Active Verse Detailed Box (8 Columns) */}
                            <div className="md:col-span-8 bg-slate-900/60 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                                {result.keyVerses[activeVerseIndex] && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">نص الآية المعتمد</span>
                                            <span className="text-sm font-bold text-amber-400 font-serif" dir="rtl">
                                                {result.keyVerses[activeVerseIndex].reference}
                                            </span>
                                        </div>
                                        
                                        <p className="text-white text-lg font-serif leading-relaxed font-bold bg-white/5 p-4 rounded-xl border-r-4 border-amber-500">
                                            « {result.keyVerses[activeVerseIndex].verseText} »
                                        </p>

                                        <div className="space-y-1">
                                            <span className="font-bold text-xs text-slate-400 block">دراسة النعمة والربط بالاصطلاح:</span>
                                            <p className="text-slate-300 text-sm leading-relaxed font-light">
                                                {result.keyVerses[activeVerseIndex].briefTheologicalNote}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};
