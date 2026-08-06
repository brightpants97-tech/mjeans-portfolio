import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Myeongjin — Video Editor Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#faf9f5',
          padding: '90px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            borderRadius: '22px',
            background: '#121210',
            marginBottom: '48px',
          }}
        >
          <span style={{ color: '#a3e635', fontSize: '58px', fontWeight: 900 }}>M</span>
        </div>
        <div style={{ display: 'flex', fontSize: '84px', fontWeight: 900, color: '#121210', letterSpacing: '-2px', lineHeight: 1 }}>
          MYEONGJIN
        </div>
        <div style={{ display: 'flex', fontSize: '84px', fontWeight: 900, color: '#a3e635', letterSpacing: '-2px', lineHeight: 1, marginBottom: '36px' }}>
          PORTFOLIO
        </div>
        <div style={{ display: 'flex', fontSize: '32px', fontWeight: 500, color: 'rgba(18,18,16,0.55)' }}>
          Video Editor — 정확한 컷과 자연스러운 스토리 편집
        </div>
      </div>
    ),
    { ...size }
  );
}
