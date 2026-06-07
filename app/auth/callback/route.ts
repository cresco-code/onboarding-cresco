import { createClient } from '@/lib/supabase/server';
import { isAllowed } from '@/lib/team';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // tras el login, lleva a la bienvenida (3 diapositivas); deep-links conservan su destino
  const nextParam = searchParams.get('next');
  const next = !nextParam || nextParam === '/' ? '/bienvenida' : nextParam;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // gate: solo cuentas del workspace de crescō (@cresco.so)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email ?? '';
      if (isAllowed(email)) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/no-access`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=callback`);
}
