'use client';
import { useEffect, useState } from 'react';

const BG     = '#faf9f5';
const ACCENT = '#a3e635';
const TEXT   = '#121210';

const NAV_ITEMS = [
  { label: '홈', href: '/' },
  { label: '영상', href: '/works' },
  { label: '문의', href: '/contact' },
];

export default function ContactClient() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "'Paperlogy', -apple-system, sans-serif" }}>

      {/* 헤더 */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,249,245,0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(18,18,16,0.08)',
      }}>
        <div style={{
          maxWidth: '1040px', margin: '0 auto',
          padding: '0 clamp(1.2rem,4vw,2rem)',
          height: '56px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
        }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }} title="홈으로">
            <svg width="32" height="32" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="18" fill="#121210"/>
              <text x="40" y="57" textAnchor="middle" fontFamily="'Paperlogy','Arial Black',sans-serif" fontWeight="900" fontSize="48" fill="#a3e635">M</text>
            </svg>
          </a>

          <nav style={{ display: 'flex', gap: 'clamp(4px,1.4vw,10px)' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/contact';
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '7px 14px',
                    borderRadius: '999px',
                    color: isActive ? '#121210' : TEXT,
                    background: isActive ? ACCENT : 'transparent',
                    opacity: isActive ? 1 : 0.55,
                    transition: 'background 0.15s, opacity 0.15s, color 0.15s',
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <main className={`reveal${revealed ? ' in' : ''}`} style={{ maxWidth: '760px', margin: '0 auto', padding: '52px clamp(1.2rem,4vw,2rem) 100px' }}>

        {/* 페이지 제목 */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(18,18,16,0.32)', letterSpacing: '0.2em', marginBottom: '10px' }}>
            GET IN TOUCH
          </p>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1 }}>
            문의
          </h1>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(18,18,16,0.55)', margin: 0 }}>
            작업하길 원하신다면 언제든 편하게 연락 주세요.
          </p>
        </div>

        {/* 문의 카드 */}
        {/* 카카오톡 오픈채팅 CTA */}
        <a
          href="https://open.kakao.com/o/sFNT3pDi"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '26px 28px',
            marginBottom: '16px',
            borderRadius: '16px',
            background: ACCENT,
            color: '#121210',
            textDecoration: 'none',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 24px rgba(163,230,53,0.35)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: '#121210', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.87 5.37 4.68 6.78-.15.53-.98 3.4-1 3.62 0 0-.02.17.09.24.11.07.24.02.24.02.31-.04 3.6-2.38 4.16-2.78.6.08 1.22.12 1.83.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" fill="#FEE500"/>
              </svg>
            </div>
            <div>
              <p className="mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(18,18,16,0.55)', letterSpacing: '0.16em', margin: '0 0 4px' }}>
                가장 빠른 답장
              </p>
              <p style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0 }}>
                카카오톡 오픈채팅으로 문의하기
              </p>
            </div>
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, flexShrink: 0 }}>↗</span>
        </a>

        <div
          style={{
            background: '#fff',
            border: '1px solid rgba(18,18,16,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* 이메일 */}
          <a
            href="mailto:brightpants97@gmail.com"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '22px 24px',
              textDecoration: 'none',
              color: TEXT,
              borderBottom: '1px solid rgba(18,18,16,0.08)',
              transition: 'background 0.15s',
            }}
          >
            <div>
              <p className="mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(18,18,16,0.38)', letterSpacing: '0.16em', margin: '0 0 6px' }}>
                EMAIL
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                brightpants97@gmail.com
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.4, flexShrink: 0 }}>↗</span>
          </a>

          {/* 소통 가능 시간 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '22px 24px',
            }}
          >
            <div>
              <p className="mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(18,18,16,0.38)', letterSpacing: '0.16em', margin: '0 0 6px' }}>
                AVAILABLE HOURS
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                00:00 ~ 24:00
              </p>
              <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(18,18,16,0.45)', margin: '4px 0 0' }}>
                수면 시간 제외 언제든 소통 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(18,18,16,0.08)', padding: '24px clamp(1.2rem,4vw,2rem)' }}>
        <div className="mono" style={{ maxWidth: '1040px', margin: '0 auto', fontSize: '0.74rem', color: 'rgba(18,18,16,0.32)' }}>
          © 2026 Myeongjin. 채널 콘텐츠의 저작권은 각 채널에 있습니다.
        </div>
      </footer>
    </div>
  );
}
