import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StadiumIcon, UsersIcon, TargetIcon, SparklesIcon } from './icons';

interface GameBankFormProps {
    onSubmit: (count: string, place: string, tools: string, goal: string) => void;
    isLoading: boolean;
}

const GameBankForm: React.FC<GameBankFormProps> = ({ onSubmit, isLoading }) => {
    const [count, setCount] = useState('');
    const [place, setPlace] = useState('');
    const [tools, setTools] = useState('');
    const [goal, setGoal] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (count && place) {
            onSubmit(count, place, tools || 'بدون أدوات', goal);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto"
            dir="rtl"
        >
            <div className="text-center mb-16">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                    <StadiumIcon className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <h2 className="text-5xl font-black text-white mb-6 font-display italic tracking-tight uppercase">بنك الأنشطة</h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-spiritual italic">
                    حوّل إمكانياتك المتاحة إلى تجربة تفاعلية وأنشطة هادفة للمخدومين.
                </p>
                <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full mt-8 opacity-30"></div>
            </div>

            <div className="glass-card p-10 md:p-14 rounded-[3.5rem] border border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                <label className="text-white font-black font-display italic tracking-tight uppercase">عدد المخدومين</label>
                            </div>
                            <input 
                                type="text" 
                                value={count} 
                                onChange={(e) => setCount(e.target.value)}
                                placeholder="مثال: 50 بطل، مجموعة صغيرة، كشافة..."
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-spiritual italic text-lg"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <StadiumIcon className="w-5 h-5" />
                                </div>
                                <label className="text-white font-black font-display italic tracking-tight uppercase">المكان المتاح</label>
                            </div>
                            <input 
                                type="text" 
                                value={place} 
                                onChange={(e) => setPlace(e.target.value)}
                                placeholder="مثال: قصر ملكي، ملعب مفتوح، رحلة صيفية..."
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-spiritual italic text-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <TargetIcon className="w-5 h-5" />
                            </div>
                            <label className="text-white font-black font-display italic tracking-tight uppercase">الهدف الروحي</label>
                        </div>
                        <input 
                            type="text" 
                            value={goal} 
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="مثال: روح التعاون، ثمار المحبة، حفظ آية ذهبية..."
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-spiritual italic text-lg"
                        />
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black pr-4">سيتولى الذكاء الاصطناعي برمجت اللعبة لخدمة هذا الهدف بدقة.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                            <label className="text-white font-black font-display italic tracking-tight uppercase">الأدوات المتاحة</label>
                        </div>
                        <input 
                            type="text" 
                            value={tools} 
                            onChange={(e) => setTools(e.target.value)}
                            placeholder="مثال: كرة من الخيال، خيوط ملونة، أو بلا أدوات على الإطلاق..."
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-spiritual italic text-lg"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 px-8 rounded-[2rem] bg-emerald-500 text-slate-950 font-black font-display italic text-xl tracking-tighter uppercase disabled:opacity-30 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 group"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon className="w-6 h-6 animate-spin" />
                                <span>جاري هندسة الأفكار...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6 group-hover:animate-spin transition-all" />
                                <span>ابتكار الألعاب</span>
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
            <p className="text-center text-slate-600 text-[10px] uppercase font-black tracking-[0.3em] mt-10 opacity-50">Creative Interactive Engineering Powered by SPARK</p>
        </motion.div>
    );
};

export default GameBankForm;

const SpinnerIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
