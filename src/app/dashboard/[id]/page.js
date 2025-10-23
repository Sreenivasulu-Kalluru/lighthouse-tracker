import { createClient } from '@/lib/supabaseServerClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuditButton from '@/components/AuditButton';
import AuditChart from '@/components/AuditChart';
import Link from 'next/link'; // <-- 1. ADD THIS IMPORT

export default async function ProjectDetailsPage({ params }) {
  // 1. Await the 'params' promise to resolve it
  const resolvedParams = await params;

  // 2. NOW, destructure the ID from the *resolved* object
  const { id: projectId } = resolvedParams;

  // 3. Fetch data
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 4. We keep this simple check just in case
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 5. Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('Project')
    .select('name, url')
    .eq('id', projectId) // 'projectId' is now correctly defined
    .single();

  // 6. Fetch audit history
  const { data: audits, error: auditError } = await supabase
    .from('Audit')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (projectError || auditError) {
    console.error(projectError || auditError);
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  // 7. Render just the page content
  return (
    <div className="w-full">
      {/* 2. ADD THIS LINK */}
      <Link
        href="/dashboard"
        className="text-blue-500 hover:underline mb-4 inline-block"
      >
        &larr; Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-lg text-gray-600 break-all">{project.url}</p>
        </div>
        <AuditButton projectId={projectId} />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Performance History</h2>
        {audits && audits.length > 0 ? (
          <AuditChart data={audits} />
        ) : (
          <p className="text-gray-500">
            No audit data yet. <b>Run New Audit</b>
          </p>
        )}
      </div>
    </div>
  );
}
