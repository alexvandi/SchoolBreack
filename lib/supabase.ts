import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (_supabase) return _supabase;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        // During SSR/build, return a dummy client that won't actually be used
        // because all our pages are "use client" and only call supabase in useEffect/handlers
        console.warn('Supabase env vars missing - using placeholder for build');
        _supabase = createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder');
        return _supabase;
    }

    _supabase = createClient(url, key);
    return _supabase;
}

// Export as a getter that lazily creates the client
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabase();
        const value = (client as any)[prop];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});
