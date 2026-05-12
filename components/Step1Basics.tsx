
import React, { useMemo } from 'react';
import type { AgeGroup } from '../types';
import { PencilIcon, TargetIcon } from './icons';
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

  const getTitles = () => {
      // Since Step1Basics is currently mainly used for the Lesson Builder, and other tools like Game Bank have their own forms,
      // we use the default title. Invalid cases for 'games', 'visuals', 'icebreakers' were removed as they don't match ToolId type.
      return { main: 'حضّر درسك', sub: 'مساعدك الشخصي لتحويل الهدف الروحي إلى خطة درس متكاملة' };
  }

  const titles = getTitles();

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      
      {/* Title Section - Styled for Hero */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md" style={{fontFamily: 'Noto Naskh Arabic, serif'}}>
            {titles.main} <span className="text-[var(--accent-gold)]">بلمسة إبداع</span>
        </h2>
        <p className="text-lg text-white/90 font-medium drop-shadow">
            {titles.sub}
        </p>
      </div>

      {/* Glassmorphism Form Card */}
      <div className="glass-card p-6 md:p-10 rounded-3xl shadow-2xl">
          <form onSubmit={(e) => { e.preventDefault(); if(!isNextDisabled) onNext(); }} className="space-y-6">
            
            {/* Lesson Title */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <PencilIcon className="w-5 h-5 text-[var(--text-light-primary)] dark:text-white" />
                    <label htmlFor="lessonTitle" className="spark-h3 text-[var(--text-light-primary)] dark:text-white" style={{margin: 0}}>
                        عنوان الدرس
                    </label>
                </div>
                <SmartAutoComplete
                    id="lessonTitle"
                    type="title"
                    value={formData.lessonTitle}
                    onChange={handleChange}
                    placeholder="مثال: السامري الصالح"
                    className="w-full bg-white/50 dark:bg-black/20 border border-gray-200/50 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-[var(--accent-gold)] transition text-right spark-body px-5 py-4 placeholder-gray-500 dark:placeholder-gray-300 text-[var(--text-light-primary)] dark:text-white shadow-inner"
                    required
                    minLength={5}
                />
            </div>

            {/* Spiritual Objective */}
            <div>
                 <div className="flex items-center gap-2 mb-2">
                    <TargetIcon className="w-5 h-5 text-[var(--text-light-primary)] dark:text-white" />
                    <label htmlFor="spiritualObjective" className="spark-h3 text-[var(--text-light-primary)] dark:text-white" style={{margin: 0}}>
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
                    rows={3}
                    placeholder="مثال: أن أفهم أن محبة قريبي تعني مساعدة أي شخص محتاج، بغض النظر عن هويته."
                    className="w-full bg-white/50 dark:bg-black/20 border border-gray-200/50 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-[var(--accent-gold)] transition resize-none text-right spark-body px-5 py-4 placeholder-gray-500 dark:placeholder-gray-300 text-[var(--text-light-primary)] dark:text-white shadow-inner"
                    required
                    minLength={20}
                />
            </div>
            
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isNextDisabled}
                    className="w-full text-white font-bold text-lg py-4 px-6 rounded-xl hover:bg-[var(--accent-gold-hover)] transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                    style={{
                        backgroundColor: isNextDisabled ? undefined : 'var(--accent-gold)',
                    }}
                >
                    <span>ابدأ التحضير</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-180">
                        <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
          </form>
      </div>
      <div className="mt-4 text-center text-white/60 text-sm font-medium">
          <span>خطوة 1 من 2</span>
      </div>
    </div>
  );
};

export default Step1Basics;
