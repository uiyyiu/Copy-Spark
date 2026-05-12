import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XMarkIcon, PencilIcon, StadiumIcon, AssistantIcon, SparklesIcon, CheckCircleIcon, BookOpenIcon, TargetIcon, PuzzleIcon, ImageIcon, ArchiveIcon, DownloadIcon, ScrollIcon, GlobeIcon, BrainIcon } from './icons';

interface InfoModalProps {
    activeModal: string | null;
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ activeModal, onClose }) => {
    if (!activeModal) return null;

    const methodologyContent = (
        <div className="flex flex-col items-center py-12 w-full" dir="rtl">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-300 text-center max-w-3xl mx-auto mb-20 text-xl font-spiritual italic leading-relaxed"
          >
              يعتمد <strong className="text-amber-400 not-italic">SPARK</strong> على خوارزمية ذكاء اصطناعي سيادية، صُممت خصيصاً لدمج التكنولوجيا الفائقة مع التراث الكنسي الأرثوذكسي الأصيل.
          </motion.p>
          
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
              <div className="hidden lg:block absolute top-16 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent rounded-full -z-10"></div>
  
              {[
                  { icon: GlobeIcon, color: 'sky', title: 'رسم المسار', desc: 'تخطيط المنهج الروحي طويل المدى لضمان نمو متوازن وشامل للفئات العمرية المختلفة.' },
                  { icon: BookOpenIcon, color: 'amber', title: 'تأصيل الكلمة', desc: 'البحث العميق في الكتاب المقدس واستحضار التفاسير الآبائية من مصادرها الأصلية.' },
                  { icon: PencilIcon, color: 'purple', title: 'بناء الدرس', desc: 'صياغة المادة اللاهوتية في قالب تربوي مشوق يشمل الأهداف والعناصر التطبيقية.' },
                  { icon: StadiumIcon, color: 'emerald', title: 'المرح الهادف', desc: 'ابتكار أنشطة حركية وذهنية ذكية تربط المعلومة الروحية بالواقع العملي بطريقة مرحة.' },
                  { icon: ArchiveIcon, color: 'indigo', title: 'التوثيق السحابي', desc: 'حفظ وأرشفة كافة التحضيرات في مكتبة رقمية تضمن استدامة الخدمة وتراكم الخبرات.' }
              ].map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative flex flex-col items-center text-center group"
                  >
                      <div className={`w-28 h-28 rounded-[2rem] bg-slate-950 border-2 border-white/5 group-hover:border-${step.color}-500/50 transition-all duration-700 flex items-center justify-center shadow-2xl z-10 mb-8 relative overflow-hidden`}>
                           <div className={`absolute inset-0 bg-${step.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                           <step.icon className={`w-10 h-10 text-slate-500 group-hover:text-${step.color}-400 transition-all duration-500 transform group-hover:scale-110`} />
                      </div>
                      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 w-full h-full group-hover:bg-amber-500/5 transition-all duration-500 shadow-lg flex flex-col">
                          <h3 className={`text-${step.color}-400 font-display italic font-black text-lg mb-3 tracking-tight`}>{idx + 1}. {step.title}</h3>
                          <p className="text-slate-400 text-xs font-spiritual italic leading-relaxed opacity-80 group-hover:opacity-100">
                              {step.desc}
                          </p>
                      </div>
                  </motion.div>
              ))}
          </div>
        </div>
    );
  
    const featuresContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-2" dir="rtl">
            {[
                { icon: PencilIcon, color: 'amber', title: 'تحضير الدروس', desc: 'توليد دروس كنسية متكاملة تشمل المقدمة والشرح والتطبيقات.' },
                { icon: GlobeIcon, color: 'sky', title: 'تخطيط المناهج', desc: 'بناء مناهج روحية ربع سنوية تضمن نمواً كنسياً متوازناً.' },
                { icon: BookOpenIcon, color: 'purple', title: 'دراسة الكتاب مقدس', desc: 'تحليلات لاهوتية مع ربط فوري بتفاسير الآباء واللغات الأصلية.' },
                { icon: ScrollIcon, color: 'rose', title: 'المساعد الآبائي', desc: 'قاعدة بيانات ضخمة من أقوال الآباء متاحة للبحث والحوار الذكي.' },
                { icon: ImageIcon, color: 'emerald', title: 'تحليل الصور', desc: 'تحليل لاهوتي للأيقونات والصور التعليمية باستخدام الذكاء الاصطناعي.' },
                { icon: StadiumIcon, color: 'indigo', title: 'بنك الألعاب', desc: 'بنك متجدد من الألعاب الحركية والذهنية الهادفة والمبتكرة.' },
                { icon: ArchiveIcon, color: 'amber', title: 'المكتبة الخاصة', desc: 'حفظ وأرشفة كل تحضيراتك للرجوع إليها في أي وقت ومن أي جهاز.' },
                { icon: DownloadIcon, color: 'slate', title: 'تصدير الدروس', desc: 'تحويل الدروس إلى ملفات PDF منسقة أو مشاركتها رقمياً بسهولة.' }
            ].map((f, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 bg-slate-900/30 transition-all duration-500 group flex flex-col h-full hover:shadow-2xl"
                >
                    <div className={`w-14 h-14 bg-${f.color}-500/10 rounded-2xl flex items-center justify-center text-${f.color}-400 group-hover:scale-110 transition-all duration-500 mb-6 shadow-inner border border-white/5`}>
                        <f.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 font-display italic tracking-tight group-hover:text-amber-400 transition-colors uppercase">{f.title}</h3>
                    <p className="text-slate-400 text-sm font-spiritual italic leading-relaxed mb-6 flex-grow opacity-80 group-hover:opacity-100">
                        {f.desc}
                    </p>
                    <div className="pt-4 border-t border-white/5 flex gap-2">
                        <span className="text-[9px] font-black bg-white/5 px-2.5 py-1.5 rounded-lg text-slate-500 uppercase tracking-widest">Premium AI</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
  
    const referenceCategories = [
      { id: '1', title: "تفاسير الكتاب المقدس", items: ["تفسير القمص تادرس يعقوب ملطي", "تفسير القمص أنطونيوس فكري", "Catena Aurea (السلسلة الذهبية)"] },
      { id: '2', title: "التراث الآبائي", items: ["مجموعة نيقية وما بعد نيقية (NPNF)", "بستان الرهبان (التراث النسكي)", "عظات القديس يوحنا ذهبي الفم"] },
      { id: '3', title: "الطقس والألحان", items: ["الخولاجي المقدس (الصلوات)", "السنكسار (سير الأبطال)", "الإبصلمودية (التسابيح)"] },
      { id: '4', title: "اللغات والمخطوطات", items: ["العهد الجديد اليوناني (Codex Sinaiticus)", "قواميس اللغة القبطية العلمية", "مخطوطات وادي النطرون الرقمية"] },
      { id: '5', title: "العقيدة واللاهوت", items: ["تجسد الكلمة (أثناسيوس الرسولي)", "المسيح واحد (كيرلس الكبير)", "موسوعة St-Takla اللاهوتية"] }
    ];
  
    const referencesContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto pb-12" dir="rtl">
          {referenceCategories.map((category, idx) => (
               <motion.div 
                key={category.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-amber-500/30 transition-all duration-500 bg-slate-900/40 shadow-xl group"
               >
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-inner">
                        <BookOpenIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-white font-black font-display italic text-lg tracking-tight uppercase">{category.title}</h3>
                  </div>
                  <ul className="space-y-4">
                      {category.items.map((item, i) => (
                          <li key={i} className="text-slate-400 text-sm font-spiritual italic flex items-start gap-4 group-hover:text-slate-200 transition-colors">
                              <span className="w-2 h-2 rounded-full bg-amber-500/30 mt-1.5 shrink-0"></span>
                              <span>{item}</span>
                          </li>
                      ))}
                  </ul>
              </motion.div>
          ))}
      </div>
    );
  
    const aboutContent = (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center" dir="rtl">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-12 relative"
            >
                <div className="absolute inset-0 bg-amber-500/30 blur-[100px] rounded-full scale-150"></div>
                <div className="w-40 h-40 rounded-[3rem] bg-slate-950 border border-white/10 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <SparklesIcon className="w-20 h-20 text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                </div>
            </motion.div>
            
            <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-black text-white mb-10 font-display italic tracking-tight"
            >
                الأصالة.. <span className="text-amber-400">بذكاء العصر</span>
            </motion.h3>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-4xl mx-auto space-y-8 text-xl text-slate-400 leading-relaxed font-spiritual italic"
            >
                <p>
                    مشروع <strong className="text-white not-italic">SPARK</strong> هو رؤية تكنولوجية كنسية، تهدف لاستثمار الذكاء الاصطناعي كخادم أمين في قلب كنيستنا الأرثوذكسية. نحن لا نسعى لاستبدال روحانية الخادم، بل لتمكينه فنياً وفكرياً.
                </p>
                <p>
                    عبر أتمتة البحث المعمق في أمهات الكتب، وتنسيق الأفكار الإبداعية، واقتراح الوسائل التربوية المبهرة، نمنح الخادم "هبة الوقت"؛ الساعات التي كانت تضيع في التنسيق الجاف، أصبحت الآن وقتاً للصلاة وتفقد النفوس المخدومة.
                </p>
                <div className="pt-6">
                    <p className="text-amber-500 font-bold text-2xl tracking-tight font-display">
                        " التكنولوجيا أداة.. والروح هو المُحيي "
                    </p>
                </div>
            </motion.div>
  
            <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-20"></div>
  
            <div className="flex flex-col items-center gap-4">
               <span className="text-slate-600 text-xs font-black tracking-[0.4em] uppercase">Produced & Engineered By</span>
               <p className="text-white font-display italic text-3xl font-black tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">MARK GEORGE</p>
               <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Dedicated to the Coptic Orthodox Heritage</p>
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
        features: 'مميزات البرنامج',
        methodology: 'منهجية العمل',
        references: 'المصادر والمراجع',
        about: 'عن البرنامج'
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10 no-print"
            >
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={onClose}></div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    className="glass-card w-full max-w-7xl p-8 md:p-16 relative border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[4rem] overflow-y-auto max-h-[95vh] bg-slate-950/60 z-10" 
                    onClick={e => e.stopPropagation()}
                >
                    <button 
                        onClick={onClose} 
                        className="sticky top-0 float-left -mt-8 -ml-8 mb-4 p-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5 z-50"
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                    
                    <div className="text-center mb-16" dir="rtl">
                        <span className="text-amber-500/50 text-xs font-black tracking-[0.5em] uppercase mb-4 block">Information Terminal</span>
                        <h2 className="text-4xl md:text-6xl font-black text-white font-display italic tracking-tight">{titles[activeModal] || ''}</h2>
                        <div className="h-1.5 w-24 bg-amber-500 mx-auto rounded-full mt-6 opacity-30"></div>
                    </div>
                    
                    {renderModalContent()}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InfoModal;
