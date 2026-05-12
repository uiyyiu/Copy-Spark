import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    onOpenSettings: () => void;
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
    
    const actionButtonClasses = "inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all text-sm font-bold border border-white/5 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed shadow-lg";

    const navItems = [
        { id: 'features', label: 'المميزات' },
        { id: 'methodology', label: 'المنهجية' },
        { id: 'references', label: 'المراجع', highlight: true },
        { id: 'about', label: 'عن المشروع' }
    ];

    return (
        <header className="sticky top-0 z-50 no-print transition-all duration-500 glass-card bg-slate-950/40 border-b border-white/5 backdrop-blur-2xl">
            <div className="container mx-auto flex justify-between items-center px-6 py-4">
                
                {/* Logo and Nav Section */}
                <div className="flex items-center gap-10">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 cursor-pointer group" 
                        onClick={onReset}
                    >
                         <h1 className="text-3xl font-black tracking-[0.2em] font-display text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">SPARK</h1>
                    </motion.div>
                    
                    <nav className="hidden lg:flex items-center gap-2">
                         {navItems.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => onOpenInfoModal(item.id)} 
                                className={`px-4 py-2 text-xs font-bold transition-all duration-300 rounded-xl tracking-widest uppercase
                                    ${item.highlight 
                                        ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/5' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        
                        {/* Settings Button */}
                        <button 
                            onClick={onOpenSettings}
                            className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
                            title="الإعدادات"
                        >
                            <CogIcon className="w-6 h-6" />
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        {/* User Profile / Login */}
                        <div className="relative">
                            {user ? (
                                <div className="relative" ref={profileMenuRef}>
                                    <button 
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center gap-2 focus:outline-none group"
                                    >
                                        <div className="relative">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="User" className="w-10 h-10 rounded-2xl border border-white/10 p-0.5 group-hover:border-amber-500/50 transition-all duration-500" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-sm border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                                                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isProfileMenuOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute left-0 mt-4 w-60 glass-card bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 border border-white/10 p-2"
                                            >
                                                <div className="px-5 py-4 border-b border-white/5 mb-2">
                                                    <p className="text-sm text-white font-black truncate font-display italic">{fullName}</p>
                                                    <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest mt-1">{user.email}</p>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => { onOpenSaved?.(); setIsProfileMenuOpen(false); }} 
                                                    className="w-full text-right flex items-center gap-4 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                >
                                                    <ArchiveIcon className="w-5 h-5 text-amber-400" />
                                                    <span className="font-spiritual italic">المكتبة الخاصة</span>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => { onSignOut?.(); setIsProfileMenuOpen(false); }} 
                                                    className="w-full text-right flex items-center gap-4 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all mt-1"
                                                >
                                                    <LogoutIcon className="w-5 h-5" />
                                                    <span className="font-spiritual italic">تسجيل الخروج</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogin}
                                    disabled={isSigningIn}
                                    className="flex items-center gap-3 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-2xl px-5 py-2.5 text-sm font-black border border-amber-500/20 transition-all shadow-lg"
                                >
                                    {isSigningIn ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <UsersIcon className="w-4 h-4" />}
                                    <span className="hidden sm:inline font-display italic">دخول المسئول</span>
                                </motion.button>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button 
                            className="lg:hidden p-2.5 rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/5"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                        </button>
                    </div>

                    {showActions && (
                        <div className="hidden xl:flex items-center gap-3">
                            {onSave && (
                                <button 
                                    onClick={onSave} 
                                    className={`${actionButtonClasses} ${saveSuccess ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : ''}`}
                                    disabled={isSaving || saveSuccess}
                                >
                                    {isSaving ? (
                                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                                    ) : saveSuccess ? (
                                        <CheckCircleIcon className="w-4 h-4" />
                                    ) : (
                                        <BookmarkIcon className="w-4 h-4" />
                                    )}
                                    <span className="font-display italic">{saveSuccess ? 'تم الأرشفة' : 'أرشفة'}</span>
                                </button>
                            )}

                            <button onClick={onPrint} className={actionButtonClasses}>
                                <PrintIcon className="w-4 h-4" />
                                <span className="font-display italic text-slate-100">طباعة</span>
                            </button>
                            
                            <div className="relative" ref={exportMenuRef}>
                                <button onClick={() => setIsExportMenuOpen(prev => !prev)} className={actionButtonClasses}>
                                    <DownloadIcon className="w-4 h-4" />
                                    <span className="font-display italic text-slate-100">تصدير</span>
                                </button>
                                <AnimatePresence>
                                    {isExportMenuOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute left-0 mt-4 w-56 glass-card bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl z-50 border border-white/10 p-2"
                                        >
                                            <div className="px-4 pt-3 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">تنسيق التصدير</div>
                                            <button onClick={() => { onExport('html', false); setIsExportMenuOpen(false); }} className="block w-full text-right font-spiritual italic text-slate-200 hover:bg-white/5 rounded-xl px-4 py-3 text-sm">HTML (ويب)</button>
                                            <button onClick={() => { onExport('txt', false); setIsExportMenuOpen(false); }} className="block w-full text-right font-spiritual italic text-slate-200 hover:bg-white/5 rounded-xl px-4 py-3 text-sm">النص الصافي</button>
                                            <button onClick={() => { onExportPdf(false); setIsExportMenuOpen(false); }} disabled={isExportingPdf} className="block w-full text-right font-spiritual italic text-slate-200 hover:bg-white/5 disabled:opacity-50 rounded-xl px-4 py-3 text-sm">
                                                {isExportingPdf ? <SpinnerIcon className="w-4 h-4 ml-2 animate-spin" /> : 'PDF (للطباعة)'}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={onReset} className="flex items-center gap-3 bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 rounded-2xl px-5 py-2.5 text-sm font-black border border-rose-600/20 transition-all shadow-lg">
                                <RefreshIcon className="w-4 h-4" />
                                <span className="font-display italic uppercase tracking-tighter">إلغاء تماماً</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#020617] lg:hidden border-t border-white/5 shadow-2xl"
                    >
                        <nav className="flex flex-col p-6 gap-3">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onOpenInfoModal(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`text-right px-6 py-4 rounded-2xl text-base font-black transition-all ${
                                        item.highlight 
                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 italic font-display' 
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white font-spiritual'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                            {showActions && (
                                <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-3">
                                    <button onClick={onPrint} className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold border border-white/5">طباعة</button>
                                    <button onClick={onReset} className="flex-1 bg-rose-600/10 text-rose-400 py-4 rounded-2xl font-bold border border-rose-600/20">جديد</button>
                                </div>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
