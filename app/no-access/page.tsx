import Link from 'next/link';

export const metadata = { title: 'crescō · sin acceso' };

export default function NoAccessPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: '0 7vw',
        background: 'linear-gradient(180deg,#E7E1D4,#F5F0E7)',
        color: '#1A1612',
      }}
    >
      <div style={{ maxWidth: 460 }}>
        <div style={{ fontWeight: 500, fontSize: 30, letterSpacing: '-.035em' }}>
          cresc&#333;<span style={{ color: '#3D5240' }}>.</span>
        </div>
        <h1 style={{ fontWeight: 500, fontSize: 26, letterSpacing: '-.03em', marginTop: 28, lineHeight: 1.15 }}>
          Este espacio es solo para el equipo.
        </h1>
        <p style={{ fontWeight: 300, fontSize: 15, color: '#5C544A', marginTop: 14, lineHeight: 1.6 }}>
          Tu cuenta no está en la base del equipo de crescō. Si crees que es un error, escríbele a quien te invitó.
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block', marginTop: 30, background: '#1A1612', color: '#EFEAE0',
            borderRadius: 100, padding: '13px 28px', fontSize: 14.5, fontWeight: 500, textDecoration: 'none',
          }}
        >
          Volver
        </Link>
      </div>
    </main>
  );
}
