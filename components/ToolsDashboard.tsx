import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { NoteIcon, StadiumIcon, ScrollIcon, BookOpenIcon, SunIcon, MoonIcon, SparklesIcon, TargetIcon } from './icons';
import type { Variants } from 'motion/react';

export type ToolId = 'lesson-builder' | 'game-bank' | 'patristic-assistant' | 'bible-reader' | 'curriculum-builder';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            duration: 0.6, 
            ease: "easeOut" 
        } 
    }
};

const tools = [
    {
        id: 'lesson-builder' as ToolId,
        title: 'تحضير درس',
        description: 'توليد خطط دروس متكاملة تشمل المقدمة والشرح والتطبيقات العملية.',
        icon: NoteIcon,
        color: 'amber',
        image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'curriculum-builder' as ToolId,
        title: 'تخطيط مناهج',
        description: 'بناء مناهج روحية ربع سنوية متكاملة تضمن نمواً متوازناً للمخدومين.',
        icon: TargetIcon,
        color: 'purple',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'game-bank' as ToolId,
        title: 'بنك الأنشطة',
        description: 'ألعاب هادفة ووسائل إيضاح مبتكرة تناسب كافة الإمكانيات والمساحات.',
        icon: StadiumIcon,
        color: 'emerald',
        image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'patristic-assistant' as ToolId,
        title: 'بحث آبائي',
        description: 'باحث لاهوتي ذكي متخصص في التراث الآبائي والعقيدة الأرثوذكسية.',
        icon: ScrollIcon,
        color: 'sky',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'bible-reader' as ToolId,
        title: 'الكتاب المقدس',
        description: 'دراسة الكتاب المقدس بعمق مع ربط فوري بأقوال الآباء والتفاسير.',
        icon: BookOpenIcon,
        color: 'rose',
        image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop'
    }
];

interface ToolsDashboardProps {
    onSelectTool: (tool: ToolId) => void;
    user?: any;
}

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
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 17) return 'يومك مبارك';
        return 'مساء الخير';
    };

    const dailyMessage = useMemo(() => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        return dailyVerses[dayOfYear % dailyVerses.length];
    }, []);

    const greeting = getGreeting();
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'أيها الخادم الأمين';

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-12" dir="rtl">
            
            {/* Elegant Header Section */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-16 relative overflow-hidden rounded-[3rem] glass-card border border-white/10 bg-slate-900/40 p-10 md:p-14 shadow-2xl"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex-1 text-center md:text-right">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6 tracking-widest uppercase"
                        >
                            <SparklesIcon className="w-3.5 h-3.5" />
                            <span>نفحة روحية</span>
                        </motion.div>
                        <motion.h3 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-2xl md:text-4xl font-spiritual text-white leading-relaxed mb-8 italic"
                        >
                            {dailyMessage.verse}
                        </motion.h3>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-col md:flex-row items-center gap-6"
                        >
                            <div className="flex items-center gap-3 text-slate-300 text-lg">
                                {greeting === 'صباح الخير' ? <SunIcon className="w-6 h-6 text-amber-400" /> : <MoonIcon className="w-6 h-6 text-indigo-400" />}
                                <span className="font-display italic">{greeting}، {userName}</span>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 text-amber-200/90 font-spiritual italic text-lg shadow-inner">
                                " {dailyMessage.message} "
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <div className="flex items-center justify-between mb-12 px-4">
                <div className="h-0.5 flex-grow bg-gradient-to-l from-white/10 to-transparent"></div>
                <h2 className="mx-8 text-2xl md:text-4xl font-display text-white tracking-widest uppercase italic font-black opacity-80">
                    استوديو الخدمة
                </h2>
                <div className="h-0.5 flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            >
                {tools.map((tool) => (
                    <motion.button
                        key={tool.id}
                        variants={itemVariants}
                        onClick={() => onSelectTool(tool.id)}
                        whileHover={{ y: -10 }}
                        className="group relative overflow-hidden rounded-[2.5rem] glass-card border border-white/5 bg-slate-900/30 transition-all duration-500 h-[28rem] text-right flex flex-col"
                    >
                        <div className="absolute inset-0 z-0">
                            <img src={tool.image} alt={tool.title} className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-all duration-700 grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100" />
                            <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950`}></div>
                        </div>

                        <div className="relative z-10 p-8 flex flex-col h-full justify-end">
                            <div className={`w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500 text-${tool.color}-400 group-hover:bg-${tool.color}-500/10`}>
                                <tool.icon className="w-8 h-8" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-amber-400 transition-colors font-display italic tracking-tight">
                                {tool.title}
                            </h3>
                            
                            <p className="text-slate-400 text-base leading-relaxed mb-8 group-hover:text-slate-200 transition-colors font-spiritual italic opacity-80">
                                {tool.description}
                            </p>

                            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-white transition-all overflow-hidden w-fit">
                                <span className="transform translate-x-2 group-hover:translate-x-0 transition-transform duration-300">استكشاف</span>
                                <div className="h-0.5 w-8 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-300"></div>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default ToolsDashboard;
