'use client'; // This MUST be the first line

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabaseClient'; // Import our client function

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // --- 1. UX IMPROVEMENT ---
    // Check if a user is already logged in on page load
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log('User already signed in, redirecting...');
        router.push('/dashboard');
      }
    };
    checkSession();
    // -------------------------

    // This listener is still perfect for handling the sign-in *event*
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          console.log('User just signed in, redirecting...');
          router.push('/dashboard');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // --- 2. UI IMPROVEMENT ---
  // We've wrapped the Auth component in a branded "card"
  return (
    <div className="flex justify-center m-4 md:m-0 items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Added App Branding */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            LighthouseTracker
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          // Use the 'light' theme to match our white card
          theme="light"
          // A nice UX touch to stack social buttons
          socialLayout="horizontal"
        />
      </div>
    </div>
  );
}
