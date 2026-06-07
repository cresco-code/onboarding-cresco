import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, maxAge: SESSION_MAX_AGE_SECONDS }),
            );
          } catch {
            /* Server Component — noop; el middleware refresca las cookies */
          }
        },
      },
    },
  );
}
