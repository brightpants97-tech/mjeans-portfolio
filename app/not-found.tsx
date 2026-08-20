'use client';

const BG     = '#faf9f5';
const ACCENT = '#a3e635';
const TEXT   = '#121210';

export default function NotFound() {
  return (
    <div style={{
      background: BG, minHeight: '100vh', color: TEXT,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Paperlogy', -apple-system, sans-serif", padding: '24px', textAlign: 'center',
    }}>
      <svg width="64" height="64" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '28px' }}>
        <rect width="80" height="80" rx="18" fill="#121210" />
        <text x="40" y="57" textAnchor="middle" fontFamily="'Paperlogy','Arial Black',sans-serif" fontWeight="900" fontSize="48" fill="#a3e635">M</text>
      </svg>

      <p className="mono" style={{ fontSize: '0.8rem', fontWeight: 800, color: ACCENT, letterSpacing: '0.2em', marginBottom: '14px' }}>
        404
      </p>
      <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
        페이지를 찾을 수 없어요
      </h1>
      <p style={{ fontSize: '0.94rem', fontWeight: 500, color: 'rgba(18,18,16,0.55)', margin: '0 0 32px', maxWidth: '360px', lineHeight: 1.6 }}>
        주소가 잘못됐거나, 더 이상 존재하지 않는 페이지예요.
      </p>

      <a
        href="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '13px 26px', borderRadius: '999px',
          background: ACCENT, color: '#121210',
          fontSize: '0.92rem', fontWeight: 800, textDecoration: 'none',
        }}
      >
        홈으로 가기
      </a>
    </div>
  );
}
