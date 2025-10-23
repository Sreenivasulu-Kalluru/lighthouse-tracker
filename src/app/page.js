import { createClient } from '@/lib/supabaseServerClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// This is an async Server Component
export default async function RootPage() {
  // 1. Get the cookie store and create a server client
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Check if a user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Redirect based on user session
  if (user) {
    // User is logged in, send them to their dashboard
    redirect('/dashboard');
  } else {
    // User is not logged in, send them to the login page
    redirect('/login');
  }

  // This part will never be reached, but it's good practice
  return null;
}
