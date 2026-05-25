
import React, { useState, useRef, useEffect } from 'react';
import { ScrollIcon, SendIcon, SparklesIcon, AssistantIcon, HistoryIcon, PlusIcon, TrashIcon, SidebarIcon, BookmarkIcon, CheckCircleIcon, CopyIcon } from './icons';
import { ChatMessage } from '../types';
import { formatTextToHtml } from '../services/exportService';
import { saveLessonToLibrary, signInWithGoogle } from '../services/supabase';
import GuidedTour, { TourStep } from './GuidedTour';
import { HelpCircle } from 'lucide-react';

interface PatristicChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (message: string, depth?: 'kids' | 'father' | 'apologetics') => void;
    isLoading: boolean;
    chatHistory?: any[]; // Array of chat history objects
    currentChatId?: string | null;
    onNewChat?: () => void;
    onLoadChat?: (chat: any) => void;
    onDeleteChat?: (id: string) => void;
    user?: any;
}

const SUGGESTED_TOPICS = [
    {
        title: "لاهوت عقيدي ودفاعي",
        icon: "☦️",
        color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        questions: [
            "كيف نفهم عقيدة الثالوث القدوس بشرح لاهوتي مبسط؟",
            "كيف نرد علمياً وتاريخياً على مَن يقول بتحريف الكتاب المقدس؟",
            "لماذا يسمح الله بوجود الألم والتجارب في العالم إذا كان محباً؟"
        ]
    },
    {
        title: "طقوس وليتورجيات كنسية",
        icon: "⛪",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        questions: [
            "ما هي الدلالات الروحية لغسل الأرجل في خميس العهد؟",
            "لماذا نستخدم البخور والشموع والأيقونات في الكنيسة الأرثوذكسية؟",
            "اشرح لاهوت وسر المعمودية وعلاقتها بالولادة الجديدة."
        ]
    },
    {
        title: "تفسير آبائي وروحي",
        icon: "📚",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        questions: [
            "كيف فسر القديس أثناسيوس آية «أبي أعظم مني» لاهوتياً؟",
            "أقوال الآباء في الجهاد الروحي بخصوص النعمة والإرادة الحرة.",
            "مفهوم الخلاص والتقديس عند القديس كيرلس الكبير."
        ]
    }
];

const PatristicResearchForm: React.FC<PatristicChatInterfaceProps> = ({ 
    messages, 
    onSendMessage, 
    isLoading,
    chatHistory = [],
    currentChatId,
    onNewChat,
    onLoadChat,
    onDeleteChat,
    user
}) => {
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [depth, setDepth] = useState<'father' | 'kids' | 'apologetics'>('father');
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [savedIcons, setSavedIcons] = useState<Record<number, boolean>>({});
    const [isTourOpen, setIsTourOpen] = useState(false);

    const tourSteps: TourStep[] = [
        {
            targetId: 'tour-patristic-sidebar-btn',
            title: 'قائمة السجل الجانبية 📜',
            description: 'من هنا يمكنك إخفاء أو إظهار السجل الجانبي للمحادثات، بالإضافة إلى بدء مناقشة عقائدية آبائية جديدة لحفظ تساؤلاتك السابقة بخصوص الطقوس والإيمان.',
            position: 'bottom'
        },
        {
            targetId: 'tour-patristic-topics',
            title: 'مواضيع جاهزة وسريعة 💡',
            description: 'إذا لم تكن متأكداً مما تسأل عنه، يمكنك بنقرة واحدة اختيار أي سؤال شائع بخصوص اللاهوت الدفاعي، طقوس الكنيسة القبطية الأرثوذكسية، والتفسيرات الآبائية!',
            position: 'top'
        },
        {
            targetId: 'tour-patristic-depth',
            title: 'مستويات الرد الذكية الثلاثة ⚙️',
            description: 'اختر "خازن الآباء" للحصول على مراجع دقيقة وعميقة للغاية، أو "التعليمي المبسط" لإيصال المفاهيم للأعمار الصغيرة، أو "مدافع الإيمان" لحل الشبهات لاهوتياً وفلسفياً بشكل كافٍ ووافٍ!',
            position: 'top'
        },
        {
            targetId: 'tour-patristic-input-container',
            title: 'صندوق الأسئلة والبحث عبر التقليد الكنسي 🔮',
            description: 'اكتب هنا أي سؤال لاهوتي أو عقائدي أو طقسي يدور في ذهنك (مثال: شرح آية، أصل صلاة ليتورجية، دحض شك عقائدي) واضغط إرسال لبدء الحوار الثري والبحثي فوراً!',
            position: 'top'
        }
    ];
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSendMessage(input, depth);
            setInput('');
            if (inputRef.current) inputRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickQuestionClick = (question: string) => {
        if (isLoading) return;
        onSendMessage(question, depth);
    };

    const handleCopyResponse = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        alert("تم نسخ الرد بالكامل إلى الحافظة!");
    };

    const handleSaveResponse = async (comment: string, index: number) => {
        if (!user) {
            if (confirm("يجب عليك تسجيل الدخول لحفظ الرد في مكتبتك الروحية. هل تريد تسجيل الدخول الآن؟")) {
                await signInWithGoogle();
            }
            return;
        }

        const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
        setIsSaving(index.toString());
        try {
            const matchedQuestion = messages[index - 1]?.content || "سؤال عقيدي";
            const depthLabel = depth === 'father' ? 'آبائي عميق' : depth === 'kids' ? 'مبسط للأطفال' : 'لاهوت دفاعي';
            const title = `بحث عقيدي: ${matchedQuestion.slice(0, 30)}${matchedQuestion.length > 30 ? '...' : ''}`;
            
            const savedContent = {
                type: 'patristic-research',
                question: matchedQuestion,
                answer: comment,
                depth: depthLabel,
                savedAt: new Date().toISOString()
            };

            await saveLessonToLibrary(user.id, title, savedContent, userName);
            setSavedIcons(prev => ({ ...prev, [index]: true }));
            setTimeout(() => {
                setSavedIcons(prev => ({ ...prev, [index]: false }));
            }, 3000);
        } catch (err) {
            console.error("Error saving patristic response:", err);
            alert("فشل الحفظ. حاول مرة أخرى.");
        } finally {
            setIsSaving(null);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto h-[calc(100vh-140px)] flex animate-fade-in overflow-hidden rounded-2xl border border-white/5 bg-[#0f172a]/40 backdrop-blur-md">
            
            {/* Sidebar (History) */}
            <div className={`transition-all duration-300 border-l border-white/10 bg-[#0f172a]/60 flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-bold font-serif flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5 text-sky-400" />
                        السجل
                    </h3>
                    <button 
                        onClick={onNewChat}
                        className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all active:scale-95"
                        title="محادثة جديدة"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {chatHistory.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-10 px-4">
                            لا يوجد سجل محادثات سابق.
                        </div>
                    ) : (
                        chatHistory.map((chat) => (
                            <div 
                                key={chat.id}
                                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                                    currentChatId === chat.id 
                                        ? 'bg-sky-500/20 border border-sky-500/30' 
                                        : 'hover:bg-white/5 border border-transparent'
                                }`}
                                onClick={() => onLoadChat && onLoadChat(chat)}
                            >
                                <div className="flex-grow min-w-0">
                                    <p className={`text-sm font-medium truncate ${currentChatId === chat.id ? 'text-white' : 'text-slate-300'}`}>
                                        {chat.title || 'محادثة جديدة'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {new Date(chat.updated_at).toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                                {onDeleteChat && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="حذف"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative h-full">
                
                {/* Mobile Toggle, Tour & Header */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        id="tour-patristic-sidebar-btn"
                        className="p-2 rounded-lg bg-[#1e293b]/80 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
                        title={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
                    >
                        <SidebarIcon className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsTourOpen(true)}
                        className="bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 text-xs font-bold px-3 py-2 rounded-lg border border-sky-500/30 flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer animate-pulse"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>جولة تعليمية 🗺️</span>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar space-y-6 pb-32 px-4 pt-14 sm:pt-4">
                    {/* Welcome State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-start h-full text-center opacity-90 mt-10 sm:mt-4 p-4 md:p-8 max-w-4xl mx-auto space-y-8">
                             <div className="relative mb-2">
                                <div className="absolute inset-0 bg-sky-500 blur-[40px] opacity-20 rounded-full animate-pulse"></div>
                                <ScrollIcon className="w-16 h-16 text-sky-400 relative z-10" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-3 font-serif">المساعد العقيدي والآبائي المطور</h2>
                                <p className="text-slate-300 max-w-xl leading-relaxed text-sm md:text-base mx-auto">
                                    مرحباً بك في ركن البحث المتكامل وسند الخدام اللاهوتي. 
                                    اختر مستوى الشرح واطرح تساؤلاتك أو استعن بالأسئلة والمواضيع الجاهزة بالأسفل.
                                </p>
                            </div>

                            {/* Core stats/qualities */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                <div className="bg-white/5 border border-white/15 p-4 rounded-2xl backdrop-blur-sm shadow-xl text-right">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xl">☦️</span>
                                        <h3 className="font-bold text-white text-sm">أرثوذكسي صميم</h3>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed">إجابات ملتزمة بالتقليد الكنسي القديم والتعليم القبطي المستقيم.</p>
                                </div>
                                <div className="bg-white/5 border border-white/15 p-4 rounded-2xl backdrop-blur-sm shadow-xl text-right">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xl">📚</span>
                                        <h3 className="font-bold text-white text-sm">موثق بالمراجع الآبائية</h3>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed">يدعم الإجابات بالنصوص الرسولية لأقمار الكنيسة الثلاثة الكبار والأثرياء.</p>
                                </div>
                                <div className="bg-white/5 border border-white/15 p-4 rounded-2xl backdrop-blur-sm shadow-xl text-right">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xl">🛡️</span>
                                        <h3 className="font-bold text-white text-sm">علمية ودفاعية مقنعة</h3>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed">تقدم ردوداً عقلانية رصينة ومحبة لتفنيد وحل شكوك ومشاكل الشباب الفكرية.</p>
                                </div>
                            </div>
                            
                            {/* Suggested Explorations */}
                            <div id="tour-patristic-topics" className="w-full text-right mt-10">
                                <h3 className="text-lg font-bold text-white mb-4 border-r-2 border-sky-400 pr-3 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-sky-400 animate-pulse" />
                                    مواضيع لاهوتية معاصرة وأسئلة تفاعلية شائعة:
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {SUGGESTED_TOPICS.map((topic, tIdx) => (
                                        <div key={tIdx} className="bg-[#111827]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/10 transition-all shadow-md">
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                                                <span className="text-xl">{topic.icon}</span>
                                                <span className="font-bold text-slate-100 text-sm font-serif">{topic.title}</span>
                                            </div>
                                            <div className="space-y-2 flex-grow">
                                                {topic.questions.map((q, qIdx) => (
                                                    <button
                                                        key={qIdx}
                                                        onClick={() => handleQuickQuestionClick(q)}
                                                        className="w-full text-right text-xs text-slate-300 hover:text-sky-300 bg-white/5 hover:bg-sky-500/5 border border-transparent hover:border-sky-500/20 rounded-xl p-2.5 transition-all leading-relaxed"
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse animate-fade-in-up' : 'flex-row animate-fade-in'}`}>
                            
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                                msg.role === 'user' 
                                    ? 'bg-slate-700 border border-slate-600' 
                                    : 'bg-gradient-to-tr from-sky-900/60 to-sky-700/80 border border-sky-500/40'
                             }`}>
                                {msg.role === 'user' ? (
                                    <span className="text-slate-300 text-sm font-bold">أنا</span>
                                ) : (
                                    <AssistantIcon className="w-5 h-5 text-sky-400" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`relative max-w-[85%] sm:max-w-[75%] px-5 py-4 rounded-2xl text-base leading-relaxed group ${
                                msg.role === 'user'
                                    ? 'bg-gradient-to-l from-slate-700 to-slate-800 text-white rounded-tr-none shadow-md'
                                    : 'bg-gradient-to-b from-[#1e293b]/90 to-[#0f172a]/95 text-slate-200 border border-white/10 rounded-tl-none shadow-xl'
                            }`}>
                                 {msg.role === 'model' ? (
                                    <>
                                        <div 
                                            className="spark-body-serif formatted-content text-slate-200"
                                            dangerouslySetInnerHTML={{__html: formatTextToHtml(msg.content)}} 
                                        />
                                        
                                        {/* Action buttons on responses */}
                                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 relative">
                                            <button
                                                onClick={() => handleCopyResponse(msg.content, idx)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-sky-500/10 text-slate-300 hover:text-white transition-all shadow-sm border border-white/5"
                                                title="نسخ الإجابة"
                                            >
                                                <CopyIcon className="w-3.5 h-3.5" />
                                                <span>نسخ الرد</span>
                                            </button>
                                            <button
                                                onClick={() => handleSaveResponse(msg.content, idx)}
                                                disabled={isSaving !== null}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 transition-all shadow-sm border ${
                                                    savedIcons[idx] 
                                                        ? 'text-green-400 border-green-500/20 bg-green-500/5' 
                                                        : 'hover:text-amber-400 border-white/5 hover:bg-amber-500/10'
                                                }`}
                                                title="حفظ في مذكرتك للمرجعية"
                                            >
                                                {isSaving === idx.toString() ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                                ) : savedIcons[idx] ? (
                                                    <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" />
                                                ) : (
                                                    <BookmarkIcon className="w-3.5 h-3.5" />
                                                )}
                                                <span>{savedIcons[idx] ? 'تم الحفظ بالمحفوظات' : 'حفظ في مكتبتي'}</span>
                                            </button>
                                        </div>
                                    </>
                                 ) : (
                                    <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                                 )}
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-4 flex-row animate-pulse">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-sky-900/50 border border-sky-500/30 shadow-lg">
                                <SparklesIcon className="w-5 h-5 text-sky-400 animate-spin" />
                            </div>
                            <div className="bg-[#1e293b]/80 px-5 py-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input and Controls Area */}
                <div className="flex-shrink-0 pt-4 px-4 pb-4 bg-[#0f172a]/70 border-t border-white/5 backdrop-blur-3xl absolute bottom-0 left-0 right-0 z-10">
                    <div className="max-w-4xl mx-auto flex flex-col gap-3">
                        {/* Interactive depth mode layout selector */}
                        <div id="tour-patristic-depth" className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center justify-start gap-2 select-none text-right">
                                <span className="text-[11px] font-bold text-slate-400 ml-2">مستوى الشرح والردود المطلوبة:</span>
                                <button
                                    type="button"
                                    onClick={() => setDepth('father')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border cursor-pointer active:scale-95 ${
                                        depth === 'father'
                                            ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.15)] scale-[1.02]'
                                            : 'text-slate-400 hover:text-slate-200 bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <span>☦️ خازن الآباء (عميق وموثق)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDepth('kids')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border cursor-pointer active:scale-95 ${
                                        depth === 'kids'
                                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]'
                                            : 'text-slate-400 hover:text-slate-200 bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <span>👶 التعليمي (مبسط للأطفال)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDepth('apologetics')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border cursor-pointer active:scale-95 ${
                                        depth === 'apologetics'
                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]'
                                            : 'text-slate-400 hover:text-slate-200 bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <span>🛡️ مدافع الإيمان (دفاعي وعملي)</span>
                                </button>
                            </div>

                            {/* Dynamically styled descriptive banner for the active mode */}
                            <div className={`transition-all duration-300 rounded-xl px-4 py-2 border text-[11px] leading-relaxed text-right ${
                                depth === 'father' 
                                    ? 'bg-sky-950/20 text-sky-200/90 border-sky-500/20' 
                                    : depth === 'kids'
                                    ? 'bg-amber-950/20 text-amber-200/90 border-amber-500/20'
                                    : 'bg-emerald-950/20 text-emerald-200/90 border-emerald-500/20'
                            }`}>
                                {depth === 'father' && (
                                    <span>💡 **خازن الآباء**: ردود أكاديمية كاملة مع مراجع من كتابات القديس أثناسيوس، كيرلس الكبير، وذهبي الفم، والصلوات الليتورجية والمصطلحات اليونانية للتأصيل.</span>
                                )}
                                {depth === 'kids' && (
                                    <span>💡 **التعليمي (مبسط)**: ردود وافية لمدارس الأحد والخدام تناسب الصغار بسرد قصصي وتشبيهات محسوسة قريبة للتوضيح مع حماية العمق.</span>
                                )}
                                {depth === 'apologetics' && (
                                    <span>💡 **مدافع الإيمان**: ردود عقلانية رصينة ومحبة لتفنيد وحل الشكوك المعاصرة بأدلة علمية وتاريخية ومنهجية وتأصيل فكري مسيحي عميق.</span>
                                )}
                            </div>
                        </div>

                        <div id="tour-patristic-input-container" className="relative bg-[#1e293b]/60 border border-white/10 rounded-2xl shadow-2xl p-2 flex items-end gap-2 transition-all focus-within:border-sky-500/50 focus-within:bg-[#1e293b]/80 focus-within:shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="اسأل سؤالاً عقيدياً أو طقسياً أو ابحث في التقليد..."
                                rows={1}
                                className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 resize-none py-3 px-4 max-h-32 custom-scrollbar outline-none font-sans"
                                style={{ minHeight: '48px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 mb-1 shadow-lg cursor-pointer"
                            >
                                <SendIcon className="w-5 h-5 transform rotate-180" />
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-slate-500 text-[10px] mt-2 font-sans">
                        المساعد الآبائي قد يخطئ ويرجى دوماً الاعتماد على الكتب المعتمدة للكنيسة.
                    </p>
                </div>
            </div>
            <GuidedTour 
                isOpen={isTourOpen} 
                onClose={() => setIsTourOpen(false)} 
                steps={tourSteps} 
                tourKey="patristic-research-tour"
            />
        </div>
    );
};

export default PatristicResearchForm;
