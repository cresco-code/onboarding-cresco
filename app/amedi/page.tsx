import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectExperience } from '@/components/project-experience';
import { amediProject } from '@/lib/amedi';
import { amediProjectEn } from '@/lib/i18n/amedi-en';
import { isCrescoDomain } from '@/lib/team';

export const metadata = { title: 'crescō · onboarding · amedi' };

export const dynamic = 'force-dynamic';

export default async function AmediPage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');
    // arquitectura interna real de un cliente: nunca se relaja con NEXT_PUBLIC_DEMO_MODE
    if (!isCrescoDomain(user.email ?? '')) redirect('/no-access');
  }

  return <ProjectExperience data={amediProject} dataEn={amediProjectEn} />;
}
