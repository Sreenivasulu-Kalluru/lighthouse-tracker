// This is a Server Component (no "use client")

import Link from 'next/link'; // <-- 1. Import Link

export default function ProjectList({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <p className="mt-8 text-gray-500">
        You haven&apos;t added any projects yet.
      </p>
    );
  }

  return (
    <div className="w-full max-w-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Projects</h2>
      <ul className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
        {projects.map((project) => (
          <li key={project.id}>
            {/* 2. Wrap the project info in a Link component */}
            <Link
              href={`/dashboard/${project.id}`}
              className="block p-4 hover:bg-gray-50"
            >
              <p className="font-semibold text-gray-900">{project.name}</p>
              <p className="text-sm text-gray-600">{project.url}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
