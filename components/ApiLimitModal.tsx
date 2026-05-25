import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExternalLinkIcon, SparklesIcon } from './icons';

interface ApiLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onKeySaved?: () => void;
}

const ApiLimitModal: React.FC<ApiLimitModalProps> = ({ isOpen, onClose, onKeySaved }) => {
    const [apiKey, setApiKey] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const storedKey = localStorage.getItem('user_gemini_key') || '';
            setApiKey(storedKey);
            setSaved(false);
            setValidationError(null);
        }
    }, [isOpen]);

    const handleSave = () => {
        const trimmedKey = apiKey.trim();
        
        if (!trimmedKey) {
            localStorage.removeItem('user_gemini_key');
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                if (onKeySaved) onKeySaved();
                onClose();
            }, 1000);
            return;
        }

        // Broad validation for Gemini API keys (typically starts with AIzaSy)
        if (!trimmedKey.startsWith('AIzaSy') || trimmedKey.length < 30) {
            setValidationError('تنبيه: يبدو أن هذا المفتاح غير صالح. مفاتيح Gemini تبدأ بـ AIzaSy وعادةً ما تكون أطول من 30 حرفاً.');
            return;
        }

        localStorage.setItem('user_gemini_key', trimmedKey);
        setSaved(true);
        setValidationError(null);
        
        setTimeout(() => {
            setSaved(false);
            if (onKeySaved) onKeySaved();
            onClose();
        }, 1200);
    };

    const handleGoToAiStudio = () => {
        window.open('https://aistudio.google.com/app/apikey', '_blank', 'noopener,noreferrer');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-lg p-6 md:p-8 relative border border-amber-500/30 shadow-2xl rounded-3xl bg-[#0f172a]/95 text-right font-serif overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 animate-pulse border border-amber-500/20">
                        <SparklesIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white leading-tight">حد الاستخدام المجاني انتهى</h2>
                        <span className="text-xs text-amber-400 font-sans tracking-wide">GEMINI API LIMIT ATTAINED</span>
                    </div>
                </div>

                {/* Friendly Context Message */}
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
                    عفواً يا أصحابنا، نظراً للضغط الهائل والطلب العالي على خدمات الذكاء الاصطناعي اليوم، لقد وصل الحساب المشترك للتطبيق للحد الأقصى المسموح به له من الاستهلاك اليومي.
                    <br/>
                    <strong className="text-amber-400">ولكن لا تقلق!</strong> يمكنك بسهولة وبخطوات مجانية بسيطة للغاية إضافة مفتاحك الشخصي لتشغيل التطبيق فوراً وبدون أي حدود للطلبات.
                </p>

                {/* Vertical Stepper with Steps */}
                <div className="space-y-4 mb-6 text-right font-sans">
                    <h3 className="text-md font-bold text-white mb-2 border-r-2 border-amber-500 pr-2">خطوات الحصول على مفتاحك المجاني:</h3>
                    
                    {/* Step 1 */}
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold grow-0 shrink-0">١</span>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-200">الذهاب لموقع Google AI Studio</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                اضغط على الزر بالأسفل للانتقال بضغطة واحدة إلى لوحة تحكم جوجل الرسمية والآمنة (مجانية تماماً وتحتاج فقط لبريدك الإلكتروني من Gmail).
                            </p>
                        </div>
                    </div>

                    {/* Button for step 1 Link */}
                    <button 
                        onClick={handleGoToAiStudio}
                        className="w-full py-3 bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <span>الحصول على مفتاح API مجاني (بضغطة واحدة)</span>
                        <ExternalLinkIcon className="w-5 h-5 text-slate-950" />
                    </button>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold grow-0 shrink-0">٢</span>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-200">إنشاء ونَسخ المِفْتاح</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                في صفحة جوجل، اضغط على زر <strong className="text-slate-200">"Create API key"</strong>، اختر مشروعاً، ثم قم بنسخ المفتاح الناتج والذي يبدأ بـ <strong className="font-mono text-amber-500">AIzaSy...</strong>
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold grow-0 shrink-0">٣</span>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-200">الصق المِفْتاح وفَعِّله</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                قم بلصق المفتاح في الحقل أدناه مباشرة، واضغط على تفعيل المفتاح للبدء في توليد الدروس الفاخرة والألعاب بدون انقطاع.
                            </p>
                        </div>
                    </div>
                </div>

                {/* API Key Input and Form */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            مفتاح API الخاص بك:
                        </label>
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setValidationError(null);
                            }}
                            placeholder="الصق مفتاح API هنا (يبدأ بـ AIzaSy)..."
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono text-sm tracking-wide text-left"
                            dir="ltr"
                        />
                    </div>

                    {validationError && (
                        <p className="text-xs text-red-400 leading-relaxed bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                            {validationError}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={saved}
                            className="flex-1 bg-amber-500 text-slate-950 font-bold py-3.5 rounded-2xl hover:bg-amber-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                        >
                            {saved ? <CheckCircleIcon className="w-5 h-5" /> : null}
                            <span>{saved ? 'تم الحفظ والتفعيل!' : 'تفعيل وحفظ المفتاح الشخصي'}</span>
                        </button>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 text-center leading-relaxed font-sans">
                        🔒 مفتاحك يُحفظ بشكل آمن وتام في متصفحك المحلي فقط ولا يمر عبر أي خوادم خارجية وسيطة.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ApiLimitModal;
