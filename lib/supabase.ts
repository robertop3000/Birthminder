import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (__DEV__) console.warn('Supabase credentials missing — check .env or EAS secrets');
}

function createSupabaseClient(): SupabaseClient {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (e) {
    if (__DEV__) console.error('Failed to create Supabase client:', e);
    // Return a client with empty strings — auth calls will fail gracefully
    // instead of crashing the native bridge on startup
    return createClient('https://placeholder.supabase.co', 'placeholder', {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
}

export const supabase = createSupabaseClient();
