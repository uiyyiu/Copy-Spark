import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollIcon, SendIcon, SparklesIcon, AssistantIcon, HistoryIcon, PlusIcon, TrashIcon, SidebarIcon } from './icons';
import { ChatMessage } from '../types';
import { formatTextToHtml } from '../services/exportService';

interface PatristicChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    chatHistory?: any[];
    currentChatId?: string | null;
    onNewChat?: () => void;
    onLoadChat?: (chat: any) => void;
    onDeleteChat?: (id: string) => void;
}

const PatristicResearchForm: React.FC<PatristicChatInterfaceProps> = ({ 
    messages, 
    onSendMessage, 
    isLoading,
    chatHistory = [],
    currentChatId,
    onNewChat,
    onLoadChat,
    onDeleteChat
}) => {
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSendMessage(input);
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

    return (
        <div className="w-full max-w-7xl mx-auto h-[calc(100vh-140px)] flex animate-fade-in overflow-hidden rounded-[3rem] border border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]" dir="rtl">
            
            {/* Sidebar (History) */}
            <motion.div 
                animate={{ width: isSidebarOpen ? 320 : 0 }}
                className="border-l border-white/5 bg-slate-950/60 backdrop-blur-2xl flex flex-col overflow-hidden relative z-20"
            >
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-white font-black font-display italic text-lg tracking-tight flex items-center gap-3">
                        <HistoryIcon className="w-6 h-6 text-sky-400" />
                        سجل المحادثات
                    </h3>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onNewChat}
                        className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 flex items-center justify-center transition-all border border-sky-500/20"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </motion.button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {chatHistory.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-20 px-6 font-spiritual italic opacity-60">
                            لا يوجد سجل محادثات مسبق.. ابدأ حوارك الآن.
                        </div>
                    ) : (
                        <AnimatePresence>
                            {chatHistory.map((chat, idx) => (
                                <motion.div 
                                    key={chat.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-500 border ${
                                        currentChatId === chat.id 
                                            ? 'bg-sky-500/10 border-sky-500/30 shadow-lg' 
                                            : 'hover:bg-white/5 border-transparent'
                                    }`}
                                    onClick={() => onLoadChat && onLoadChat(chat)}
                                >
                                    <div className="flex-grow min-w-0">
                                        <p className={`text-sm font-black truncate font-display italic tracking-tight ${currentChatId === chat.id ? 'text-white' : 'text-slate-400'}`}>
                                            {chat.title || 'محادثة جديدة'}
                                        </p>
                                        <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-bold">
                                            {new Date(chat.updated_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    {onDeleteChat && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                                            className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative h-full bg-slate-900/10">
                
                {/* Header Toggle */}
                <div className="absolute top-6 right-6 z-30">
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-12 h-12 rounded-2xl bg-slate-950/80 text-slate-400 hover:text-white border border-white/5 backdrop-blur-3xl transition-all shadow-2xl flex items-center justify-center"
                    >
                        <SidebarIcon className="w-6 h-6" />
                    </motion.button>
                </div>

                <div className="flex-grow overflow-y-auto space-y-10 pb-32 px-6 md:px-12 pt-24 custom-scrollbar">
                    {/* Welcome State */}
                    {messages.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                        >
                             <div className="relative mb-12">
                                <div className="absolute inset-0 bg-sky-500 blur-[80px] opacity-20 rounded-full scale-150"></div>
                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-950 border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                                    <ScrollIcon className="w-16 h-16 text-sky-400" />
                                </div>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-display italic tracking-tight uppercase">المساعد الآبائي</h2>
                            <p className="text-xl text-slate-400 max-w-xl leading-relaxed mb-12 font-spiritual italic">
                                مرحباً بك في ركن البحث العميق. أنا خادمك الرقمي المستنير، مستعد للإبحار معك في دروب اللاهوت والعقيدة بروح أرثوذكسية أصيلة.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                                {[
                                    { icon: "☦️", title: "أرثوذكسي الجذور", desc: "إجابات ملتزمة بتعليم الآباء والتقليد الكنسي." },
                                    { icon: "🏛️", title: "موثق بالمصادر", desc: "ربط فوري بأمهات الكتب والمجامع المسكونية." },
                                    { icon: "✨", title: "عميق وبسيط", desc: "شرح يجمع بين البساطة والرصانة اللاهوتية." }
                                ].map((step, k) => (
                                    <div key={k} className="glass-card bg-white/5 border border-white/5 p-8 rounded-[2rem] backdrop-blur-3xl group hover:bg-white/10 transition-all duration-500">
                                        <span className="text-3xl block mb-4 filter drop-shadow-lg">{step.icon}</span>
                                        <h3 className="font-black text-white mb-2 font-display italic tracking-tight">{step.title}</h3>
                                        <p className="text-slate-500 text-xs font-spiritual italic leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Messages */}
                    <div className="space-y-10">
                        {messages.map((msg, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border ${
                                    msg.role === 'user' 
                                        ? 'bg-slate-800 border-slate-700 text-slate-400 font-black font-display italic' 
                                        : 'bg-sky-950/40 border-sky-500/30 text-sky-400'
                                }`}>
                                    {msg.role === 'user' ? 'خ' : <AssistantIcon className="w-7 h-7" />}
                                </div>

                                <div className={`relative max-w-[85%] sm:max-w-[80%] px-8 py-6 rounded-[2.5rem] text-lg leading-relaxed shadow-2xl ${
                                    msg.role === 'user'
                                        ? 'bg-slate-800/80 text-white rounded-tr-none'
                                        : 'bg-slate-900/60 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-3xl'
                                }`}>
                                     {msg.role === 'model' ? (
                                        <div 
                                            className="font-spiritual italic formatted-content prose prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{__html: formatTextToHtml(msg.content)}} 
                                        />
                                     ) : (
                                        <p className="whitespace-pre-wrap font-spiritual italic">{msg.content}</p>
                                     )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="flex gap-6 flex-row"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-sky-950/40 border border-sky-500/30 text-sky-400 shadow-2xl">
                                    <SparklesIcon className="w-6 h-6 animate-pulse" />
                                </div>
                                <div className="bg-slate-900/40 px-8 py-6 rounded-[2.5rem] rounded-tl-none border border-white/5 flex items-center gap-3 backdrop-blur-3xl">
                                    <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce"></div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                    <div className="relative max-w-5xl mx-auto group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                        <div className="relative bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-3 flex items-end gap-3 shadow-2xl transition-all focus-within:border-sky-500/50">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="اسأل عن التراث الآبائي..."
                                rows={1}
                                className="w-full bg-transparent border-none text-white placeholder-slate-600 focus:ring-0 resize-none py-4 px-6 text-xl font-spiritual italic leading-relaxed max-h-40 custom-scrollbar"
                                style={{ minHeight: '60px' }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-14 h-14 rounded-2xl bg-sky-500 text-slate-950 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center flex-shrink-0 mb-1 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                            >
                                <SendIcon className="w-7 h-7 transform rotate-180" />
                            </motion.button>
                        </div>
                        <p className="text-center text-slate-600 text-[10px] uppercase tracking-[0.3em] font-black mt-4 opacity-50">
                            Powered by Spiritual AI • Rooted in Tradition
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatristicResearchForm;
