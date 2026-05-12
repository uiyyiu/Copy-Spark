import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XMarkIcon, CogIcon, CheckCircleIcon, SparklesIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const storedKey = localStorage.getItem('user_gemini_key') || '';
            setApiKey(storedKey);
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('user_gemini_key', apiKey.trim());
        } else {
            localStorage.removeItem('user_gemini_key');
        }
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    const handleClear = () => {
        setApiKey('');
        localStorage.removeItem('user_gemini_key');
        setSaved(true);
        setTimeout(() => setSaved(false), 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 no-print"
                    dir="rtl"
                >
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={onClose}></div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="glass-card w-full max-w-lg p-10 md:p-14 relative border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[3.5rem] bg-slate-950/60 z-10" 
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-10 left-10 p-4 rounded-2xl text-slate-600 hover:text-white transition-all">
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                        
                        <div className="text-center mb-12">
                            <div className="w-20 h-20 rounded-[2rem] bg-slate-800 border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <CogIcon className="w-10 h-10 text-slate-400" />
                            </div>
                            <h2 className="text-4xl font-black text-white font-display italic tracking-tight uppercase">غرفة التحكم</h2>
                            <p className="text-[10px] text-slate-600 font-black tracking-[0.4em] uppercase mt-2">Core System Configuration</p>
                            <div className="h-1 w-16 bg-slate-700 mx-auto rounded-full mt-6 opacity-30"></div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-3">
                                    <SparklesIcon className="w-5 h-5 text-amber-500" />
                                    مفتاح الذكاء الشخصي (API KEY)
                                </label>
                                <p className="text-sm text-slate-500 font-spiritual italic leading-relaxed mb-6">
                                    لضمان استقرار الخدمة وتجاوز حدود الطلبات العامة، يمكنك توفير مفتاح Gemini الخاص بك. سيتم تخزينه محلياً فقط على جهازك.
                                </p>
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-amber-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                    <input 
                                        type="password" 
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="لصق مفتاح الذكاء هنا..."
                                        className="relative w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white placeholder-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono text-base shadow-inner"
                                    />
                                </div>
                                <div className="pt-2 text-center">
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-amber-500/60 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                                        الحصول على مفتاح مجاني • GET KEY
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    className="flex-1 bg-amber-500 text-slate-950 font-black font-display italic py-5 rounded-[1.8rem] hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3 uppercase text-lg"
                                >
                                    {saved ? <CheckCircleIcon className="w-6 h-6" /> : null}
                                    <span>{saved ? 'تمت المزامنة' : 'حفظ التكوين'}</span>
                                </motion.button>
                                {apiKey && (
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleClear}
                                        className="w-20 bg-rose-500/10 text-rose-500 font-black rounded-[1.8rem] hover:bg-rose-500/20 transition-all border border-rose-500/20 flex items-center justify-center"
                                    >
                                        حذف
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <p className="text-[9px] text-slate-800 font-black uppercase tracking-[0.5em]">SPARK SYSTEM VER 3.0 • ENCRYPTED STORAGE</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
