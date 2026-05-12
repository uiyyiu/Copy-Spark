
import React, { useState } from 'react';
import type { AgeGroup } from '../types';
import { TargetIcon, UsersIcon, NoteIcon, BookOpenIcon, LightBulbIcon, ClockIcon } from './icons';
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
        <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md font-serif">
                    مخطط المنهج
                </h2>
                <p className="text-lg text-white/90 font-medium drop-shadow">
                    جهز خطة متكاملة لهدف روحي واحد
                </p>
            </div>

            <div className="glass-card p-6 md:p-10 rounded-3xl shadow-2xl border border-purple-500/30 bg-gradient-to-b from-purple-900/20 to-[#0f172a]/60 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Main Objective */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TargetIcon className="w-5 h-5 text-purple-400" />
                            <label htmlFor="objective" className="spark-h3 text-white">الهدف الرئيسي</label>
                        </div>
                        <SmartAutoComplete
                            id="objective"
                            type="objective"
                            value={objective}
                            onChange={handleObjectiveChange}
                            isTextarea={true}
                            rows={3}
                            placeholder="مثال: التدريب على حياة الشكر، فضيلة الاتضاع، تاريخ الكنيسة..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
                            required
                            minLength={5}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Duration */}
                        <div>
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

                        {/* Age Group */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <UsersIcon className="w-5 h-5 text-purple-400" />
                                <label className="spark-h3 text-white">الفئة العمرية</label>
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
                    <div>
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
                        disabled={isLoading || objective.length < 5}
                        className="w-full text-white font-bold text-lg py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                    >
                        {isLoading ? 'جاري إعداد المنهج...' : 'تجهيز الخطة'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CurriculumBuilderForm;
