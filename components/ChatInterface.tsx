import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ChatMessage } from '../types';
import { chatWithExplanation } from '../services/geminiService';
import { SendIcon, SparklesIcon, XMarkIcon, AssistantIcon, QuestionMarkCircleIcon } from './icons';

interface ChatInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    lessonContext: string;
    suggestedQuestions: string[];
    isLoadingSuggestions: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, lessonContext, suggestedQuestions, isLoadingSuggestions }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: 'أنا هنا لمساعدتك في تعميق فهمك لهذا الدرس. يمكنك سؤالي عن التفاصيل اللاهوتية، أو طلب أفكار تطبيقية إضافية.' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if(isOpen){
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [messages, isLoading, isOpen]);
    
    useEffect(() => {
        setMessages([
             { role: 'model', content: 'أنا هنا لمساعدتك في تعميق فهمك لهذا الدرس. يمكنك سؤالي عن التفاصيل اللاهوتية، أو طلب أفكار تطبيقية إضافية.' }
        ]);
        setUserInput('');
        setIsLoading(false);
    }, [lessonContext]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: messageText.trim() }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const chatHistoryForApi = newMessages.filter(m => m.role !== 'model' || !m.content.includes('أنا هنا لمساعدتك'));
            const modelResponse = await chatWithExplanation(lessonContext, chatHistoryForApi, messageText.trim());
            setMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: "عفواً، حدث عائق تقني." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-md h-[75vh] max-h-[700px] z-[60] no-print"
                    dir="rtl"
                >
                    <div className="flex flex-col h-full glass-card bg-slate-950/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                        
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/40">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                                   <AssistantIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white font-display italic tracking-tight uppercase">المستشار الذكي</h3>
                                    <p className="text-[9px] text-amber-500/60 font-black tracking-widest uppercase">Expert AI Guidance</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-grow p-6 space-y-6 overflow-y-auto custom-scrollbar bg-slate-950/20">
                            {messages.map((msg, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, x: msg.role === 'user' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border ${
                                        msg.role === 'user' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-amber-900/40 border-amber-500/20 text-amber-400'
                                    }`}>
                                        {msg.role === 'user' ? 'خ' : <SparklesIcon className="w-5 h-5" />}
                                    </div>
                                    <div className={`px-6 py-4 rounded-[1.8rem] max-w-[85%] text-base leading-relaxed shadow-xl font-spiritual italic ${
                                        msg.role === 'user' 
                                            ? 'bg-slate-800/80 text-white rounded-tr-none' 
                                            : 'bg-slate-900/60 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-xl'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                 <div className="flex items-center gap-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-xl bg-amber-900/40 border-amber-500/20 flex items-center justify-center text-amber-400">
                                        <SparklesIcon className="w-5 h-5" />
                                    </div>
                                    <div className="bg-slate-900/60 px-6 py-4 rounded-[1.8rem] rounded-tl-none border border-white/5 flex gap-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-950/40">
                            {messages.length <= 1 && (suggestedQuestions.length > 0 || isLoadingSuggestions) && (
                                <div className="mb-6 space-y-3">
                                    <div className="flex items-center gap-3 opacity-60">
                                        <QuestionMarkCircleIcon className="w-5 h-5 text-amber-500" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">جرّب استكشاف..</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {isLoadingSuggestions ? (
                                            [1,2,3].map(i => <div key={i} className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />)
                                        ) : (
                                            suggestedQuestions.map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => sendMessage(q)}
                                                    className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs font-spiritual italic text-slate-400 hover:text-white hover:bg-white/10 hover:border-amber-500/30 transition-all"
                                                >
                                                    {q}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <form onSubmit={(e) => { e.preventDefault(); sendMessage(userInput); }} className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                                <div className="relative bg-slate-950 border border-white/10 rounded-[2rem] p-2 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="اطرح لاهوتك في سؤال.."
                                        className="w-full px-6 py-3 bg-transparent border-none text-white focus:ring-0 placeholder-slate-600 font-spiritual italic text-lg"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !userInput.trim()}
                                        className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 disabled:opacity-20 transition-all shadow-lg"
                                    >
                                        <SendIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatInterface;
