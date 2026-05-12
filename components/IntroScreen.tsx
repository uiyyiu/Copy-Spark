
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, AssistantIcon, CheckCircleIcon, BookOpenIcon, StadiumIcon, SparklesIcon, DevicePhoneMobileIcon, TargetIcon, PuzzleIcon, FilterIcon, FileTextIcon, ImageIcon, ArchiveIcon, DownloadIcon } from './icons';

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

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

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

  return (
    <div 
        dir="rtl"
        className={`fixed inset-0 z-50 flex flex-col font-sans transition-opacity duration-1000 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
    >
        <div className="absolute inset-0 bg-[#050505]/80 pointer-events-none mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0f172a]/60 to-black/90 pointer-events-none"></div>
        
        <header className="relative z-[60] w-full max-w-7xl mx-auto p-4 pt-6 md:p-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest font-['Playfair_Display'] animate-spark-flash select-none text-white drop-shadow-lg">SPARK</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <nav className="flex flex-wrap justify-center items-center gap-2">
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveModal(item.id)} className={`flex items-center justify-center px-3 py-2 md:px-5 md:py-3 text-xs font-bold transition-all duration-300 uppercase tracking-widest rounded-lg border border-transparent bg-white/5 md:bg-transparent ${activeModal === item.id ? 'text-amber-400 bg-white/10' : 'text-slate-300 hover:text-white'}`}>
                            {item.label}
                        </button>
                    ))}
                </nav>
                {installPrompt && (
                    <button 
                        onClick={handleInstallClick}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-lg hover:shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 animate-pulse"
                    >
                        <DevicePhoneMobileIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">تثبيت التطبيق</span>
                    </button>
                )}
            </div>
        </header>

        <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto mt-0 md:mt-[-40px]">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-[1] mb-8 drop-shadow-2xl opacity-0 animate-fade-in-up" style={{fontFamily: 'Cairo, sans-serif', animationDelay: '0.3s', animationFillMode: 'forwards'}}>
                <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400">منصة SPARK</span>
                <span className="block text-2xl md:text-4xl lg:text-5xl font-light text-slate-400 mt-4 tracking-wide font-serif italic">لإعداد الدروس الروحية</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400/90 max-w-2xl leading-relaxed mb-12 font-light opacity-0 animate-fade-in-up" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}}>
                رفيق الخادم الذكي: تحضير دروس، بنك ألعاب، مساعد لاهوتي، ودراسة للكتاب المقدس. كل ما تحتاجه للخدمة في مكان واحد.
            </p>
            <div className="opacity-0 animate-fade-in-up" style={{animationDelay: '0.7s', animationFillMode: 'forwards'}}>
                <button onClick={handleEnter} className="group relative inline-flex items-center gap-4 px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] overflow-hidden">
                    <span className="relative z-10 font-serif">ابدأ الخدمة الآن</span>
                </button>
            </div>
        </main>

        <footer className="relative z-10 p-6 md:p-8 w-full max-w-7xl mx-auto flex flex-col items-center justify-center opacity-80 md:opacity-60 hover:opacity-100 transition-opacity">
             <div className="text-[12px] text-slate-400 uppercase tracking-widest font-medium">
                 Produced By Mark George • v1.3.0
             </div>
        </footer>

        {activeModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal(null)}>
                <div className="glass-card w-full max-w-7xl p-8 relative border border-white/20 shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh] bg-[#0f172a]/95" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                    <h2 className="text-3xl font-bold text-white mb-8 font-serif border-b border-white/10 pb-4 text-center">{navItems.find(i => i.id === activeModal)?.label}</h2>
                    {renderModalContent()}
                </div>
            </div>
        )}
    </div>
  );
};

export default IntroScreen;
