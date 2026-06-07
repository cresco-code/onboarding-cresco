import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectExperience } from '@/components/project-experience';
import { mogosProject } from '@/lib/mogos';

export const metadata = { title: 'crescō · onboarding · mogos' };

export const dynamic = 'force-dynamic';

export default async function MogosPage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');
  }

  return <ProjectExperience data={mogosProject} />;
}
