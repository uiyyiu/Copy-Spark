import React, { useState } from 'react';
import type { AnnualCurriculumMonth } from '../services/geminiService';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  PrintIcon, 
  CopyIcon, 
  BookOpenIcon, 
  TargetIcon,
  UsersIcon,
  SparklesIcon
} from './icons';

interface AnnualCurriculumDisplayProps {
  results: AnnualCurriculumMonth[];
  onBack: () => void;
  ageGroup?: string;
  objective?: string;
}

const AnnualCurriculumDisplay: React.FC<AnnualCurriculumDisplayProps> = ({ 
  results, 
  onBack,
  ageGroup = 'ابتدائي',
  objective = 'المنهج السنوي المقترح'
}) => {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(0); // Expand first month by default

  const handleCopyAll = () => {
    let text = `مخطط وموزّع المنهج السنوي الشامل\nالهدف الروحي: ${objective}\nالفئة العمرية: ${ageGroup}\n\n`;
    
    results.forEach((m, idx) => {
      text += `الشهر ${idx + 1}: ${m.monthName} - ${m.season}\n`;
      text += `الفكرة الأساسية: ${m.theme}\n`;
      text += `--------------------------------------------------\n`;
      m.lessons.forEach(l => {
        text += `الأسبوع ${l.week}: ${l.title}\n`;
        text += `الشاهد الكتابي: ${l.scripture}\n`;
        text += `ملخص الدرس: ${l.summary}\n`;
        text += `النشاط اليدوي المقترح: ${l.activityIdea}\n\n`;
      });
      text += `==================================================\n\n`;
    });

    navigator.clipboard.writeText(text);
    alert('تم نسخ المنهج السنوي الكامل إلى الحافظة!');
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let html = `
      <html dir="rtl" lang="ar">
      <head>
        <title>المخطط والموزع السنوي للمنهج</title>
        <style>
          body { font-family: 'Cairo', sans-serif; padding: 30px; line-height: 1.6; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 15px; margin-bottom: 30px; }
          .meta { font-size: 0.95rem; color: #475569; margin-bottom: 5px; }
          .month-section { page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 25px; background: #f8fafc; }
          .month-title { color: #b45309; font-size: 1.4rem; margin-top: 0; margin-bottom: 5px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
          .month-meta { font-style: italic; color: #64748b; font-size: 0.9rem; margin-bottom: 15px; }
          .week-row { margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
          .week-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .week-num { font-weight: bold; color: #047857; }
          .lesson-title { font-weight: bold; font-size: 1.1rem; }
          .scripture { font-style: italic; color: #4338ca; }
          .summary { font-size: 0.95rem; margin: 4px 0; }
          .activity { font-size: 0.95rem; color: #0f766e; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>مخطط وموزّع العام الدراسي السنوي المتكامل</h1>
          <div class="meta"><b>الهدف العام للخدمة:</b> ${objective}</div>
          <div class="meta"><b>الفئة العمرية المستهدفة:</b> لخدمة مرحلة (${ageGroup})</div>
        </div>
    `;

    results.forEach((m, idx) => {
      html += `
        <div class="month-section">
          <h2 class="month-title">الشهر ${idx + 1}: ${m.monthName}</h2>
          <div class="month-meta"><b>موسم الخدمة الكنسي:</b> ${m.season} | <b>الفكرة العامة:</b> ${m.theme}</div>
      `;

      m.lessons.forEach(l => {
        html += `
          <div class="week-row">
            <div><span class="week-num">الأسـبوع ${l.week}:</span> <span class="lesson-title">${l.title}</span> <span class="scripture">(${l.scripture})</span></div>
            <div class="summary"><b>الملخص:</b> ${l.summary}</div>
            <div class="activity">💡 <b>نشاط وتلوين مقترح:</b> ${l.activityIdea}</div>
          </div>
        `;
      });

      html += `</div>`;
    });

    html += `</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in text-right">
      
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-purple-900/10 border border-purple-500/20 p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1.5 justify-start md:justify-start">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold font-serif">موزع سنوي كامل (12 شهراً)</span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-bold">ذكي ومترابط ✨</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight font-serif">منهج الخدمة السنوي المقترح</h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
             توزيع منهج متكامل متصل بالهدف الروحي لضمان نمو متسلسل وإعداد واعٍ للخدام.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl transition border border-white/5 shadow"
          >
            <CopyIcon className="w-4.5 h-4.5" />
            <span>نسخ كله</span>
          </button>
          <button 
            onClick={handlePrintAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow shadow-purple-500/10"
          >
            <PrintIcon className="w-4.5 h-4.5" />
            <span>مسودة للطباعة</span>
          </button>
        </div>
      </div>

      {/* 2. Meta Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/40 p-4 border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
            <TargetIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">الهدف التعليمي الأساسي</span>
            <span className="text-sm font-bold text-purple-300 leading-none">{objective}</span>
          </div>
        </div>
        <div className="bg-slate-900/40 p-4 border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">الفئة السنية المستفيدة</span>
            <span className="text-sm font-bold text-sky-300 leading-none">خدمة مرحلة ({ageGroup})</span>
          </div>
        </div>
      </div>

      {/* 3. The 12 Months Accordion Distribution */}
      <div className="space-y-4">
        {results.map((m, idx) => {
          const isOpen = expandedMonth === idx;
          return (
            <div 
              key={idx}
              className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? 'border-purple-500/40 shadow-xl shadow-purple-500/5 ring-1 ring-purple-500/20' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Month Trigger */}
              <div 
                onClick={() => setExpandedMonth(isOpen ? null : idx)}
                className={`p-5 cursor-pointer flex justify-between items-center transition-colors duration-200 ${
                  isOpen ? 'bg-purple-900/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 font-sans font-bold text-sm text-purple-400 border border-purple-500/20 bg-slate-950/40 rounded-full flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-md sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>الشهر {idx + 1}: {m.monthName}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-medium font-sans">
                      {m.season} | فكرة الشهر الكبرى: <span className="text-purple-300 font-serif font-bold">{m.theme}</span>
                    </p>
                  </div>
                </div>
                <div className={`p-1.5 rounded-full bg-white/5 text-slate-300 transition-transform ${isOpen ? 'rotate-180 bg-white/10' : ''}`}>
                  <ChevronDownIcon className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Month Details */}
              {isOpen && (
                <div className="p-5 border-t border-white/5 bg-slate-950/20 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {m.lessons.map((lesson, lessonIdx) => (
                      <div 
                        key={lessonIdx} 
                        className="bg-slate-900/60 p-4 border border-white/5 hover:border-purple-500/10 rounded-xl transition duration-200 flex flex-col justify-between space-y-3"
                      >
                        {/* Title and Scripture */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="inline-block px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded text-[10px] font-bold">
                              الأسبوع {lesson.week || lessonIdx + 1}
                            </span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-serif text-indigo-300" dir="ltr">
                              <BookOpenIcon className="w-3 h-3 text-amber-400" />
                              <span>{lesson.scripture}</span>
                            </div>
                          </div>
                          <h4 className="text-md font-bold text-white pt-1">{lesson.title}</h4>
                        </div>
                        
                        {/* Summary */}
                        <p className="text-xs leading-relaxed text-slate-300 bg-white/5 p-2.5 rounded border border-white/5">
                          {lesson.summary}
                        </p>

                        {/* Suggested Activity */}
                        <div className="flex items-start gap-2 text-emerald-400 bg-emerald-950/15 border border-emerald-500/10 p-2.5 rounded-lg">
                          <span className="text-sm">💡</span>
                          <div className="text-right">
                            <span className="block text-[10px] font-semibold text-emerald-500/80 mb-0.5">فكرة النشاط التفاعلي والتلوين</span>
                            <p className="text-[11px] leading-snug text-slate-300">{lesson.activityIdea}</p>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Downside Back Button */}
      <div className="pt-4 border-t border-white/5">
        <button 
          onClick={onBack}
          className="w-full py-3.5 bg-white/5 text-slate-300 hover:text-white rounded-2xl hover:bg-white/10 transition font-bold text-sm border border-white/5"
        >
          العودة لتعديل الخطة 📂
        </button>
      </div>

    </div>
  );
};

export default AnnualCurriculumDisplay;
