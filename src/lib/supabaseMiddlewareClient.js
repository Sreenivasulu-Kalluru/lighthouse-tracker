import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export const createClient = (request) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // If the cookie is set, update the request and response
          request.cookies.set(name, value, options);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set(name, value, options);
        },
        remove(name, options) {
          // If the cookie is removed, update the request and response
          request.cookies.delete(name, options);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete(name, options);
        },
      },
    }
  );

  return { supabase, response };
};
