
import React from 'react';
import { XMarkIcon, PencilIcon, StadiumIcon, AssistantIcon, SparklesIcon, CheckCircleIcon, BookOpenIcon, TargetIcon, PuzzleIcon, ImageIcon, ArchiveIcon, DownloadIcon } from './icons';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto px-2">
            {/* 1. Lesson Builder */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-5">
                    <PencilIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-amber-400 transition-colors">المحضّر الذكي</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    توليد خطط دروس متكاملة تشمل المقدمة، الشرح، العناصر، والتطبيقات العملية بناءً على الهدف الروحي.
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Pedagogy</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">AI-Driven</span>
                </div>
            </div>

            {/* 2. Curriculum Strategy */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-5">
                    <TargetIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-blue-400 transition-colors">التخطيط الاستراتيجي</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    بناء مناهج روحية ربع سنوية أو سنوية تضمن نمواً متوازناً للمخدومين في العقيدة والطقوس والحياة الروحية.
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Planning</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Strategic</span>
                </div>
            </div>

            {/* 3. Bible Exegesis */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-5">
                    <BookOpenIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-purple-400 transition-colors">الدراسة الكتابية التقنية</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    تحليل معمق للآيات يشمل اللغات الأصلية (قبطي، يوناني، عبري) وربط مباشر بتفسيرات الآباء المعتمدة.
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Exegesis</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Scholarship</span>
                </div>
            </div>

            {/* 4. Patristic Assistant */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-sky-500/30 bg-gradient-to-br from-sky-500/5 to-transparent transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform mb-5">
                    <AssistantIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-sky-400 transition-colors">المساعد الآبائي</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    حواري ذكي متخصص في التراث الآبائي الأرثوذكسي، للإجابة على التساؤلات اللاهوتية والطقسية بموثوقية.
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Patristics</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Live Chat</span>
                </div>
            </div>

            {/* 5. Visual Intelligence */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-5">
                    <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-emerald-400 transition-colors">الذكاء البصري</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    القدرة على تحليل أيقونات أو صور تعليمية واستنباط دروس روحية وتأملات فنية منها بشكل آلي.
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Computer Vision</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Iconography</span>
                </div>
            </div>

            {/* 6. Game Bank */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-transparent transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform mb-5">
                    <StadiumIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-rose-400 transition-colors">بنك الألعاب الابتكاري</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    ابتكار أنشطة تفاعلية وألعاب هادفة تناسب المكان والأدوات المتاحة، لضمان وقت ممتع ومفيد.
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Activities</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Gamification</span>
                </div>
            </div>

            {/* 7. Cloud Library */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-transparent transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-5">
                    <ArchiveIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-indigo-400 transition-colors">الأرشفة السحابية</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    حفظ ومزامنة كافة الدروس والمناهج التي تم توليدها في مكتبة خاصة للرجوع إليها في أي وقت ومن أي جهاز.
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Storage</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Cloud Sync</span>
                </div>
            </div>

            {/* 8. Export & Share */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-gray-500/30 bg-gradient-to-br from-gray-500/5 to-transparent transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-gray-500/10 rounded-xl flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform mb-5">
                    <DownloadIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-gray-400 transition-colors">تصدير واحترافية</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    تحويل مخرجاتك إلى ملفات PDF منسقة بعناية للطباعة، أو مشاركتها رقمياً مع زملائك الخدام بضغطة زر.
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">PDF Export</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">Collaboration</span>
                </div>
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
