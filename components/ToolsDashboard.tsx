
import React, { useMemo } from 'react';
import { NoteIcon, StadiumIcon, ScrollIcon, BookOpenIcon, SunIcon, MoonIcon, SparklesIcon, TargetIcon } from './icons';

export type ToolId = 'lesson-builder' | 'game-bank' | 'patristic-assistant' | 'bible-reader' | 'curriculum-builder';

interface ToolsDashboardProps {
    onSelectTool: (tool: ToolId) => void;
    user?: any;
}

// Daily verses with simple, personal explanations
const dailyVerses = [
    {
        verse: "«لاَ تَخَفْ لأَنِّي مَعَكَ. لاَ تَتَلَفَّتْ لأَنِّي إِلهُكَ» (إشعياء 41: 10)",
        message: "أنا ساندك ومقويك في كل خطوة، متشلش هم بكرة، أنا موجود."
    },
    {
        verse: "«تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ وَالثَّقِيلِي الأَحْمَالِ، وَأَنَا أُرِيحُكُمْ» (متى 11: 28)",
        message: "هات حمولك وتعبي وتعالى، عندي ليك راحة لقلبك وفكرك."
    },
    {
        verse: "«هَا أَنَذَا قَدْ نَقَشْتُكِ عَلَى كَفَّيَّ» (إشعياء 49: 16)",
        message: "أنت غالي عندي جداً، ومكانك محفوظ في إيدي ومش ممكن أنساك."
    },
    {
        verse: "«أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي» (فيلبي 4: 13)",
        message: "مهما كانت الخدمة صعبة، بقوتي هتقدر تعمل كل حاجة."
    },
    {
        verse: "«لأَنِّي عَرَفْتُ الأَفْكَارَ الَّتِي أَنَا مُفْتَكِرٌ بِهَا عَنْكُمْ، يَقُولُ الرَّبُّ، أَفْكَارَ سَلاَمٍ لاَ شَرّ» (إرميا 29: 11)",
        message: "اطمن، كل خططي لحياتك ولخدمتك هي خير وسلام ونجاح."
    },
    {
        verse: "«فَرِحِينَ فِي الرَّجَاءِ، صَابِرِينَ فِي الضِّيقِ، مُواظِبِينَ عَلَى الصَّلاَةِ» (رومية 12: 12)",
        message: "خلي قلبك دايمًا فرحان ومتمسك بالأمل، وصلاتك هي سر قوتك."
    }
];

const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ onSelectTool, user }) => {
    
    // Determine Time of Day
    const getGreeting = () => {
        const hour = new Date().getHours();
        return hour < 12 ? 'صباح الخير' : 'مساء الخير';
    };

    // Pick a random verse (memoized to stay consistent during session)
    const dailyMessage = useMemo(() => {
        // Use the day of the year to pick a consistent verse for the day
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        return dailyVerses[dayOfYear % dailyVerses.length];
    }, []);

    const greeting = getGreeting();
    // Try to get first name
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'يا بطل';

    const tools = [
        {
            id: 'lesson-builder' as ToolId,
            title: 'تحضير الدرس الأسبوعي',
            description: 'توليد هيكل درس روحي متكامل بناءً على الفئة العمرية والشاهد الكتابي.',
            icon: NoteIcon,
            color: 'text-orange-400',
            bgGradient: 'from-orange-500/20 to-orange-900/20',
            hoverBorder: 'hover:border-orange-500/50',
            image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 'curriculum-builder' as ToolId,
            title: 'مخطط المنهج',
            description: 'إعداد سلسلة دروس متكاملة تغطي هدفاً روحياً واحداً (شهر أو أكثر).',
            icon: TargetIcon,
            color: 'text-purple-400',
            bgGradient: 'from-purple-500/20 to-purple-900/20',
            hoverBorder: 'hover:border-purple-500/50',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 'game-bank' as ToolId,
            title: 'بنك الألعاب',
            description: 'اقترح ألعاباً تناسب ظروفك اللوجستية لملء وقت الفراغ.',
            icon: StadiumIcon,
            color: 'text-green-400',
            bgGradient: 'from-green-500/20 to-green-900/20',
            hoverBorder: 'hover:border-green-500/50',
            image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 'bible-reader' as ToolId,
            title: 'الكتاب المقدس',
            description: 'العهدين القديم والجديد كاملاً (نسخة فاندايك) بتصميم احترافي.',
            icon: BookOpenIcon,
            color: 'text-amber-400',
            bgGradient: 'from-amber-500/20 to-amber-900/20',
            hoverBorder: 'hover:border-amber-500/50',
            image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 'patristic-assistant' as ToolId,
            title: 'المساعد العقيدي والآبائي',
            description: 'باحث لاهوتي للخادم: تفسير آيات، أقوال آباء، وردود على أسئلة عقيدية.',
            icon: ScrollIcon,
            color: 'text-sky-400',
            bgGradient: 'from-sky-500/20 to-sky-900/20',
            hoverBorder: 'hover:border-sky-500/50',
            image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop'
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in px-4 py-8">
            
            {/* Welcome Banner */}
            <div className="mb-12 relative overflow-hidden rounded-3xl glass-card border border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-[#0f172a]/60 p-8 md:p-10 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-right">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
                            <SparklesIcon className="w-3 h-3" />
                            <span>رسالتك اليوم</span>
                        </div>
                        <h3 className="text-xl md:text-3xl font-serif text-white leading-relaxed mb-6 font-bold drop-shadow-md">
                            {dailyMessage.verse}
                        </h3>
                        
                        <div className="space-y-2">
                            <p className="text-slate-300 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                                {greeting === 'صباح الخير' ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-indigo-400" />}
                                {greeting}، {userName}.
                            </p>
                            <p className="text-amber-200/90 text-base md:text-lg font-light italic bg-black/20 inline-block px-4 py-2 rounded-lg backdrop-blur-sm">
                                " {dailyMessage.message} "
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md font-serif">
                    استوديو الخدمة
                </h2>
                <p className="text-base text-slate-300 font-medium max-w-2xl mx-auto mb-6 opacity-80">
                    اختر الأداة المناسبة لاحتياجك الحالي.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool.id)}
                        className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl text-right flex flex-col h-full ${tool.hoverBorder}`}
                    >
                        <div className="absolute inset-0 z-0">
                            <img src={tool.image} alt={tool.title} className="w-full h-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40 grayscale group-hover:grayscale-0" />
                            <div className={`absolute inset-0 bg-gradient-to-b ${tool.bgGradient} opacity-60 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-80`}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>
                        </div>

                        <div className="relative z-10 p-8 flex flex-col h-full">
                            <div className={`w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 ${tool.color}`}>
                                <tool.icon className="w-9 h-9" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors font-serif leading-tight">
                                {tool.title}
                            </h3>
                            
                            <p className="text-slate-400 text-base leading-relaxed mb-8 group-hover:text-slate-200 transition-colors flex-grow">
                                {tool.description}
                            </p>

                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 group-hover:text-white transition-colors mt-auto">
                                <span>ابدأ الآن</span>
                                <svg className="w-5 h-5 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ToolsDashboard;
