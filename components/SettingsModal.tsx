
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CogIcon, CheckCircleIcon } from './icons';

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
        const trimmed = apiKey.trim();
        if (trimmed) {
            // Support comma, semicolon, space or newline separated keys
            const keys = trimmed
                .split(/[,\s;\n]+/)
                .map(k => k.trim())
                .filter(k => k.length > 0);
            
            if (keys.length > 0) {
                localStorage.setItem('user_gemini_key', keys.join(', '));
            } else {
                localStorage.removeItem('user_gemini_key');
            }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-md p-6 relative border border-white/20 shadow-2xl rounded-3xl bg-[#0f172a]/95" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-slate-700/50 text-slate-200">
                        <CogIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-serif">الإعدادات</h2>
                        <span className="text-[10px] text-amber-400">تدوير المفاتيح تلقائياً مفعل 🔄</span>
                    </div>
                </div>

                <div className="space-y-4 text-right">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            مفتاح أو مفاتيح API الشخصية (اختياري)
                        </label>
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                            إذا كنت تواجه مشكلة "الخدمة مشغولة" (Rate Limit)، يمكنك إضافة مفتاح Google Gemini API أو <span className="text-amber-400 font-bold">عدة مفاتيح مفصولة بأسطر أو فواصل</span> هنا، وسيقوم التطبيق بالتبديل بينها تلقائياً عند انتهاء حد أحدها!
                            <br/>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                                احصل على مفتاح مجاني من هنا
                            </a>
                        </p>
                        <textarea 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="الصق مفتاح API هنا...&#10;أو الصق عدة مفاتيح (كل مفتاح في سطر أو مفصولة بفواصل) لتفعيل التبديل التلقائي."
                            rows={3}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-mono text-xs text-left"
                            dir="ltr"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            onClick={handleSave}
                            className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                        >
                            {saved ? <CheckCircleIcon className="w-5 h-5" /> : null}
                            {saved ? 'تم الحفظ' : 'حفظ الإعدادات'}
                        </button>
                        {apiKey && (
                            <button 
                                onClick={handleClear}
                                className="px-4 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
                            >
                                حذف
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
