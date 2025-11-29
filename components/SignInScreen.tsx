
import React, { useState } from 'react';
import { signInWithGoogle } from '../services/supabase';

const SignInScreen: React.FC = () => {
    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        setAuthError(null);
        try {
            await signInWithGoogle();
            // Note: Supabase will redirect the page, so we don't need to manually navigate usually.
        } catch (error: any) {
            console.error("Authentication error:", error);
            setAuthError(error.message || "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-amber-500/10 via-transparent to-transparent blur-3xl pointer-events-none"></div>
            
            <div className="max-w-md w-full relative z-10">
                <h1 className="mb-6 text-6xl font-bold tracking-widest font-['Playfair_Display'] animate-spark-flash text-white select-none drop-shadow-lg">SPARK</h1>
                
                <p className="spark-body text-slate-300 mb-8 text-lg font-light leading-relaxed">
                    مساعدك الشخصي الذكي في تحضير دروس مدارس الأحد.
                    <br />
                    <span className="text-sm opacity-70">من فضلك سجل الدخول للمتابعة</span>
                </p>
                
                {authError && (
                    <div className="my-6 p-4 bg-red-900/30 border border-red-500/30 text-red-200 rounded-xl text-right backdrop-blur-sm" role="alert">
                        <h3 className="spark-caption font-bold mb-1">!تنبيه</h3>
                        <p className="text-xs">{authError}</p>
                    </div>
                )}

                <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-white text-slate-900 font-bold py-3.5 px-8 rounded-xl hover:bg-slate-100 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></span>
                    ) : (
                        <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.8 0 265.8c0-13.2 1-26.4 2.8-39.3h241.2v-77.3H12.5C50.5 52.8 138.8 0 244 0c111.4 0 203.8 61.5 236.4 149.3-16.1 24.5-30 52.8-38.3 83.3h-198.1v77.3h241.2c-1.6 13.2-2.8 26.4-2.8 39.3z"></path>
                        </svg>
                    )}
                    <span className="spark-body font-bold">تسجيل الدخول باستخدام Google</span>
                </button>
            </div>
             <footer className="absolute bottom-6 text-slate-500 text-xs tracking-widest uppercase font-semibold">
                Produced by Mark George
            </footer>
        </div>
    );
};

export default SignInScreen;
