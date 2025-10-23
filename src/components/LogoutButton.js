'use client'; // This MUST be the first line

import { useState } from 'react'; // 1. Import useState
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  // 2. Add loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true); // Disable the button

    try {
      // 3. Ask Supabase to sign the user out
      await supabase.auth.signOut();

      // 4. Send the user back to the login page
      // router.refresh() isn't needed here as push() will force a reload
      router.push('/login');

      // No need to set isLoading(false) here,
      // as the component will be unmounted upon redirect.
    } catch (error) {
      console.error('Logout failed:', error);
      // If the logout fails, re-enable the button
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading} // 5. Disable button when loading
      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* 6. Change text based on loading state */}
      {isLoading ? 'Logging out...' : 'Log Out'}
    </button>
  );
}
