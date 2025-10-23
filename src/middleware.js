import { createClient } from '@/lib/supabaseMiddlewareClient';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Create a Supabase client and response object
  const { supabase, response } = createClient(request);

  // Refresh session if expired - this is the crucial part
  await supabase.auth.getSession();

  // Return the response (which may have new cookies)
  return response;
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page)
     */
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
};
