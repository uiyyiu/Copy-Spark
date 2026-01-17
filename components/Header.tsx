
import React, { useState, useRef, useEffect } from 'react';
import { RefreshIcon, PrintIcon, DownloadIcon, SpinnerIcon, DevicePhoneMobileIcon, MenuIcon, XMarkIcon, BookmarkIcon, CheckCircleIcon, ArchiveIcon, LogoutIcon, UsersIcon, CogIcon } from './icons';
import { signInWithGoogle } from '../services/supabase';

interface HeaderProps {
    onReset: () => void;
    showActions: boolean;
    onPrint: () => void;
    onExport: (format: 'txt' | 'html', selectedOnly: boolean) => void;
    onExportPdf: (selectedOnly: boolean) => void;
    onSave?: () => void;
    isSaving?: boolean;
    saveSuccess?: boolean;
    onSignOut?: () => void;
    onOpenSaved?: () => void; 
    isExportingPdf: boolean;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onOpenInfoModal: (modalId: string) => void;
    onOpenSettings: () => void; // New prop for settings
    isHero?: boolean;
    user?: any;
}

const Header: React.FC<HeaderProps> = ({ 
    onReset, 
    showActions, 
    onPrint, 
    onExport, 
    onExportPdf, 
    onSave, 
    isSaving, 
    saveSuccess,
    onSignOut, 
    onOpenSaved, 
    isExportingPdf, 
    onOpenInfoModal, 
    onOpenSettings,
    user 
}) => {
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); 
    const [isSigningIn, setIsSigningIn] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
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

    const handleLogin = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
            setIsSigningIn(false);
        }
    };
    
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
    
    const actionButtonClasses = "hidden sm:flex items-center gap-2 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold border border-white/10 px-3 py-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed";
    const headerClasses = "bg-transparent border-b border-white/5";

    const navItems = [
        { id: 'features', label: 'المميزات' },
        { id: 'methodology', label: 'المنهجية' },
        { id: 'references', label: 'المراجع', highlight: true },
        { id: 'about', label: 'عن المشروع' }
    ];

    return (
        <header className={`sticky top-0 z-50 no-print transition-all duration-500 ${headerClasses}`}>
            <div className="container mx-auto flex justify-between items-center p-4">
                
                {/* Logo and Nav Section */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={onReset} title="الرئيسية">
                         <h1 className="text-3xl font-bold tracking-widest font-['Playfair_Display'] animate-spark-flash select-none text-white">SPARK</h1>
                    </div>
                    
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
                        
                        {/* Settings Button */}
                        <button 
                            onClick={onOpenSettings}
                            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="الإعدادات"
                        >
                            <CogIcon className="w-6 h-6" />
                        </button>

                        {/* User Profile / Login */}
                        <div className="relative ml-2 pl-2 border-l border-white/10">
                            {user ? (
                                <div className="relative" ref={profileMenuRef}>
                                    <button 
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center gap-2 focus:outline-none"
                                    >
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="User" className="w-9 h-9 rounded-full border border-white/20 hover:border-amber-500/50 transition-colors" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm border border-amber-500/30 hover:bg-amber-500/30 transition-colors">
                                                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileMenuOpen && (
                                        <div className="absolute left-0 mt-2 w-48 bg-[#1e293b] rounded-xl shadow-2xl ring-1 ring-white/10 z-50 animate-fade-in-down border border-white/10 p-1">
                                            <div className="px-4 py-3 border-b border-white/5 mb-1">
                                                <p className="text-sm text-white font-bold truncate">{fullName}</p>
                                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            </div>
                                            
                                            {onOpenSaved && (
                                                <button 
                                                    onClick={() => { onOpenSaved(); setIsProfileMenuOpen(false); }} 
                                                    className="w-full text-right flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
                                                >
                                                    <ArchiveIcon className="w-4 h-4 text-amber-400" />
                                                    المحفوظات
                                                </button>
                                            )}
                                            
                                            {onSignOut && (
                                                <button 
                                                    onClick={() => { onSignOut(); setIsProfileMenuOpen(false); }} 
                                                    className="w-full text-right flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                                                >
                                                    <LogoutIcon className="w-4 h-4" />
                                                    تسجيل الخروج
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    disabled={isSigningIn}
                                    className="flex items-center gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg px-3 py-2 text-sm font-bold border border-amber-500/30 transition-all"
                                >
                                    {isSigningIn ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <UsersIcon className="w-4 h-4" />}
                                    <span className="hidden sm:inline">تسجيل الدخول</span>
                                    <span className="sm:hidden">دخول</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button 
                            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>

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
                                {onSave && (
                                    <button 
                                        onClick={onSave} 
                                        className={`${actionButtonClasses} ${saveSuccess ? 'text-green-400 border-green-500/30' : ''}`}
                                        disabled={isSaving || saveSuccess}
                                        aria-label="حفظ الدرس"
                                    >
                                        {isSaving ? (
                                            <SpinnerIcon className="w-4 h-4 animate-spin" />
                                        ) : saveSuccess ? (
                                            <CheckCircleIcon className="w-4 h-4" />
                                        ) : (
                                            <BookmarkIcon className="w-4 h-4" />
                                        )}
                                        <span className="spark-caption font-semibold">
                                            {saveSuccess ? 'تم الحفظ' : 'حفظ'}
                                        </span>
                                    </button>
                                )}

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

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-[#0f172a] border-b border-white/10 p-4 md:hidden shadow-xl animate-fade-in-down z-40">
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onOpenInfoModal(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`text-right px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                                    item.highlight 
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
