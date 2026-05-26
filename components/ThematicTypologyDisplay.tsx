import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    Compass, 
    BookOpen, 
    GitCommit, 
    ArrowLeftRight, 
    Quote, 
    Sparkles, 
    ArrowRight, 
    Printer, 
    FileText, 
    Cpu, 
    HelpCircle, 
    CheckCircle2, 
    MapPin,
    AlertCircle
} from 'lucide-react';
import { generateThematicTypology } from '../services/geminiService';
import type { TypologyResult } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ThematicTypologyProps {
    onBack: () => void;
    user?: any;
    onError: (err: string) => void;
}

const PRESET_TYPOLOGIES = [
    { label: 'العليقة المشتعلة (التجسد ودوام البتولية)', query: 'العليقة المشتعلة بالنار ولا تحترق والتجسد الإلهي وبتولية العذراء مريم' },
    { label: 'ذبيحة إسحق (رمز طاعة الصليب والفداء)', query: 'تقديم إسحق ذبيحة على جبل المريا وذبيحة المسيح الفدائية الطوعية' },
    { label: 'المن السماوي (سر الخبز الحقيقي المحيي)', query: 'المن النازل من السماء في البرية وسر الإفخارستيا وجسد المسيح المحيي' },
    { label: 'صخرة حوريب (تفجير مياه وعطش الروح)', query: 'صخرة حوريب المضروبة المفجرة للماء والروح القدس المروي للنفوس في العهد الجديد' },
    { label: 'يونان في بطن الحوت (رمز القبر القيامي)', query: 'يونان في جوف الحوت ثلاثة أيام وثلاث ليال وموت المسيح وقيامته المجيدة في اليوم الثالث' },
    { label: 'خروف الفصح (الدم الحامي من الهلاك الموت)', query: 'ذبح خروف الفصح ورش دمه على القائمتين والعتبة العليا وذبيحة الصليب الفصحية' }
];

export const ThematicTypologyDisplay: React.FC<ThematicTypologyProps> = ({ onBack, user, onError }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TypologyResult | null>(null);

    const handleSearch = async (queryToSearch: string) => {
        const query = queryToSearch.trim();
        if (!query) return;

        setIsLoading(true);
        setSearchTerm(query);
        try {
            const data = await generateThematicTypology(query);
            setResult(data);
        } catch (err: any) {
            onError(err.message || 'حدث خطأ أثناء فك رموز العهد القديم وتتبع الظلال والنبؤات.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in text-right" dir="rtl">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-rose-500/10 pb-6 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3 font-serif">
                        <span className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                            <Compass className="w-7 h-7" />
                        </span>
                        رموز العهد القديم وربطها بالعهد الجديد
                    </h2>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed max-w-xl">
                        أداة دراسية لقرن الرموز والظلال اللاهوتية بالعهد القديم (Types) وجوهر تحقيقها الفدائي والأسراري بالعهد الجديد (Antitypes).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {result && (
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl transition-all text-sm"
                        >
                            <Printer className="w-4 h-4 ml-1" />
                            طباعة ورقة الدرس
                        </button>
                    )}
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 text-white rounded-xl transition-all text-sm"
                    >
                        <ArrowRight className="w-5 h-5 ml-1 text-rose-500" />
                        العودة للاستوديو
                    </button>
                </div>
            </div>

            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:block text-center space-y-4 border-b-2 border-slate-900 pb-6">
                <h1 className="text-3xl font-bold text-slate-900 font-serif">مكتبة خادم مدارس الأحد الأرثوذكسية</h1>
                <p className="text-lg text-slate-700">دراسة لاهوتية نموذجية: رموز العهد القديم وربطها بالعهد الجديد</p>
                <div className="text-xs text-slate-500 flex justify-center gap-6">
                    <span>التاريخ الدراسي: {new Date().toLocaleDateString('ar-EG')}</span>
                    <span>تصميم الدرس بالذكاء الاصطناعي التفاعلي</span>
                </div>
            </div>

            {/* Input & Presets Container */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-rose-500/15 shadow-xl relative overflow-hidden bg-gradient-to-br from-rose-950/10 to-indigo-950/10 print:hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[80px] pointer-events-none"></div>

                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch(searchTerm);
                                }}
                                placeholder="اكتب رمزاً من العهد القديم (مثال: حية النحاس)"
                                className="w-full pr-14 pl-4 py-4.5 bg-slate-900/60 border-2 border-white/10 focus:border-rose-500/50 focus:ring-0 rounded-2xl text-white text-lg placeholder:text-slate-500 font-sans tracking-wide transition-all text-right"
                                dir="rtl"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-rose-500">
                                <Compass className="w-6 h-6" />
                            </div>
                        </div>
                        <button 
                            disabled={isLoading}
                            onClick={() => handleSearch(searchTerm)}
                            className="px-8 py-4.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 text-base cursor-pointer shrink-0"
                        >
                            <Compass className="w-5 h-5" />
                            <span>تحليل الرابط والظلال</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-slate-400 text-xs font-bold block">رموز موسوية وظلال نبوية كبرى مقترحة للدراسة:</label>
                        <div className="flex flex-wrap gap-2.5">
                            {PRESET_TYPOLOGIES.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSearch(preset.query)}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/5 bg-white/5 text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-200 transition-all cursor-pointer"
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
                <div className="py-20 flex flex-col items-center justify-center gap-4 print:hidden">
                    <LoadingSpinner />
                    <p className="text-rose-400/90 font-serif animate-pulse text-lg mt-2">
                        جاري جمع شواهد العهدين المقارنة وتتبع التفسير الآبائي والرموز الموسوية السبع...
                    </p>
                </div>
            )}

            {/* Typology Display Content */}
            {result && !isLoading && (
                <div className="space-y-8 animate-fade-in print:text-black">
                    
                    {/* Welcome Concept Card */}
                    <div className="p-6 md:p-8 rounded-3xl border border-rose-500/20 bg-gradient-to-r from-rose-950/20 to-indigo-900/15 relative overflow-hidden shadow-xl print:bg-none print:border-slate-300">
                        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[50%] rounded-full bg-rose-500/10 blur-[80px] print:hidden"></div>
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold mb-3 print:border-slate-500 print:text-slate-700">
                                دراسة مطابقة العهدين والظلال النبوية
                            </span>
                            <h1 className="text-4xl font-extrabold text-white font-serif mb-2 print:text-slate-900">
                                {result.symbolName}
                            </h1>
                            <p className="text-slate-300 text-base max-w-4xl leading-relaxed mt-2 font-light print:text-slate-700">
                                كيف ترسم كنيستنا الأرثوذكسية بعمقها الآبائي العريق خطوط التلاقي والمقابلة ليرى الخادم والمخدوم صورة المسيح الفادي في كل تفاصيل الناموس وظلاله.
                            </p>
                        </div>
                    </div>

                    {/* Interactive Comparison Flow Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-stretch">
                        
                        {/* Old Testament: The Shadow/Type (Amber Accent) */}
                        <div className="lg:col-span-5 glass-card p-6 md:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/5 to-slate-950/40 relative shadow-lg flex flex-col justify-between print:border-slate-300 print:bg-none">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                                    <BookOpen className="w-5 h-5" />
                                    <span>العهد القديم: الظل والرمز الأساسي (Type)</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white font-serif print:text-slate-900">
                                    • {result.otContext.symbolTitle}
                                </h3>
                                <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-300 font-mono text-xs font-bold print:border-slate-400 print:text-slate-800">
                                    الشاهد الدراسي: {result.otContext.passage}
                                </div>
                                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light print:text-slate-700">
                                    {result.otContext.description}
                                </p>
                            </div>
                            
                            <div className="mt-6 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-xs md:text-sm print:border-slate-300">
                                <span className="font-bold text-amber-400 block mb-1">المغزى اللاهوتي في العصر القديم:</span>
                                <p className="text-slate-300 font-light print:text-slate-700">{result.otContext.theologicalMeaning}</p>
                            </div>
                        </div>

                        {/* Interactive Dynamic Arrow Bridge (Desktop Only) */}
                        <div className="lg:col-span-1 hidden lg:flex flex-col items-center justify-center relative print:hidden">
                            <div className="h-full w-0.5 bg-gradient-to-b from-amber-500/50 via-rose-500 to-indigo-500/50 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-slate-900 border border-rose-500/50 rounded-full text-rose-400 shadow-md animate-pulse">
                                    <ArrowLeftRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* New Testament: The Reality/Fulfillment (Indigo Accent) */}
                        <div className="lg:col-span-5 glass-card p-6 md:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-[#1e1b4b]/10 to-slate-950/40 relative shadow-lg flex flex-col justify-between print:border-slate-300 print:bg-none">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                    <span>العهد الجديد: الحقيقة والتحقيق الخلاصي (Antitype)</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white font-serif print:text-slate-900">
                                    • {result.ntFulfillment.realityTitle}
                                </h3>
                                <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-indigo-300 font-mono text-xs font-bold print:border-slate-400 print:text-slate-800">
                                    الآية المعتمدة: {result.ntFulfillment.passage}
                                </div>
                                
                                <div className="p-4 bg-slate-900/60 rounded-2xl border-r-4 border-indigo-500 text-slate-200 text-sm md:text-base italic font-serif leading-relaxed font-bold print:bg-slate-100 print:text-slate-900 print:border-slate-500">
                                    « {result.ntFulfillment.verseText} »
                                </div>
                            </div>
                            
                            <div className="mt-6 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-xs md:text-sm print:border-slate-300">
                                <span className="font-bold text-indigo-400 block mb-1">الربط والتحقيق الإنجيلي العظيم:</span>
                                <p className="text-slate-300 font-light print:text-slate-700">{result.ntFulfillment.theologicalLink}</p>
                            </div>
                        </div>

                    </div>

                    {/* Timeline of Divine Revelation (Glowing Steps) */}
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-rose-500/15 shadow-xl space-y-6 print:border-slate-300">
                        <div className="flex items-center gap-2.5 text-rose-400">
                            <Cpu className="w-6 h-6" />
                            <h3 className="text-2xl font-bold text-white font-serif print:text-slate-900">مسار الإعلان الإلهي وتدبير الخلاص في التاريخ</h3>
                        </div>
                        
                        <p className="text-slate-300 text-sm max-w-2xl print:text-slate-700">
                            تتبع كيف ينساب الرمز الإلهي من مجرد مشهد أو ناموس بسيط إلى تحقيق كنسي ليتورجي وعقيدي نعيشه اليوم:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 relative">
                            {result.timelineSteps && result.timelineSteps.map((step, idx) => (
                                <div key={idx} className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 relative flex flex-col justify-between hover:border-rose-500/30 transition-all print:border-slate-300 print:bg-none">
                                    <div className="absolute -top-3.5 right-4 px-3 py-1 bg-rose-500 text-white text-xs font-bold font-serif rounded-full shadow-md">
                                        {step.stage}
                                    </div>
                                    <div className="space-y-2 mt-2">
                                        <h4 className="font-bold text-white text-base font-serif pt-1 print:text-slate-900">{step.title}</h4>
                                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-light print:text-slate-700">
                                            {step.details}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Patristic Treatise and Golden Quote */}
                    <div className="border border-rose-500/20 bg-rose-950/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl print:border-slate-300 print:bg-none">
                        <div className="absolute right-4 bottom-4 text-rose-500/5 select-none pointer-events-none print:hidden">
                            <Quote className="w-48 h-48" />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2.5 text-rose-400">
                                <Quote className="w-5 h-5 text-rose-400" />
                                <span className="font-bold text-sm tracking-widest text-rose-400 uppercase">الذهب الآبائي الأرثوذكسي</span>
                            </div>
                            
                            <div className="text-center max-w-4xl mx-auto space-y-4 py-2">
                                <p className="text-rose-100 font-serif text-xl md:text-2xl font-medium leading-relaxed italic block px-4 print:text-slate-900">
                                    " {result.patristicInsight.quote} "
                                </p>
                                <span className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-slate-300 text-xs font-bold print:border-slate-400 print:text-slate-800">
                                    — القلم الآبائي: {result.patristicInsight.fatherName}
                                </span>
                            </div>

                            <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 text-sm md:text-base leading-relaxed print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                                <h4 className="font-bold text-rose-400 mb-2 print:text-slate-900">الشرح والتفسير الرمزي العقائدي:</h4>
                                <p className="text-slate-300 leading-relaxed font-light print:text-slate-700">{result.patristicInsight.explanation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sunday School Toolbox / Servant Guidance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Box 1: Sunday School Activity */}
                        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 bg-slate-900/40 relative space-y-3 print:border-slate-300 print:bg-none">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                                <Sparkles className="w-4 h-4" />
                                <span>نشاط تفاعلي مقترح للفصل</span>
                            </div>
                            <h4 className="text-lg font-bold text-white font-serif print:text-slate-900">تثبيت الرمز بالمعاينة والممارسة</h4>
                            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-light print:text-slate-700">
                                {result.spiritualApplication.classActivity}
                            </p>
                        </div>

                        {/* Box 2: Servant TIP / Pedagogical Advice */}
                        <div className="glass-card p-6 rounded-2xl border border-emerald-500/10 bg-slate-900/40 relative space-y-3 print:border-slate-300 print:bg-none">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                <FileText className="w-4 h-4" />
                                <span>نصائح ووسائل إيضاح للخادم</span>
                            </div>
                            <h4 className="text-lg font-bold text-white font-serif print:text-slate-900">توصيل النعمة والبرهان البسيط</h4>
                            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-light print:text-slate-700">
                                {result.spiritualApplication.servantTip}
                            </p>
                        </div>

                        {/* Box 3: Spiritual Heartbeat / takeaway */}
                        <div className="glass-card p-6 rounded-2xl border border-rose-500/10 bg-slate-900/40 relative space-y-3 print:border-slate-300 print:bg-none">
                            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                                <HelpCircle className="w-4 h-4" />
                                <span>جوهر البرهان والرسالة الوجدانية</span>
                            </div>
                            <h4 className="text-lg font-bold text-white font-serif print:text-slate-900">الصدى الروحي بوجدان أبنائك</h4>
                            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-light print:text-slate-700">
                                {result.spiritualApplication.summaryMessage}
                            </p>
                        </div>

                    </div>

                    {/* Bento Mini-Insights Grid */}
                    {result.bentoInsights && result.bentoInsights.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white font-serif pr-1 print:text-slate-900">شذرات ولآلئ رمزية سريعة:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {result.bentoInsights.map((insight, idx) => (
                                    <div key={idx} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-rose-500/30 transition-all print:border-slate-300 print:bg-none">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
                                                <span className="text-xs font-bold text-rose-300 print:text-slate-700">{insight.title}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed font-light print:text-slate-800">{insight.content}</p>
                                        </div>
                                        <span className="text-slate-600 text-[10px] font-mono mt-3 text-left uppercase">
                                            {insight.category}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};
