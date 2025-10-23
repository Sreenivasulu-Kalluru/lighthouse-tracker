'use client'; // This MUST be the first line

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; // Import our BROWSER client

export default function AddProjectForm() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  // --- UX Improvements ---
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', isError: false });

    if (!name || !url) {
      setMessage({ text: 'Please fill in both fields.', isError: true });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Get the currently logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({
          text: 'User not found. Please log in again.',
          isError: true,
        });
        setIsLoading(false);
        return;
      }

      // 2. Insert the new project into the 'Project' table
      const { error } = await supabase.from('Project').insert({
        name: name,
        url: url,
        user_id: user.id, // Link the project to the user
      });

      if (error) {
        throw error;
      }

      // 3. Success!
      setMessage({ text: 'Project added successfully!', isError: false });
      setName('');
      setUrl('');
      router.refresh(); // Refresh the server components
    } catch (error) {
      // 4. Failure
      setMessage({ text: `Error: ${error.message}`, isError: true });
    } finally {
      // 5. Always re-enable the button
      setIsLoading(false);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage({ text: '', isError: false }), 5000);
    }
  };

  return (
    // --- Restored your original container style ---
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg p-6 bg-white rounded-lg shadow-md mt-8"
    >
      <h2 className="text-2xl font-bold mb-5 text-gray-800">Add New Project</h2>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Project Name
        </label>
        {/* --- Restored your original input style --- */}
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Portfolio"
          className="shadow-sm appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="url"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Project URL
        </label>
        {/* --- Restored your original input style --- */}
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="shadow-sm appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isLoading}
          // --- Restored your button colors + added disabled styles ---
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding...' : 'Add Project'}
        </button>

        {/* --- Kept the improved feedback message --- */}
        {message.text && (
          <p
            className={`text-sm ml-4 ${
              message.isError ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
