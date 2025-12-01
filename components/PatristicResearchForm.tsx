
import React, { useState, useRef, useEffect } from 'react';
import { ScrollIcon, SendIcon, SparklesIcon, AssistantIcon, HistoryIcon, PlusIcon, TrashIcon, SidebarIcon } from './icons';
import { ChatMessage } from '../types';
import { formatTextToHtml } from '../services/exportService';

interface PatristicChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    chatHistory?: any[]; // Array of chat history objects
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

    // Auto-resize textarea
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
                        className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
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
                
                {/* Mobile Toggle & Header */}
                <div className="absolute top-4 right-4 z-10">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg bg-[#1e293b]/80 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
                        title={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
                    >
                        <SidebarIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar space-y-6 pb-24 px-4 pt-14 sm:pt-4">
                    {/* Welcome State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-80 mt-10 sm:mt-0">
                             <div className="relative mb-8">
                                <div className="absolute inset-0 bg-sky-500 blur-[40px] opacity-20 rounded-full"></div>
                                <ScrollIcon className="w-20 h-20 text-sky-400 relative z-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4 font-serif">المساعد العقيدي والآبائي</h2>
                            <p className="text-slate-300 max-w-lg leading-relaxed mb-8">
                                مرحباً بك في ركن البحث العميق.
                                <br/>
                                أنا هنا لأجيبك عن أي سؤال لاهوتي، كتابي، أو طقسي.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl text-sm">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <span className="text-sky-400 block mb-2 text-xl">☦️</span>
                                    <h3 className="font-bold text-white mb-1">أرثوذكسي صميم</h3>
                                    <p className="text-slate-400 text-xs">إجابات ملتزمة بتعليم الكنيسة القبطية.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <span className="text-sky-400 block mb-2 text-xl">📚</span>
                                    <h3 className="font-bold text-white mb-1">موثق بالمراجع</h3>
                                    <p className="text-slate-400 text-xs">آيات، أقوال آباء، ومصادر طقسية.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <span className="text-sky-400 block mb-2 text-xl">🌊</span>
                                    <h3 className="font-bold text-white mb-1">عميق ووافي</h3>
                                    <p className="text-slate-400 text-xs">شرح لاهوتي مبسط لكنه غير سطحي.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                                msg.role === 'user' 
                                    ? 'bg-slate-700 border border-slate-600' 
                                    : 'bg-sky-900/50 border border-sky-500/30'
                            }`}>
                                {msg.role === 'user' ? (
                                    <span className="text-slate-300 text-sm font-bold">أنا</span>
                                ) : (
                                    <AssistantIcon className="w-6 h-6 text-sky-400" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`relative max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl text-base leading-relaxed ${
                                msg.role === 'user'
                                    ? 'bg-slate-700 text-white rounded-tr-none'
                                    : 'bg-[#1e293b]/80 text-slate-200 border border-white/5 rounded-tl-none shadow-sm'
                            }`}>
                                 {msg.role === 'model' ? (
                                    <div 
                                        className="spark-body-serif formatted-content text-slate-200"
                                        dangerouslySetInnerHTML={{__html: formatTextToHtml(msg.content)}} 
                                    />
                                 ) : (
                                    <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                                 )}
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-4 flex-row">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-sky-900/50 border border-sky-500/30 shadow-lg">
                                <SparklesIcon className="w-5 h-5 text-sky-400 animate-pulse" />
                            </div>
                            <div className="bg-[#1e293b]/80 px-5 py-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 pt-4 px-4 pb-4">
                    <div className="relative max-w-4xl mx-auto bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex items-end gap-2 transition-all focus-within:border-sky-500/50 focus-within:bg-[#1e293b]/80 focus-within:shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="اسأل سؤالاً عقيدياً أو ابحث عن تفسير آية..."
                            rows={1}
                            className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 resize-none py-3 px-4 max-h-32 custom-scrollbar"
                            style={{ minHeight: '48px' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="p-3 rounded-xl bg-sky-500 text-white hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 mb-1 shadow-lg"
                        >
                            <SendIcon className="w-5 h-5 transform rotate-180" />
                        </button>
                    </div>
                    <p className="text-center text-slate-500 text-xs mt-3 font-sans">
                        المساعد الآبائي قد يخطئ أحياناً. راجع دائماً المراجع المذكورة.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PatristicResearchForm;
