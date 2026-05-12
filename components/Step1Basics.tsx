import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { AgeGroup } from '../types';
import { PencilIcon, TargetIcon, SparklesIcon } from './icons';
import SmartAutoComplete from './SmartAutoComplete';
import { ToolId } from './ToolsDashboard';

interface FormData {
  lessonTitle: string;
  spiritualObjective: string;
  scriptureVerse: string;
  ageGroup: AgeGroup;
  lessonImages: Array<{ data: string; mimeType: string }>;
}

interface Step1BasicsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  toolId?: ToolId | null;
}

const Step1Basics: React.FC<Step1BasicsProps> = ({ formData, setFormData, onNext, toolId }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const isNextDisabled = useMemo(() => {
    return formData.lessonTitle.trim().length < 5 || formData.spiritualObjective.trim().length < 20;
  }, [formData.lessonTitle, formData.spiritualObjective]);

  const titles = { 
    main: 'تحضير الدرس', 
    sub: 'أدخل بيانات الدرس لبناء خطة متكاملة' 
  };

  return (
    <div className="w-full max-w-3xl mx-auto" dir="rtl">
      
      {/* Title Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-display italic tracking-tight">
            {titles.main} <span className="text-amber-400">بأسلوب عصري</span>
        </h2>
        <div className="h-1.5 w-24 bg-amber-500 mx-auto rounded-full mb-6"></div>
        <p className="text-xl text-slate-400 font-spiritual italic">
            {titles.sub}
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-14 rounded-[3rem] border border-white/5 bg-slate-900/30 shadow-2xl relative overflow-hidden"
      >
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
          
          <form onSubmit={(e) => { e.preventDefault(); if(!isNextDisabled) onNext(); }} className="space-y-10 relative z-10">
            
            {/* Lesson Title */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5">
                        <PencilIcon className="w-5 h-5" />
                    </div>
                    <label htmlFor="lessonTitle" className="text-xl font-display font-black text-white italic">
                        عنوان الدرس
                    </label>
                </div>
                <SmartAutoComplete
                    id="lessonTitle"
                    type="title"
                    value={formData.lessonTitle}
                    onChange={handleChange}
                    placeholder="مثال: قصة السامري الصالح"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-right font-spiritual italic text-lg px-6 py-5 placeholder-slate-600 text-white shadow-inner"
                    required
                    minLength={5}
                />
            </div>

            {/* Spiritual Objective */}
            <div>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5">
                        <TargetIcon className="w-5 h-5" />
                    </div>
                    <label htmlFor="spiritualObjective" className="text-xl font-display font-black text-white italic">
                        الهدف الروحي
                    </label>
                </div>
                <SmartAutoComplete
                    id="spiritualObjective"
                    type="objective"
                    context={formData.lessonTitle}
                    isTextarea={true}
                    value={formData.spiritualObjective}
                    onChange={handleChange}
                    rows={4}
                    placeholder="ما الذي تريد أن تتركه في قلب وعقل المخدوم؟"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none text-right font-spiritual italic text-lg px-6 py-5 placeholder-slate-600 text-white shadow-inner leading-relaxed"
                    required
                    minLength={20}
                />
            </div>
            
            <div className="pt-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isNextDisabled}
                    className="group relative w-full overflow-hidden text-black font-black text-xl py-6 rounded-2xl bg-white hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-4"
                >
                    <span className="relative z-10 font-display italic">التالي</span>
                    <SparklesIcon className="w-6 h-6 animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>
            </div>
          </form>
      </motion.div>
      
      <div className="mt-8 flex justify-center gap-2">
          <div className="w-12 h-1.5 rounded-full bg-amber-500"></div>
          <div className="w-12 h-1.5 rounded-full bg-slate-800"></div>
      </div>
      <p className="mt-4 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Step 01 / 02</p>
    </div>
  );
};

export default Step1Basics;
