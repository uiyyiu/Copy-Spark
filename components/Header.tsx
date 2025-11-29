
import React, { useState, useRef, useEffect } from 'react';
import { RefreshIcon, PrintIcon, DownloadIcon, SpinnerIcon, DevicePhoneMobileIcon } from './icons';

interface HeaderProps {
    onReset: () => void;
    showActions: boolean;
    onPrint: () => void;
    onExport: (format: 'txt' | 'html', selectedOnly: boolean) => void;
    onExportPdf: (selectedOnly: boolean) => void;
    isExportingPdf: boolean;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onOpenInfoModal: (modalId: string) => void;
    isHero?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, showActions, onPrint, onExport, onExportPdf, isExportingPdf, onOpenInfoModal }) => {
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
    
    const actionButtonClasses = "hidden sm:flex items-center gap-2 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold border border-white/10 px-3 py-2 backdrop-blur-sm";
    const headerClasses = "bg-transparent border-b border-white/5";

    const navItems = [
        { id: 'features', label: 'المميزات' },
        { id: 'methodology', label: 'المنهجية' },
        { id: 'references', label: 'المراجع', highlight: true },
        { id: 'about', label: 'عن المشروع' }
    ];

    return (
        <header className={`sticky top-0 z-10 no-print transition-all duration-500 ${headerClasses}`}>
            <div className="container mx-auto flex justify-between items-center p-4">
                
                {/* Logo and Nav Section */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={onReset} title="الرئيسية">
                         <h1 className="text-3xl font-bold tracking-widest font-['Playfair_Display'] animate-spark-flash select-none text-white">SPARK</h1>
                    </div>
                    
                    {/* Nav Links - Hidden on small screens, visible on md and up */}
                    <nav className="hidden md:flex items-center gap-1">
                         {navItems.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => onOpenInfoModal(item.id)} 
                                className={`px-3 py-2 text-sm font-bold transition-all duration-300 rounded-lg
                                    ${item.highlight 
                                        ? 'text-amber-400 hover:text-amber-300' 
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2">
                    <div id="header-actions" className="flex items-center gap-2">
                        {installPrompt && (
                            <button 
                                onClick={handleInstallClick}
                                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 rounded-lg transition-all duration-300 text-sm font-bold px-3 py-2 shadow-lg hover:shadow-amber-500/20 animate-pulse border border-amber-400/20"
                            >
                                <DevicePhoneMobileIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">تثبيت التطبيق</span>
                                <span className="sm:hidden">تثبيت</span>
                            </button>
                        )}

                        {showActions && (
                            <>
                                <button onClick={onPrint} className={actionButtonClasses} aria-label="طباعة">
                                    <PrintIcon className="w-4 h-4" />
                                    <span className="spark-caption font-semibold">طباعة</span>
                                </button>
                                <div className="relative" ref={exportMenuRef}>
                                <button onClick={() => setIsExportMenuOpen(prev => !prev)} className={actionButtonClasses} aria-label="تصدير">
                                    <DownloadIcon className="w-4 h-4" />
                                    <span className="spark-caption font-semibold">تصدير</span>
                                </button>
                                {isExportMenuOpen && (
                                    <div className="absolute left-0 mt-2 w-56 bg-[#1e293b] rounded-lg shadow-2xl ring-1 ring-white/10 z-20 animate-fade-in-down border border-white/10 p-1">
                                        <div className="px-3 pt-2 pb-1 spark-caption font-semibold text-slate-400">تصدير كامل</div>
                                        <button onClick={() => { onExport('html', false); setIsExportMenuOpen(false); }} className="block w-full text-right spark-caption text-slate-200 hover:bg-white/5 rounded px-3 py-2">HTML</button>
                                        <button onClick={() => { onExport('txt', false); setIsExportMenuOpen(false); }} className="block w-full text-right spark-caption text-slate-200 hover:bg-white/5 rounded px-3 py-2">Text</button>
                                        <button onClick={() => { onExportPdf(false); setIsExportMenuOpen(false); }} disabled={isExportingPdf} className="block w-full text-right spark-caption text-slate-200 hover:bg-white/5 disabled:opacity-50 rounded px-3 py-2">
                                            {isExportingPdf ? <SpinnerIcon className="w-4 h-4 ml-2 animate-spin" /> : 'PDF'}
                                        </button>
                                    </div>
                                )}
                            </div>
                                <button onClick={onReset} className="flex items-center gap-2 bg-red-900/30 text-red-200 hover:bg-red-900/50 rounded-lg transition-colors text-sm font-semibold border border-red-800/50 px-3 py-2 backdrop-blur-sm">
                                    <RefreshIcon className="w-4 h-4" />
                                    <span className="spark-caption font-semibold">خطة جديدة</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
