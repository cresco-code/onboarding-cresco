import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectExperience } from '@/components/project-experience';
import { mogosProject } from '@/lib/mogos';
import { mogosProjectEn } from '@/lib/i18n/mogos-en';
import { isCrescoDomain } from '@/lib/team';

export const metadata = { title: 'crescō · onboarding · mogos' };

export const dynamic = 'force-dynamic';

export default async function MogosPage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');
    // arquitectura interna real de un cliente: nunca se relaja con NEXT_PUBLIC_DEMO_MODE
    if (!isCrescoDomain(user.email ?? '')) redirect('/no-access');
  }

  return <ProjectExperience data={mogosProject} dataEn={mogosProjectEn} />;
}
