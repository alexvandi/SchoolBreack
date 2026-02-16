import { createClient } from '@supabase/supabase-js';

// Helper to handle missing env vars during build
const getSupabaseCredentials = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // During build time on Netlify, these might be missing if not set in UI.
    // Return dummy values to allow build to pass, but runtime will fail if not set.
    if (!url || !key) {
        if (typeof window === 'undefined') {
            console.warn('Supabase credentials missing during build/SSR');
            return { url: 'https://placeholder.supabase.co', key: 'placeholder' };
        }
        throw new Error('Supabase credentials missing! Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    return { url, key };
};

const coords = getSupabaseCredentials();
export const supabase = createClient(coords.url, coords.key);
