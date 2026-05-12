import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XMarkIcon, PencilIcon, AssistantIcon, CheckCircleIcon, BookOpenIcon, 
  StadiumIcon, SparklesIcon, DevicePhoneMobileIcon, TargetIcon, 
  PuzzleIcon, ImageIcon, ArchiveIcon, DownloadIcon, GlobeIcon 
} from './icons';

interface IntroScreenProps {
  onEnter: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  const navItems = [
      { id: 'features', label: 'المميزات' },
      { id: 'methodology', label: 'المنهجية' },
      { id: 'references', label: 'المراجع' },
      { id: 'about', label: 'عن المشروع' }
  ];

  const methodologyContent = (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-8 w-full"
      >
        <p className="text-slate-300 text-center max-w-3xl mx-auto mb-16 text-lg leading-relaxed font-light font-spiritual italic">
            يعتمد <strong className="text-amber-400">SPARK</strong> على خوارزمية ذكاء اصطناعي سيادية، صُممت خصيصاً لدمج التكنولوجيا الفائقة مع التراث الكنسي الأرثوذكسي الأصيل.
        </p>
        
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
            <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent rounded-full -z-10"></div>

            {[
                { icon: GlobeIcon, color: 'sky', title: 'رسم المسار', desc: 'تخطيط المنهج الروحي طويل المدى لضمان نمو متوازن وشامل للفئات المختلفة.' },
                { icon: BookOpenIcon, color: 'amber', title: 'تأصيل الكلمة', desc: 'البحث العميق في الكتاب المقدس واستحضار التفاسير الآبائية من مصادرها الأصلية.' },
                { icon: PencilIcon, color: 'purple', title: 'بناء الدرس', desc: 'صياغة المادة اللاهوتية في قالب تربوي مشوق يشمل الأهداف والعناصر التطبيقية.' },
                { icon: StadiumIcon, color: 'emerald', title: 'المرح الهادف', desc: 'ابتكار أنشطة حركية وذهنية تربط المعلومة الروحية بالواقع العملي بطريقة مرحة.' },
                { icon: ArchiveIcon, color: 'indigo', title: 'التوثيق السحابي', desc: 'حفظ وأرشفة كافة التحضيرات في مكتبة رقمية تضمن استدامة الخدمة وتراكم الخبرات.' }
            ].map((step, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex flex-col items-center text-center group"
                >
                    <div className={`w-20 h-20 rounded-2xl bg-slate-950 border-2 border-slate-800 group-hover:border-amber-500/50 transition-all duration-500 flex items-center justify-center z-10 mb-6 shadow-xl`}>
                        <step.icon className={`w-8 h-8 text-slate-400 group-hover:text-amber-400 transition-colors transform group-hover:scale-110`} />
                    </div>
                    <div className="glass-card p-5 rounded-2xl w-full h-full border border-white/5 group-hover:bg-white/5 transition-all">
                        <h3 className={`text-white font-bold text-lg mb-2 font-display italic tracking-tight`}>{i + 1}. {step.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed font-spiritual">{step.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
      </motion.div>
  );

  const featuresContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-2">
          {[
              { id: 1, icon: PencilIcon, color: 'amber', title: 'تحضير الدروس', desc: 'توليد خطط دروس متكاملة تشمل المقدمة، الشرح، العناصر، والتطبيقات العملية.', tags: ['Pedagogy', 'AI-Driven'] },
              { id: 2, icon: TargetIcon, color: 'blue', title: 'تخطيط المناهج', desc: 'بناء مناهج روحية ربع سنوية أو سنوية تضمن نمواً متوازناً للمخدومين.', tags: ['Planning', 'Strategic'] },
              { id: 3, icon: BookOpenIcon, color: 'purple', title: 'دراسة الكتاب المقدس', desc: 'تحليل معمق للآيات يشمل اللغات الأصلية وربط مباشر بتفسيرات الآباء.', tags: ['Exegesis', 'Scholarship'] },
              { id: 4, icon: AssistantIcon, color: 'sky', title: 'المساعد الآبائي', desc: 'حواري ذكي متخصص في التراث الآبائي الأرثوذكسي، للإجابة على التساؤلات.', tags: ['Patristics', 'Live Chat'] },
              { id: 5, icon: ImageIcon, color: 'emerald', title: 'تحليل الصور', desc: 'القدرة على تحليل أيقونات أو صور تعليمية واستنباط دروس روحية منها.', tags: ['Vision', 'Iconography'] },
              { id: 6, icon: StadiumIcon, color: 'rose', title: 'بنك الأنشطة', desc: 'ابتكار أنشطة تفاعلية وألعاب هادفة تناسب المكان والأدوات المتاحة.', tags: ['Activities', 'Gamification'] },
              { id: 7, icon: ArchiveIcon, color: 'indigo', title: 'المكتبة الخاصة', desc: 'حفظ ومزامنة كافة الدروس والمناهج في مكتبة خاصة للرجوع إليها.', tags: ['Storage', 'Cloud Sync'] },
              { id: 8, icon: DownloadIcon, color: 'gray', title: 'تصدير الدروس', desc: 'تحويل مخرجاتك إلى ملفات PDF منسقة بعناية أو مشاركتها رقمياً.', tags: ['PDF Export', 'Share'] }
          ].map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-6 rounded-3xl border border-white/5 hover:border-${item.color}-500/30 bg-gradient-to-br from-${item.color}-500/5 to-transparent transition-all group flex flex-col h-full`}
              >
                  <div className={`w-12 h-12 bg-${item.color}-500/10 rounded-xl flex items-center justify-center text-${item.color}-400 group-hover:scale-110 transition-transform mb-5`}>
                      <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-xl font-bold text-white mb-2 font-display group-hover:text-${item.color}-400 transition-colors`}>{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow font-spiritual">{item.desc}</p>
                  <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">{tag}</span>
                      ))}
                  </div>
              </motion.div>
          ))}
      </div>
  );

  const referenceCategories = [
    { title: "قسم التفاسير الكتابية", items: ["تفسير القمص تادرس يعقوب ملطي", "تفسير القمص أنطونيوس فكري", "Catena Aurea (السلسلة الذهبية)"] },
    { title: "قسم الآباء والباترولوجي", items: ["مجموعة نيقية وما بعد نيقية (NPNF)", "بستان الرهبان", "عظات القديس يوحنا ذهبي الفم"] },
    { title: "قسم اللغات والمخطوطات", items: ["قاموس إقلاديوس لبيب (قبطي)", "العهد الجديد اليوناني", "Codex Sinaiticus"] },
    { title: "قسم العقيدة واللاهوت", items: ["كتاب تجسد الكلمة (للأثناسيوس)", "موقع St-Takla.org", "علم اللاهوت المقارن (للبابا شنودة)"] }
  ];

  const referencesContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pb-8">
        {referenceCategories.map((category, idx) => (
             <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all bg-slate-900/40"
            >
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/5">
                    <BookOpenIcon className="w-5 h-5 text-amber-400" />
                    <h3 className="text-white font-bold font-display text-lg tracking-wide">{category.title}</h3>
                </div>
                <ul className="space-y-2">
                    {category.items.map((item, i) => (
                        <li key={i} className="text-slate-300 text-sm font-spiritual flex items-start gap-2">
                            <span className="text-amber-500/50 mt-1 text-xs">✦</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
        ))}
    </div>
  );

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
            dir="rtl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col font-sans overflow-hidden"
        >
            <div className="absolute inset-0 bg-[#020617]/40 z-[-1]"></div>
            
            <motion.header 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-[60] w-full max-w-7xl mx-auto p-4 pt-8 md:p-8 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6"
            >
                <div className="flex items-center gap-3">
                    <motion.h1 
                        whileHover={{ scale: 1.05 }}
                        className="text-5xl md:text-6xl font-bold tracking-[0.2em] font-display text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] select-none italic"
                    >
                        SPARK
                    </motion.h1>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <nav className="flex flex-wrap justify-center items-center p-1 glass-card rounded-full">
                        {navItems.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => setActiveModal(item.id)} 
                                className={`px-4 py-2 text-xs font-bold transition-all duration-300 uppercase tracking-widest rounded-full ${activeModal === item.id ? 'text-white bg-white/10 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </motion.header>

            <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1 }}
                >
                    <motion.h1 
                        whileHover={{ 
                            textShadow: "0 0 40px rgba(255,255,255,0.7), 0 0 80px rgba(245,158,11,0.3)",
                            scale: 1.05,
                            transition: { duration: 0.4 }
                        }}
                        className="text-[10rem] md:text-[14rem] lg:text-[18rem] font-bold text-white tracking-tighter leading-none mb-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] font-display italic cursor-default transition-all duration-500"
                    >
                        Spark
                    </motion.h1>
                </motion.div>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="text-xl md:text-2xl text-slate-400/90 max-w-3xl leading-relaxed mb-16 font-light font-spiritual italic"
                >
                    منصة SPARK توفر للخادم الأدوات اللاهوتية والتربوية الأكثر دقة لدعم نمو الكنيسة في العصر الرقمي.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="flex flex-col md:flex-row gap-6"
                >
                    <button 
                        onClick={handleEnter} 
                        className="group relative inline-flex items-center gap-4 px-12 py-5 bg-white text-black rounded-full font-bold text-xl transition-all duration-500 hover:scale-110 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] overflow-hidden"
                    >
                        <span className="relative z-10 font-display">ابدأ الخدمة الآن</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </button>
                </motion.div>
            </main>

            <motion.footer 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="relative z-10 p-12 w-full max-w-7xl mx-auto flex flex-col items-center justify-center"
            >
                 <div className="text-[11px] text-slate-500 uppercase tracking-[0.3em] font-medium opacity-50 space-x-reverse space-x-4">
                     <span>Created By Mark George</span>
                     <span className="text-white/20">|</span>
                     <span>v1.5.0</span>
                 </div>
            </motion.footer>

            <AnimatePresence>
                {activeModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-xl" 
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-card w-full max-w-7xl p-8 md:p-12 relative border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-y-auto max-h-[90vh]" 
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setActiveModal(null)} 
                                className="absolute top-8 right-8 p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <XMarkIcon className="w-8 h-8" />
                            </button>
                            
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-display italic">
                                    {navItems.find(i => i.id === activeModal)?.label}
                                </h2>
                                <div className="h-1.5 w-24 bg-amber-500 mx-auto rounded-full"></div>
                            </div>
                            
                            <div className="overflow-x-hidden">
                                {activeModal === 'features' && featuresContent}
                                {activeModal === 'references' && referencesContent}
                                {activeModal === 'methodology' && methodologyContent}
                                {activeModal === 'about' && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-10 px-4 text-center"
                                    >
                                        <SparklesIcon className="w-24 h-24 text-white mb-12 animate-float drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
                                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-10 font-display italic">الأصالة.. بلمسة ابتكار</h3>
                                        <div className="max-w-3xl mx-auto space-y-8 text-xl text-slate-300 leading-relaxed font-light font-spiritual italic">
                                            <p>مشروع SPARK هو نتاج رغبة عميقة في تحويل التطور الرقمي إلى قوة دافعة للخدمة الكنسية.</p>
                                            <p>نحن لا نقدم ذكاءً اصطناعياً بديلاً، بل نقدم "مساعداً أميناً" يرفع عن كاهل الخادم مشقة البحث التقني، ليمنحه مساحة أوسع للرعاية الروحية.</p>
                                        </div>
                                        <div className="mt-20 pt-10 border-t border-white/5 w-full flex flex-col items-center">
                                            <p className="text-slate-500 uppercase tracking-widest text-xs mb-4">Dedicated to the Glory of God</p>
                                            <p className="text-white font-display text-2xl font-black italic">Mark George</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroScreen;
