
import React from 'react';
import { XMarkIcon, PencilIcon, StadiumIcon, AssistantIcon, SparklesIcon, CheckCircleIcon, BookOpenIcon, TargetIcon, PuzzleIcon } from './icons';

interface InfoModalProps {
    activeModal: string | null;
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ activeModal, onClose }) => {
    if (!activeModal) return null;

    const methodologyContent = (
        <div className="flex flex-col items-center py-8 w-full">
          <p className="text-slate-300 text-center max-w-3xl mx-auto mb-16 text-lg leading-relaxed font-light">
              يعتمد <strong className="text-amber-400">SPARK</strong> على خوارزمية دقيقة لضمان أن كل مخرج هو ليس مجرد توليد عشوائي، بل نتاج بحث في عمق التراث الكنسي.
          </p>
          
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-l from-slate-700 via-amber-500/50 to-slate-700 rounded-full -z-10"></div>
  
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-[#0f172a] border-4 border-slate-700 group-hover:border-blue-500 transition-all duration-500 flex items-center justify-center shadow-xl z-10 mb-6">
                      <TargetIcon className="w-10 h-10 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 w-full h-full hover:bg-white/10 transition-colors">
                      <h3 className="text-blue-400 font-bold text-xl mb-2 font-serif">1. المدخلات</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          يستقبل النظام هدفك الروحي، الشاهد الكتابي، والفئة العمرية المستهدفة بدقة.
                      </p>
                  </div>
              </div>
  
              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-[#0f172a] border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-110 transition-all duration-500 flex items-center justify-center z-10 mb-6">
                      <BookOpenIcon className="w-10 h-10 text-amber-400 animate-pulse" />
                  </div>
                  <div className="bg-gradient-to-b from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/30 w-full h-full">
                      <h3 className="text-amber-400 font-bold text-xl mb-2 font-serif">2. الفحص المرجعي</h3>
                      <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                          (المرحلة الأهم)
                          <br/>
                          يتم فلترة المدخلات ومطابقتها مع أقوال الآباء، التفاسير المعتمدة، والعقيدة الأرثوذكسية لضمان سلامة التعليم.
                      </p>
                  </div>
              </div>
  
              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-[#0f172a] border-4 border-slate-700 group-hover:border-purple-500 transition-all duration-500 flex items-center justify-center shadow-xl z-10 mb-6">
                      <PuzzleIcon className="w-10 h-10 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 w-full h-full hover:bg-white/10 transition-colors">
                      <h3 className="text-purple-400 font-bold text-xl mb-2 font-serif">3. المعالجة التربوية</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          تحويل المادة الدسمة إلى أسلوب قصشي شائق للأطفال، أو حوار عميق للشباب، مع اقتراح وسائل إيضاح.
                      </p>
                  </div>
              </div>
  
              {/* Step 4 */}
              <div className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-[#0f172a] border-4 border-slate-700 group-hover:border-green-500 transition-all duration-500 flex items-center justify-center shadow-xl z-10 mb-6">
                      <CheckCircleIcon className="w-10 h-10 text-slate-400 group-hover:text-green-400 transition-colors" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 w-full h-full hover:bg-white/10 transition-colors">
                      <h3 className="text-green-400 font-bold text-xl mb-2 font-serif">4. النتيجة الاحترافية</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          خطة درس متكاملة، ألعاب هادفة، أو إجابات لاهوتية دقيقة.. جاهزة لخدمتك فوراً.
                      </p>
                  </div>
              </div>
          </div>
        </div>
    );
  
    const featuresContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Lesson Builder */}
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent transition-all group flex flex-col">
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform mb-6">
                    <PencilIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif group-hover:text-orange-400 transition-colors">1. المحضّر الذكي</h3>
                <p className="text-slate-400 text-base leading-relaxed mb-4">
                    أداة تقوم بصياغة درس مدارس الأحد بالكامل (عناصر، شرح، مقدمة، وخاتمة) بناءً على مراجع كنسية، ومخصصة حسب سن المخدومين.
                </p>
                <ul className="mt-auto space-y-2 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><span className="text-orange-500">✓</span> شرح قصصي للأطفال</li>
                    <li className="flex items-center gap-2"><span className="text-orange-500">✓</span> عمق لاهوتي للشباب</li>
                </ul>
            </div>
  
            {/* Bible Reader */}
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent transition-all group flex flex-col">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-6">
                    <BookOpenIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif group-hover:text-amber-400 transition-colors">2. الكتاب المقدس الدراسي</h3>
                <p className="text-slate-400 text-base leading-relaxed mb-4">
                    ليس مجرد قراءة، بل دراسة. حدد أي آية لتحصل فوراً على تفسيرها العميق، وشرحها المبسط، وتحليل كلماتها في اللغات الأصلية.
                </p>
                <ul className="mt-auto space-y-2 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> تحليل عبري ويوناني</li>
                    <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> ربط بتفاسير الآباء</li>
                </ul>
            </div>
  
            {/* Game Bank */}
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent transition-all group flex flex-col">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform mb-6">
                    <StadiumIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif group-hover:text-green-400 transition-colors">3. بنك الألعاب</h3>
                <p className="text-slate-400 text-base leading-relaxed mb-4">
                    حل عملي لفقرة الألعاب. أخبر النظام بالمكان المتاح (فصل، ملعب، أتوبيس) والأدوات معك، وسيبتكر لك ألعاباً جديدة وممتعة.
                </p>
                <ul className="mt-auto space-y-2 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> ألعاب بدون أدوات</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> ألعاب هادفة روحياً</li>
                </ul>
            </div>
  
             {/* Patristic Assistant */}
             <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-sky-500/30 bg-gradient-to-br from-sky-500/5 to-transparent transition-all group flex flex-col">
                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform mb-6">
                    <AssistantIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif group-hover:text-sky-400 transition-colors">4. المساعد الآبائي</h3>
                <p className="text-slate-400 text-base leading-relaxed mb-4">
                    بوت دردشة متخصص تم تدريبه على المراجع الأرثوذكسية فقط. اسأله عن أي طقس أو عقيدة وسيجيبك بدقة وموثوقية.
                </p>
                <ul className="mt-auto space-y-2 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><span className="text-sky-500">✓</span> إجابات موثقة</li>
                    <li className="flex items-center gap-2"><span className="text-sky-500">✓</span> بحث في التاريخ الكنسي</li>
                </ul>
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
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"></div>
                <SparklesIcon className="w-24 h-24 text-white relative z-10 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
            </div>
            
            <h3 className="text-4xl font-bold text-white mb-8 font-serif">الأصالة.. بلمسة ابتكار</h3>
            
            <div className="max-w-4xl mx-auto space-y-6 text-lg text-slate-300 leading-relaxed font-light">
                <p>
                    مشروع <strong>SPARK</strong> هو محاولة جادة لتقديم تكنولوجيا الذكاء الاصطناعي كخادم أمين في كنيستنا القبطية. نحن لا نهدف لاستبدال دور الخادم، بل لتمكينه.
                </p>
                <p>
                    من خلال أتمتة عمليات البحث في المصادر، وتنسيق الأفكار، واقتراح الألعاب، نوفر للخادم الساعات الطويلة التي كان يقضيها في "الإعداد"، لكي يستثمرها في "الصلاة" و"الافتقاد" و"العمل الرعوي" الذي لا يمكن للآلة أن تقوم به.
                </p>
                <p className="text-amber-400 font-medium">
                    نحن نؤمن أن التكنولوجيا أداة، ولكن الروح هو من يحيي.
                </p>
            </div>
  
            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-12"></div>
  
            <div className="flex flex-col items-center gap-3">
               <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">تم التطوير بواسطة</span>
               <p className="text-white font-serif text-2xl font-bold tracking-wide">Mark George</p>
               <p className="text-slate-500 text-sm opacity-70">Dedicated to the Coptic Orthodox Church</p>
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
