import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServerClient';
import { cookies } from 'next/headers';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

export default async function DashboardLayout({ children }) {
  // 1. Auth check (no change)
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. This is our polished app shell
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Header (Your style, with one new nav link) */}
      <header className="sticky top-0 z-50 w-full shadow-lg bg-white">
        <div className="container flex h-16 items-center max-w-6xl mx-auto px-4">
          <Link href="/dashboard" className="text-xl font-bold mr-6">
            LighthouseTracker
          </Link>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <span className="text-sm font-medium text-gray-600 hidden md:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Page Content (no change) */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {children} {/* <-- Your pages will be rendered here */}
      </main>

      {/* --- 2. IMPROVEMENT: Added Footer --- */}
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} LighthouseTracker.</p>
      </footer>
    </div>
  );
}
