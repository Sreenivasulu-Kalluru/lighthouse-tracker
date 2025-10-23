import { createClient } from '@/lib/supabaseServerClient';
import { cookies } from 'next/headers';
import AddProjectForm from '@/components/AddProjectForm';
import ProjectList from '@/components/ProjectList';

export default async function DashboardPage() {
  // The layout is already handling the auth check!

  // We just need to fetch the data for *this* page
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: projects, error } = await supabase.from('Project').select('*');

  return (
    <div className="flex flex-col items-center">
      {/* The header, user email, and logout button are
        all in layout.js now, so we can remove them from here!
      */}
      <AddProjectForm />
      <ProjectList projects={projects || []} />
    </div>
  );
}
