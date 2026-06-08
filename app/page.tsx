import { createClient } from '@/lib/supabase/server';
import { getTeamMember } from '@/lib/team';
import { getOnboardingTasks } from '@/lib/onboarding';
import { OnboardingHome } from './home/onboarding-home';

export const metadata = { title: 'crescō · onboarding' };

// el onboarding refleja Notion en vivo: nunca servir caché.
// fetchCache apaga el Data Cache de los fetch del SDK de Notion (force-dynamic solo no basta).
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function Home() {
  let name = 'crescō';
  let area: string | null = null;
  let pageId: string | null = null;
  let email: string | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    const member = user?.email ? await getTeamMember(user.email) : null;
    name =
      member?.name ??
      (user?.user_metadata?.name as string | undefined) ??
      (user?.user_metadata?.full_name as string | undefined) ??
      user?.email?.split('@')[0] ??
      'crescō';
    area = member?.area ?? null;
    pageId = member?.pageId ?? null;
  }

  const { tasks, error } = await getOnboardingTasks(pageId);

  return <OnboardingHome name={name} area={area} tasks={tasks} error={error} email={email} />;
}
