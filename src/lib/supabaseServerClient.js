import { createServerClient } from '@supabase/ssr';
// We do not import 'cookies' here

// This client now only needs the 'get' method
export const createClient = (cookieStore) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        // We no longer need 'set' or 'remove'
        // because the middleware handles session refreshing.
      },
    }
  );
};
