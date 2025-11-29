
import React, { useState } from 'react';
import { StadiumIcon, UsersIcon, TargetIcon } from './icons';

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
        <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md font-serif">
                    بنك الألعاب
                </h2>
                <p className="text-lg text-white/90 font-medium drop-shadow">
                    اقترح ألعاباً تناسب إمكانياتك الحالية
                </p>
            </div>

            <div className="glass-card p-6 md:p-10 rounded-3xl shadow-2xl border border-green-500/30 bg-gradient-to-b from-green-900/20 to-[#0f172a]/60 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <UsersIcon className="w-5 h-5 text-green-400" />
                            <label className="spark-h3 text-white">عدد المشاركين</label>
                        </div>
                        <input 
                            type="text" 
                            value={count} 
                            onChange={(e) => setCount(e.target.value)}
                            placeholder="مثال: 50 طفل، مجموعة صغيرة، فصل كامل..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <StadiumIcon className="w-5 h-5 text-green-400" />
                            <label className="spark-h3 text-white">المكان المتاح</label>
                        </div>
                        <input 
                            type="text" 
                            value={place} 
                            onChange={(e) => setPlace(e.target.value)}
                            placeholder="مثال: داخل الفصل، ملعب مفتوح، الأتوبيس..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TargetIcon className="w-5 h-5 text-green-400" />
                            <label className="spark-h3 text-white">الهدف (اختياري)</label>
                        </div>
                        <input 
                            type="text" 
                            value={goal} 
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="مثال: التعاون، المحبة، حفظ آية..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1 mr-1">إذا كتبت هدفاً، ستكون الألعاب مصممة لخدمته.</p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="spark-h3 text-white">الأدوات المتاحة (اختياري)</label>
                        </div>
                        <input 
                            type="text" 
                            value={tools} 
                            onChange={(e) => setTools(e.target.value)}
                            placeholder="مثال: كرة، ورقة وقلم، كراسي، بدون أدوات..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-white font-bold text-lg py-4 px-6 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all shadow-lg hover:shadow-green-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                    >
                        {isLoading ? 'جاري البحث...' : 'اقترح الألعاب'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GameBankForm;
