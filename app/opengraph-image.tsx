import { ImageResponse } from 'next/og';

// tarjeta de previsualización (unfurl) de marca: amanecer + montañas + wordmark
export const alt = 'crescō · onboarding — bienvenido a tu equipo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#EFEAE0',
          backgroundImage:
            'linear-gradient(180deg,#E7E1D4 0%,#ECE6DA 30%,#F1ECE1 58%,#F5F0E7 80%,#F7F3EC 100%)',
        }}
      >
        {/* sol del amanecer */}
        <div
          style={{
            position: 'absolute',
            left: 706,
            top: 92,
            width: 320,
            height: 320,
            borderRadius: 9999,
            display: 'flex',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,252,242,0.97) 0%, rgba(243,229,193,0.82) 32%, rgba(214,188,128,0.42) 58%, rgba(126,154,128,0) 74%)',
          }}
        />

        {/* cordillera (las 4 capas de la marca) */}
        <svg
          width="1200"
          height="320"
          viewBox="0 0 1200 320"
          style={{ position: 'absolute', left: 0, bottom: 0 }}
        >
          <polygon fill="#C6CFBF" points="0,150 200,110 430,140 650,95 880,135 1080,100 1200,125 1200,320 0,320" />
          <polygon fill="#9DAD94" points="0,200 250,165 480,196 720,150 950,190 1200,165 1200,320 0,320" />
          <polygon fill="#647A66" points="0,246 300,210 560,250 820,205 1050,246 1200,226 1200,320 0,320" />
          <polygon fill="#3D5240" points="0,286 350,256 640,292 920,256 1200,282 1200,320 0,320" />
        </svg>

        {/* wordmark + copy */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 156,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 27, color: '#5C544A', letterSpacing: 1, marginBottom: 16 }}>
            bienvenido a tu equipo
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <div style={{ fontSize: 152, fontWeight: 600, color: '#1A1612', letterSpacing: -8 }}>crescō</div>
            <div style={{ fontSize: 152, fontWeight: 600, color: '#3D5240', letterSpacing: -8 }}>.</div>
          </div>
          <div style={{ fontSize: 26, color: '#3D5240', letterSpacing: 10, marginTop: 16 }}>ONBOARDING</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
