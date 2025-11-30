import React, { useState } from 'react';
import { signInWithGoogle } from '../services/supabase';
import { track } from '@vercel/analytics';

const SignInScreen: React.FC = () => {
    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setAuthError(null);
        setIsLoading(true);
        
        try {
            const { error } = await signInWithGoogle();
            
            if (error) {
                console.error("Authentication error:", error);
                // Safe cast to access message, fallback if not present
                setAuthError((error as any).message || "فشل تسجيل الدخول");
            } else {
                // Tracking handled by session state change in App.tsx generally, 
                // but can be triggered here if needed.
                track('User Clicked Login');
            }
        } catch (err) {
            setAuthError("حدث خطأ غير متوقع.");
        } finally {
            // Note: If redirect happens fast, this might not render, which is fine.
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-light)] p-4 text-center">
            <div className="max-w-md w-full">
                <h1 className="mb-6 text-6xl font-bold tracking-widest font-['Playfair_Display'] animate-spark-flash text-white select-none">SPARK</h1>
                <p className="spark-body text-[var(--text-light-secondary)] mb-8">
                    مساعدك الشخصي في تحضير دروس مدارس الأحد.
                    <br />
                    من فضلك سجل الدخول بحساب Google للمتابعة.
                </p>
                
                {authError && (
                    <div className="my-6 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600/50 text-yellow-800 dark:text-yellow-200 rounded-lg text-right" role="alert">
                        <h3 className="spark-h3 font-bold mb-2">!خطأ في تسجيل الدخول</h3>
                        <p className="spark-caption whitespace-pre-wrap">{authError}</p>
                    </div>
                )}

                <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-8 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300 transform hover:scale-[1.03] shadow-sm disabled:bg-slate-200 dark:disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.8 0 265.8c0-13.2 1-26.4 2.8-39.3h241.2v-77.3H12.5C50.5 52.8 138.8 0 244 0c111.4 0 203.8 61.5 236.4 149.3-16.1 24.5-30 52.8-38.3 83.3h-198.1v77.3h241.2c-1.6 13.2-2.8 26.4-2.8 39.3z"></path>
                        </svg>
                    )}
                    <span className="spark-body font-semibold">
                        {isLoading ? 'جاري التحويل...' : 'تسجيل الدخول باستخدام Google'}
                    </span>
                </button>
            </div>
             <footer className="absolute bottom-6 text-slate-500 dark:text-slate-400 text-sm">
                Produced by Mark George
            </footer>
        </div>
    );
};

export default SignInScreen;