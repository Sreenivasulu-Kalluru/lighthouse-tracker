'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditButton({ projectId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    setMessage('Running audit... this may take up to a minute.');

    try {
      // 1. Call our new API endpoint
      const response = await fetch(`/api/audit/${projectId}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to run audit');
      }

      // 2. If successful, refresh the page data
      // This tells Next.js to re-fetch the server component
      // data (our audits) and re-render the chart.
      router.refresh();
      setMessage('Audit complete! Data updated.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      // Clear the message after a few seconds
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Running...' : 'Run New Audit'}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
