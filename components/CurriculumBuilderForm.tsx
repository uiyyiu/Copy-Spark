import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { AgeGroup } from '../types';
import { TargetIcon, UsersIcon, NoteIcon, ClockIcon, SparklesIcon } from './icons';
import SmartAutoComplete from './SmartAutoComplete';

interface CurriculumBuilderFormProps {
    onSubmit: (objective: string, duration: number, ageGroup: AgeGroup, notes: string) => void;
    isLoading: boolean;
}

const ageGroups: AgeGroup[] = ['ابتدائي', 'اعدادي', 'ثانوي', 'شباب', 'خريجين'];

const CurriculumBuilderForm: React.FC<CurriculumBuilderFormProps> = ({ onSubmit, isLoading }) => {
    const [objective, setObjective] = useState('');
    const [duration, setDuration] = useState(4);
    const [ageGroup, setAgeGroup] = useState<AgeGroup>('ابتدائي');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (objective.trim().length >= 5) {
            onSubmit(objective, duration, ageGroup, notes);
        }
    };

    const handleObjectiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setObjective(e.target.value);
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
                    className="w-20 h-20 rounded-[2rem] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                    <TargetIcon className="w-10 h-10 text-purple-400" />
                </motion.div>
                <h2 className="text-5xl font-black text-white mb-6 font-display italic tracking-tight uppercase">تخطيط المناهج</h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-spiritual italic">
                    صمم مسار نمو روحي متدرج.. حوّل الهدف إلى رحلة تعليمية منظمة عبر الزمن.
                </p>
                <div className="h-1.5 w-24 bg-purple-500 mx-auto rounded-full mt-8 opacity-30"></div>
            </div>

            <div className="glass-card p-10 md:p-14 rounded-[3.5rem] border border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* Main Objective */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <TargetIcon className="w-5 h-5" />
                            </div>
                            <label htmlFor="objective" className="text-white font-black font-display italic tracking-tight uppercase">هدف المنهج</label>
                        </div>
                        <SmartAutoComplete
                            id="objective"
                            type="objective"
                            value={objective}
                            onChange={handleObjectiveChange}
                            isTextarea={true}
                            rows={3}
                            placeholder="مثال: التدريب على صلاة الشكر، عمق التواضع، تاريخ استشهاد الأقباط..."
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-spiritual italic text-lg leading-relaxed resize-none"
                            required
                            minLength={5}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Duration */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <ClockIcon className="w-5 h-5" />
                                </div>
                                <label className="text-white font-black font-display italic tracking-tight uppercase">المدى الزمني</label>
                            </div>
                            <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-white/5 h-16">
                                {[3, 4, 5, 6].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setDuration(num)}
                                        className={`flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                            duration === num 
                                                ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20' 
                                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {num} أسابيع
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Age Group */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                <label className="text-white font-black font-display italic tracking-tight uppercase">الفئة العمرية</label>
                            </div>
                            <select
                                value={ageGroup}
                                onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 h-16 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-right appearance-none font-spiritual italic text-lg cursor-pointer"
                            >
                                {ageGroups.map(g => (
                                    <option key={g} value={g} className="bg-slate-900">{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <NoteIcon className="w-5 h-5" />
                            </div>
                            <label className="text-white font-black font-display italic tracking-tight uppercase">محددات لاهوتية أو تربوية (اختياري)</label>
                        </div>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="مثال: التركيز على ربط العهدين، إضافة ممارسات روحية أسبوعية، أو إشراك أولياء الأمور..."
                            rows={3}
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-spiritual italic text-lg leading-relaxed resize-none"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || objective.length < 5}
                        className="w-full py-6 px-10 rounded-[2rem] bg-purple-500 text-slate-950 font-black font-display italic text-xl tracking-tighter uppercase disabled:opacity-30 transition-all shadow-[0_20px_50px_rgba(168,85,247,0.3)] flex items-center justify-center gap-4 group"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon className="w-6 h-6 animate-spin" />
                                <span>جاري تحليل الأهداف وهندسة المنهج...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6 group-hover:animate-spin transition-all" />
                                <span>إنشاء المنهج</span>
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
            <p className="text-center text-slate-600 text-[10px] uppercase font-black tracking-[0.3em] mt-10 opacity-50">Strategic Educational Architecture Powered by SPARK</p>
        </motion.div>
    );
};

export default CurriculumBuilderForm;

const SpinnerIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
