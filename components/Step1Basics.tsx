
import React, { useMemo, useState } from 'react';
import type { AgeGroup } from '../types';
import { PencilIcon, TargetIcon } from './icons';
import SmartAutoComplete from './SmartAutoComplete';
import { ToolId } from './ToolsDashboard';
import GuidedTour, { TourStep } from './GuidedTour';
import { HelpCircle } from 'lucide-react';

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
  const [isTourOpen, setIsTourOpen] = useState(false);

  const tourSteps: TourStep[] = [
    {
      targetId: 'tour-lesson-title-container',
      title: 'عنوان الدرس الروحي 📝',
      description: 'ادخل هنا عنوان الدرس المراد تحضيره لمدارس الأحد أو الاجتماع (مثال: السامري الصالح، معجزة خمس خبزات وسمكتين...). ستقوم الأداة بمطابقة واختيار باقي التفاصيل لخدمتك.',
      position: 'bottom'
    },
    {
      targetId: 'tour-lesson-objective-container',
      title: 'الهدف الروحي العميق 🎯',
      description: 'اكتب بالتفصيل الفضيلة أو الرسالة التي يخرج بها المخدوم (مثال: أن يتعلم المخدوم مساعدة الضعيف بدون تمييز). يجب ألا يقل عن 20 حرفاً لضمان ترشيح أفكار ووسائل إيضاح دقيقة ومخصصة.',
      position: 'bottom'
    },
    {
      targetId: 'tour-submit-btn',
      title: 'ابدأ التحضير والانتقال 🚀',
      description: 'بعد ملء البيانات، سيفتح هذا الزر الصفحة التالية لتحديد السن والشواهد ورفع الصور، ثم خطة الدرس الكاملة بلمسة واحدة!',
      position: 'top'
    }
  ];

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
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up relative">
      
      {/* Title Section - Styled for Hero */}
      <div className="text-center mb-10 relative">
        <button
          type="button"
          onClick={() => setIsTourOpen(true)}
          className="absolute top-0 left-0 md:left-4 z-20 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>جولة تعليمية 🗺️</span>
        </button>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md pt-8 md:pt-0" style={{fontFamily: 'Noto Naskh Arabic, serif'}}>
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
            <div id="tour-lesson-title-container">
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
            <div id="tour-lesson-objective-container">
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
                    id="tour-submit-btn"
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

      <GuidedTour 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
        steps={tourSteps} 
        tourKey="lesson-builder-basics"
      />
    </div>
  );
};

export default Step1Basics;
