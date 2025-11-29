
import React, { useState, useRef, useEffect } from 'react';
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

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-3">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
);

const SuggestionsLoadingSkeleton: React.FC = () => (
    <div className="flex flex-wrap gap-2">
        <div className="h-8 w-2/5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
    </div>
);


const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, lessonContext, suggestedQuestions, isLoadingSuggestions }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: 'انا موجود لمساعدتك في فهم شرح الدرس والمراجع المتوفرة. يمكنك طرح أي سؤال يتعلق بهم.' }
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
            setTimeout(() => inputRef.current?.focus(), 300); // Focus after animation
        }
    }, [messages, isLoading, isOpen]);
    
    // Reset state when lesson context changes (new lesson generated)
    useEffect(() => {
        setMessages([
             { role: 'model', content: 'انا موجود لمساعدتك في فهم شرح الدرس والمراجع المتوفرة. يمكنك طرح أي سؤال يتعلق بهم.' }
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
            const chatHistoryForApi = newMessages.filter(m => m.role !== 'model' || !m.content.includes('انا موجود لمساعدتك'));
            const modelResponse = await chatWithExplanation(lessonContext, chatHistoryForApi, messageText.trim());
            setMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ ما.";
            setMessages(prev => [...prev, { role: 'model', content: `عفواً، ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(userInput);
    };

    const handleSuggestedQuestionClick = (question: string) => {
        sendMessage(question);
    };

    const showSuggestions = messages.length <= 1;
    
    return (
        <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px] z-40 transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-full">
                           <AssistantIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="spark-h3 text-slate-700 dark:text-slate-200" style={{margin: 0}}>اسأل مساعدك</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close chat">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-amber-100 dark:bg-amber-800/50 rounded-full self-start">
                                    <SparklesIcon className="w-5 h-5 text-amber-500" />
                                </div>
                            )}
                            <div className={`spark-body px-4 py-2 rounded-2xl max-w-xs sm:max-w-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start animate-fade-in-up">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-amber-100 dark:bg-amber-800/50 rounded-full self-start">
                                <SparklesIcon className="w-5 h-5 text-amber-500" />
                            </div>
                             <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 rounded-bl-none">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    {showSuggestions && (suggestedQuestions.length > 0 || isLoadingSuggestions) && (
                        <div className="p-3 animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-2">
                                <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                <h4 className="spark-caption font-semibold text-slate-600 dark:text-slate-300">
                                    جرّب أن تسأل:
                                </h4>
                            </div>
                           {isLoadingSuggestions ? (
                               <SuggestionsLoadingSkeleton />
                           ) : (
                               <div className="flex flex-wrap gap-2">
                                   {suggestedQuestions.map((q, i) => (
                                       <button
                                           key={i}
                                           onClick={() => handleSuggestedQuestionClick(q)}
                                           className="spark-caption px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                       >
                                           {q}
                                       </button>
                                   ))}
                               </div>
                           )}
                        </div>
                    )}
                    <div className={`p-3 ${(showSuggestions && (suggestedQuestions.length > 0 || isLoadingSuggestions)) ? 'border-t border-slate-200 dark:border-slate-700' : ''}`}>
                         <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="اطرح سؤالك هنا..."
                                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition text-right spark-body"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !userInput.trim()}
                                className="p-2.5 rounded-full bg-amber-400 text-white hover:bg-amber-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                aria-label="Send message"
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChatInterface;
