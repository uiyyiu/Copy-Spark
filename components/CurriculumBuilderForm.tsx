
import React, { useState } from 'react';
import type { AgeGroup } from '../types';
import { TargetIcon, UsersIcon, NoteIcon, BookOpenIcon, LightBulbIcon, ClockIcon } from './icons';
import SmartAutoComplete from './SmartAutoComplete';
import GuidedTour, { TourStep } from './GuidedTour';
import { HelpCircle } from 'lucide-react';

interface CurriculumBuilderFormProps {
    onSubmit: (objective: string, duration: number, ageGroup: AgeGroup, notes: string, planType: 'series' | 'annual') => void;
    isLoading: boolean;
}

const ageGroups: AgeGroup[] = ['ابتدائي', 'اعدادي', 'ثانوي', 'شباب', 'خريجين'];

const CurriculumBuilderForm: React.FC<CurriculumBuilderFormProps> = ({ onSubmit, isLoading }) => {
    const [planType, setPlanType] = useState<'series' | 'annual'>('series');
    const [objective, setObjective] = useState('');
    const [duration, setDuration] = useState(4);
    const [ageGroup, setAgeGroup] = useState<AgeGroup>('ابتدائي');
    const [notes, setNotes] = useState('');
    const [isTourOpen, setIsTourOpen] = useState(false);

    const tourSteps: TourStep[] = [
        {
            targetId: 'tour-curr-type',
            title: 'نوع منهج الخدمة 📅',
            description: 'اختر "سلسلة أسابيع مركزة" لتوليد سلسلة مترابطة لهدف روحي محدد (من 3 إلى 6 أسابيع)، أو اختر "مخطط العام السنوي" لتوليد خطة منهج سنوية كاملة وموزعة على 12 شهراً لمدارس الأحد في ثوانٍ معدودة!',
            position: 'bottom'
        },
        {
            targetId: 'tour-curr-obj',
            title: 'الهدف الرئيسي للمنهج 🎯',
            description: 'اكتب الهدف أو الفضيلة العامة التي ترغب في غرسها في السلسلة ككل (مثال: غرس الشخصية الأرثوذكسية القوية، أو الأسرار الكنسية، السامري الصالح، إلخ).',
            position: 'bottom'
        },
        {
            targetId: 'tour-curr-duration-container',
            title: 'المدة الزمنية أو الموزع السنوي ⏱️',
            description: 'عند اختيار سلسلة مركزة، حدد عدد الأسابيع المستهدفة للمخطط لتوزيع الدروس، أو تصفح معلومات التوزيع السنوي الذكي.',
            position: 'top'
        },
        {
            targetId: 'tour-curr-age',
            title: 'المرحلة العمرية 👥',
            description: 'حدد السن المستهدف لضمان اختيار عناوين، شواهد، وأنشطة مناسبة للفهم والاستيعاب الخاص بالفئة العمرية المحددة.',
            position: 'top'
        },
        {
            targetId: 'tour-curr-submit',
            title: 'توليد المنهج 🚀',
            description: 'اضغط هنا ليقوم مرمج سبارك بتحليل مدخلاتك وبناء منهج روحي مترابط بشكل متزن ويخاطب العقول والقلوب!',
            position: 'top'
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (objective.trim().length >= 5) {
            onSubmit(objective, duration, ageGroup, notes, planType);
        }
    };

    const handleObjectiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setObjective(e.target.value);
    };

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in-up relative">
            <div className="text-center mb-10 relative">
                <button
                    type="button"
                    onClick={() => setIsTourOpen(true)}
                    className="absolute top-0 left-0 md:left-4 z-20 cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-500/30 flex items-center gap-1.5 transition-all shadow-md active:scale-95 animate-pulse"
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>جولة تعليمية 🗺️</span>
                </button>

                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md font-serif pt-8 md:pt-0">
                    مخطط المنهج
                </h2>
                <p className="text-lg text-white/90 font-medium drop-shadow">
                    جهز خطة متكاملة لهدف روحي واحد
                </p>
            </div>

            <div className="glass-card p-6 md:p-10 rounded-3xl shadow-2xl border border-purple-500/30 bg-gradient-to-b from-purple-900/20 to-[#0f172a]/60 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Choose Plan Type (Series vs Annual) */}
                    <div id="tour-curr-type">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-purple-400 font-bold">💎</span>
                            <label className="spark-h3 text-white">نوع منهج الخدمة المطلوب</label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 p-1 rounded-2xl border border-white/10">
                            <button
                                type="button"
                                onClick={() => setPlanType('series')}
                                className={`py-3 px-4 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                                    planType === 'series' 
                                        ? 'bg-purple-500 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-sm">📅 سلسلة أسابيع مركّزة</span>
                                <span className="text-[10px] opacity-80 font-medium font-sans">خطوات متتالية تخدم هدفاً محدداً (3-6 أسابيع)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlanType('annual')}
                                className={`py-3 px-4 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                                    planType === 'annual' 
                                        ? 'bg-purple-500 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-sm">🗓️ مخطط وموزّع العام السنوي</span>
                                <span className="text-[10px] opacity-80 font-medium font-sans">توزيع منهجي لـ 12 شهراً متكاملاً لمدارس الأحد</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Main Objective */}
                    <div id="tour-curr-obj">
                        <div className="flex items-center gap-2 mb-2">
                            <TargetIcon className="w-5 h-5 text-purple-400" />
                            <label htmlFor="objective" className="spark-h3 text-white">الهدف الرئيسي للمنهج</label>
                        </div>
                        <SmartAutoComplete
                            id="objective"
                            type="objective"
                            value={objective}
                            onChange={handleObjectiveChange}
                            isTextarea={true}
                            rows={3}
                            placeholder={planType === 'annual' ? "مثال: بناء الشخصية المسيحية القوية، غرس العقيدة والطقوس الكنسية، السلوك المسيحي الملتزم..." : "مثال: التدريب على حياة الشكر، فضيلة الاتضاع، تاريخ الكنيسة..."}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
                            required
                            minLength={5}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Duration or Info Box depending on selection */}
                        {planType === 'series' ? (
                            <div id="tour-curr-duration-container">
                                <div className="flex items-center gap-2 mb-2">
                                    <ClockIcon className="w-5 h-5 text-purple-400" />
                                    <label className="spark-h3 text-white">مدة السلسلة</label>
                                </div>
                                <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                                    {[3, 4, 5, 6].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setDuration(num)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                                duration === num 
                                                    ? 'bg-purple-500 text-white shadow-lg' 
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {num} أسابيع
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div id="tour-curr-duration-container" className="bg-purple-500/10 border border-purple-500/20 p-3 sm:p-4 rounded-xl flex items-start gap-2.5">
                                <span className="text-purple-400 text-lg">💡</span>
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-white mb-1">الموزّع السنوي الذكي</span>
                                    <p className="text-[11px] leading-relaxed text-purple-200">سيقوم الذكاء الاصطناعي ببناء نموذج وتخطيط المنهج السنوي الكامل (12 شهراً × 4 أسابيع) موزعاً بشكل يتكامل مع مواسم الكنيسة والنمو الروحي.</p>
                                </div>
                            </div>
                        )}

                        {/* Age Group */}
                        <div id="tour-curr-age">
                            <div className="flex items-center gap-2 mb-2">
                                <UsersIcon className="w-5 h-5 text-purple-400" />
                                <label className="spark-h3 text-white">الفئة العمرية المستهدفة</label>
                            </div>
                            <select
                                value={ageGroup}
                                onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-right appearance-none"
                            >
                                {ageGroups.map(g => (
                                    <option key={g} value={g} className="bg-slate-800">{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div id="tour-curr-notes">
                        <div className="flex items-center gap-2 mb-2">
                            <NoteIcon className="w-5 h-5 text-purple-400" />
                            <label className="spark-h3 text-white">ملاحظات إضافية (اختياري)</label>
                        </div>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="مثال: التركيز على قصص العهد القديم، إضافة نشاط عملي في الأسبوع الأخير..."
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        id="tour-curr-submit"
                        disabled={isLoading || objective.length < 5}
                        className="w-full text-white font-bold text-lg py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                    >
                        {isLoading ? 'جاري إعداد المنهج...' : 'تجهيز الخطة'}
                    </button>
                </form>
            </div>

            <GuidedTour 
                isOpen={isTourOpen} 
                onClose={() => setIsTourOpen(false)} 
                steps={tourSteps} 
                tourKey="curriculum-builder-tour"
            />
        </div>
    );
};

export default CurriculumBuilderForm;
