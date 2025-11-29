
import React from 'react';
import { XMarkIcon, PencilIcon, StadiumIcon, AssistantIcon, SparklesIcon, CheckCircleIcon, BookOpenIcon } from './icons';

interface InfoModalProps {
    activeModal: string | null;
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ activeModal, onClose }) => {
    if (!activeModal) return null;

    const methodologyContent = (
        <div className="flex flex-col items-center justify-center py-8 w-full">
          <div className="relative flex flex-col md:flex-row items-start justify-between w-full max-w-4xl gap-8 md:gap-4 my-8">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-600 to-transparent z-0"></div>
  
            <div className="relative z-10 flex flex-col items-center text-center group flex-1">
               <div className="w-24 h-24 rounded-full bg-[#0f172a] border-2 border-slate-600 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:border-amber-500 transition-all duration-500">
                  <span className="text-3xl font-bold text-slate-400 group-hover:text-amber-400 font-serif">1</span>
               </div>
               <h3 className="text-white font-bold text-xl mb-2 font-serif">المدخلات</h3>
               <p className="text-slate-400 text-sm px-4">تحديد الموضوع، الهدف الروحي، والفئة العمرية.</p>
            </div>
  
            <div className="relative z-10 flex flex-col items-center text-center group flex-1">
               <div className="w-24 h-24 rounded-full bg-[#0f172a] border-2 border-amber-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <SparklesIcon className="w-10 h-10 text-amber-400 animate-pulse" />
               </div>
               <h3 className="text-white font-bold text-xl mb-2 font-serif">المعالجة الذكية</h3>
               <p className="text-slate-400 text-sm px-4">تحليل المصادر الآبائية والتربوية بدقة.</p>
            </div>
  
            <div className="relative z-10 flex flex-col items-center text-center group flex-1">
               <div className="w-24 h-24 rounded-full bg-[#0f172a] border-2 border-green-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <CheckCircleIcon className="w-10 h-10 text-green-400" />
               </div>
               <h3 className="text-white font-bold text-xl mb-2 font-serif">النتيجة</h3>
               <p className="text-slate-400 text-sm px-4">خطة درس متكاملة، ألعاب مبتكرة، وشرح عميق.</p>
            </div>
          </div>
        </div>
    );
  
    const featuresContent = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 text-amber-400">
                    <PencilIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif">تحضير الدرس الأسبوعي</h3>
                <p className="text-slate-400 text-sm leading-relaxed">توليد هيكل درس روحي متكامل بناءً على الفئة العمرية والشاهد الكتابي.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400">
                    <StadiumIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif">بنك الألعاب</h3>
                <p className="text-slate-400 text-sm leading-relaxed">اقترح ألعاباً تناسب ظروفك اللوجستية لملء وقت الفراغ.</p>
            </div>
             <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-all">
                <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mb-4 text-sky-400">
                    <AssistantIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif">المساعد العقيدي والآبائي</h3>
                <p className="text-slate-400 text-sm leading-relaxed">باحث لاهوتي للخادم: تفسير آيات، أقوال آباء، وردود على أسئلة عقيدية.</p>
            </div>
        </div>
    );
  
    const referenceCategories = [
      {
        title: "قسم التفاسير الكتابية",
        items: [
          "تفسير القمص تادرس يعقوب ملطي",
          "تفسير القمص أنطونيوس فكري",
          "Catena Aurea (السلسلة الذهبية)"
        ]
      },
      {
        title: "قسم الآباء والباترولوجي",
        items: [
          "مجموعة نيقية وما بعد نيقية (NPNF)",
          "بستان الرهبان",
          "كتب د. نصحي عبد الشهيد",
          "عظات القديس يوحنا ذهبي الفم (الميمر)"
        ]
      },
      {
        title: "قسم الطقس والليتورجيا",
        items: [
          "الخولاجي المقدس",
          "السنكسار",
          "التسبحة (الابصلمودية)"
        ]
      },
      {
        title: "قسم اللغات والمخطوطات",
        items: [
          "قاموس إقلاديوس لبيب (قبطي)",
          "قواعد اللغة القبطية (موضي)",
          "العهد الجديد اليوناني (Textus Receptus)",
          "القاموس اليوناني التحليلي (Strong's Concordance)",
          "موقع Bible Hub",
          "موقع St. Shenouda the Archimandrite Coptic Society",
          "أرشيف Coptic Scriptorium",
          "Old Testament Textual Criticism - Online Digital Manuscripts",
          "Center for the Study of New Testament Manuscripts (CSNTM)",
          "Codex Sinaiticus"
        ]
      },
      {
        title: "قسم العقيدة واللاهوت",
        items: [
          "كتاب تجسد الكلمة (للقديس أثناسيوس)",
          "موقع St-Takla.org",
          "علم اللاهوت المقارن (للبابا شنودة الثالث)",
          "كتاب المسيح واحد (للقديس كيرلس الأسكندري)"
        ]
      }
    ];
  
    const referencesContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-8">
          {referenceCategories.map((category, idx) => (
               <div key={idx} className="glass-card p-5 rounded-xl border border-white/10 hover:border-amber-500/30 transition-all bg-[#0f172a]/40">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/5">
                      <BookOpenIcon className="w-5 h-5 text-amber-400" />
                      <h3 className="text-white font-bold font-serif text-lg">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                      {category.items.map((item, i) => (
                          <li key={i} className="text-slate-300 text-sm font-serif flex items-start gap-2">
                              <span className="text-amber-500/50 mt-1 text-xs">✦</span>
                              <span>{item}</span>
                          </li>
                      ))}
                  </ul>
              </div>
          ))}
      </div>
    );
  
    const aboutContent = (
        <div className="text-center py-8">
            <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto text-lg">
                حضر دروس مسيحية قوية ومبدعة في دقائق - مع أفكار وألعاب وأنشطة وهيكل كامل.
            </p>
            <div className="mt-8 pt-8 border-t border-white/10">
               <p className="text-slate-400 font-serif">Produced By Mark George</p>
            </div>
        </div>
    );

    const renderModalContent = () => {
        switch (activeModal) {
            case 'features': return featuresContent;
            case 'references': return referencesContent;
            case 'methodology': return methodologyContent;
            case 'about': return aboutContent;
            default: return null;
        }
    };

    const titles: {[key: string]: string} = {
        features: 'المميزات',
        methodology: 'المنهجية',
        references: 'المراجع',
        about: 'عن المشروع'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-7xl p-8 relative border border-white/20 shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh] bg-[#0f172a]/95" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                <h2 className="text-3xl font-bold text-white mb-8 font-serif border-b border-white/10 pb-4 text-center">{titles[activeModal] || ''}</h2>
                {renderModalContent()}
            </div>
        </div>
    );
};

export default InfoModal;
    