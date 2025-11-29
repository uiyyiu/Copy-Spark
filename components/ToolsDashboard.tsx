
import React from 'react';
import { NoteIcon, StadiumIcon, ScrollIcon, BookOpenIcon } from './icons';

export type ToolId = 'lesson-builder' | 'game-bank' | 'patristic-assistant' | 'bible-reader';

interface ToolsDashboardProps {
    onSelectTool: (tool: ToolId) => void;
}

const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ onSelectTool }) => {
    
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
            <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md font-serif">
                    استوديو الخدمة
                </h2>
                <p className="text-lg text-slate-300 font-medium max-w-2xl mx-auto mb-6">
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
    