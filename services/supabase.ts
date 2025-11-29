
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent runtime crashes
// if import.meta.env is undefined
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are missing. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Create client with fallback empty strings to prevent immediate crash,
// though requests will fail if keys are missing.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
);

export const signInWithGoogle = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin, // Redirect back to the app after login
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
