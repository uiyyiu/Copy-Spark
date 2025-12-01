
import { createClient } from '@supabase/supabase-js';

// Supabase configuration from your provided details
const SUPABASE_URL = 'https://yjixuahulcijxrixhfgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaXh1YWh1bGNpanhyaXhoZmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTE4MTksImV4cCI6MjA3OTk4NzgxOX0.ml2OH5tucmmATVhS3-4gnfKIkI3U7hQb33qpn3PaP4w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const signInWithGoogle = async () => {
    try {
        // Get the current origin (e.g., https://spark-ministry.vercel.app)
        const redirectUrl = window.location.origin;
        
        console.log(`Attempting Google Sign-In. Redirect URL set to: ${redirectUrl}`);
        console.log(`Make sure '${redirectUrl}' is added to Supabase > Auth > URL Configuration > Redirect URLs`);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl, 
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

// Save a lesson to the 'saved_lessons' table in Supabase
export const saveLessonToLibrary = async (userId: string, title: string, content: any) => {
    const { data, error } = await supabase
        .from('saved_lessons')
        .insert([
            { 
                user_id: userId, 
                title: title, 
                content: content 
            }
        ]);
    
    if (error) throw error;
    return data;
};

// Fetch saved lessons for a user
export const getSavedLessons = async (userId: string) => {
    const { data, error } = await supabase
        .from('saved_lessons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
    if (error) throw error;
    return data;
};

// Delete a saved lesson
export const deleteSavedLesson = async (id: string) => {
    const { error } = await supabase
        .from('saved_lessons')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
};

// --- Patristic Chat Functions ---

export const createPatristicChat = async (userId: string, title: string, messages: any[]) => {
    const { data, error } = await supabase
        .from('patristic_chats')
        .insert([
            { user_id: userId, title, messages }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updatePatristicChat = async (chatId: string, messages: any[]) => {
    const { data, error } = await supabase
        .from('patristic_chats')
        .update({ messages, updated_at: new Date() })
        .eq('id', chatId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getPatristicChats = async (userId: string) => {
    const { data, error } = await supabase
        .from('patristic_chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const deletePatristicChat = async (chatId: string) => {
    const { error } = await supabase
        .from('patristic_chats')
        .delete()
        .eq('id', chatId);

    if (error) throw error;
};
