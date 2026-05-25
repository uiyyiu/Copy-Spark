
import React, { useState } from 'react';
import { StadiumIcon, UsersIcon, TargetIcon } from './icons';
import GuidedTour, { TourStep } from './GuidedTour';
import { HelpCircle } from 'lucide-react';

interface GameBankFormProps {
    onSubmit: (count: string, place: string, tools: string, goal: string) => void;
    isLoading: boolean;
}

const GameBankForm: React.FC<GameBankFormProps> = ({ onSubmit, isLoading }) => {
    const [count, setCount] = useState('');
    const [place, setPlace] = useState('');
    const [tools, setTools] = useState('');
    const [goal, setGoal] = useState('');
    const [isTourOpen, setIsTourOpen] = useState(false);

    const tourSteps: TourStep[] = [
        {
            targetId: 'tour-games-count',
            title: 'عدد المشاركين 👥',
            description: 'أدخل عدد المخدومين أو المشتركين (مثال: 30 طفل، مجموعة صغيرة، فصل كامل...) ليتم اقتراح قواعد ألعاب مناسبة لحجم المجموعة لتفادي الضوضاء أو الملل.',
            position: 'bottom'
        },
        {
            targetId: 'tour-games-place',
            title: 'مكان النشاط 🏛️',
            description: 'حدد أين ستقام اللعبة بدقة (مثال: داخل الفصل الدراسي، ملعب مفتوح، الكنيسة، الأتوبيس...). سيقوم الذكاء الاصطناعي باستبعاد الألعاب الحركية العنيفة إذا كان المكان ضيقاً، أو ترشيح ألعاب ذات طاقة حركية عالية للملاعب.',
            position: 'bottom'
        },
        {
            targetId: 'tour-games-goal',
            title: 'الهدف من اللعبة (روحي أو تربوي) 🎯',
            description: 'اكتب هنا إذا كان للعبة هدف محدد (مثل: تشجيع التعاون، حفظ آية الدرس، تنمية فضيلة المحبة، أو كسر الجليد وتنشيط المجموعتين).',
            position: 'top'
        },
        {
            targetId: 'tour-games-tools',
            title: 'الأدوات المتوفرة 🛠️',
            description: 'ضع قائمة بالخامات البسيطة التي تمتلكها (كرة، أوراق، كراسي، أقلام، إلخ). ستحصل على لعبة ممتازة تستغل هذه الأدوات المتاحة بدقة شديدة وبدون تكاليف.',
            position: 'top'
        },
        {
            targetId: 'tour-games-submit',
            title: 'عرض وتوليد الألعاب ⚡',
            description: 'اضغط هنا ليقوم مرشد الألعاب بتحليل مدخلاتك واقتراح بنك ألعاب فريد مع شرح القواعد والسيناريو العملي لكل لعبة!',
            position: 'top'
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (count && place) {
            onSubmit(count, place, tools || 'بدون أدوات', goal);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in-up relative">
            <div className="text-center mb-10 relative">
                <button
                    type="button"
                    onClick={() => setIsTourOpen(true)}
                    className="absolute top-0 left-0 md:left-4 z-20 cursor-pointer bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-500/30 flex items-center gap-1.5 transition-all shadow-md active:scale-95 animate-pulse"
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>جولة تعليمية 🗺️</span>
                </button>

                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md font-serif pt-8 md:pt-0">
                    بنك الألعاب
                </h2>
                <p className="text-lg text-white/90 font-medium drop-shadow">
                    اقترح ألعاباً تناسب إمكانياتك الحالية
                </p>
            </div>

            <div className="glass-card p-6 md:p-10 rounded-3xl shadow-2xl border border-green-500/30 bg-gradient-to-b from-green-900/20 to-[#0f172a]/60 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div id="tour-games-count">
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

                    <div id="tour-games-place">
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

                    <div id="tour-games-goal">
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

                    <div id="tour-games-tools">
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
                        id="tour-games-submit"
                        disabled={isLoading}
                        className="w-full text-white font-bold text-lg py-4 px-6 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all shadow-lg hover:shadow-green-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                    >
                        {isLoading ? 'جاري البحث...' : 'اقترح الألعاب'}
                    </button>
                </form>
            </div>

            <GuidedTour 
                isOpen={isTourOpen} 
                onClose={() => setIsTourOpen(false)} 
                steps={tourSteps} 
                tourKey="game-bank-tour"
            />
        </div>
    );
};

export default GameBankForm;
