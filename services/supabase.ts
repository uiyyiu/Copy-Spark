
import { createClient } from '@supabase/supabase-js';

// Supabase configuration from your provided details
const SUPABASE_URL = 'https://yjixuahulcijxrixhfgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaXh1YWh1bGNpanhyaXhoZmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTE4MTksImV4cCI6MjA3OTk4NzgxOX0.ml2OH5tucmmATVhS3-4gnfKIkI3U7hQb33qpn3PaP4w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        return { data, error: null };
    } catch (error) {
        console.error("Error signing in with Google:", error);
        return { data: null, error };
    }
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
