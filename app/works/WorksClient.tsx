'use client';
import { useState } from 'react';

const BG     = '#faf9f5';
const ACCENT = '#a3e635';
const TEXT   = '#121210';

const CATEGORIES = ['전체', '일상', '합방', '예능', '게임', '여행'] as const;
type Category = typeof CATEGORIES[number];

interface Work {
  id: string;
  category: Exclude<Category, '전체'>;
  title: string;
  channel: string;
  handle: string;
  href: string;
  thumbnail: string | null;
}

const PLACEHOLDER_WORKS: Work[] = [
  ...(['일상', '합방', '예능', '게임', '여행'] as const).flatMap((cat) =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `${cat}-${i}`,
      category: cat,
      title: '영상 제목',
      channel: '장지수',
      handle: '@jisoujang',
      href: '#',
      thumbnail: null,
    }))
  ),
];

function WorkCard({ work }: { work: Work }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={work.href}
      target={work.href !== '#' ? '_blank' : undefined}
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        borderRadius: '14px',
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(18,18,16,0.18)' : 'rgba(18,18,16,0.09)'}`,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.18s, border-color 0.18s',
        background: '#fff',
      }}
    >
      {/* 썸네일 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: '#121210',
          overflow: 'hidden',
        }}
      >
        {work.thumbnail ? (
          <img
            src={work.thumbnail}
            alt={work.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '8px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>영상 준비 중</span>
          </div>
        )}
        {/* 카테고리 뱃지 */}
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          fontSize: '0.68rem', fontWeight: 700,
          background: ACCENT, color: '#121210',
          padding: '3px 8px', borderRadius: '999px',
        }}>
          {work.category}
        </span>
      </div>

      {/* 정보 */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: '0.94rem', fontWeight: 700, color: TEXT, marginBottom: '6px', lineHeight: 1.35 }}>
          {work.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.78rem', color: 'rgba(18,18,16,0.45)', fontWeight: 500 }}>
            {work.channel} · {work.handle}
          </div>
          {work.href !== '#' && (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT }}>↗</span>
          )}
        </div>
      </div>
    </a>
  );
}

export default function WorksClient() {
  const [active, setActive] = useState<Category>('전체');

  const filtered = active === '전체'
    ? PLACEHOLDER_WORKS
    : PLACEHOLDER_WORKS.filter((w) => w.category === active);

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
            <a
              href="/"
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '7px 14px',
                borderRadius: '999px',
                color: TEXT,
                background: 'transparent',
                opacity: 0.55,
                transition: 'background 0.15s, opacity 0.15s, color 0.15s',
              }}
            >
              홈
            </a>
            <a
              href="/works"
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '7px 14px',
                borderRadius: '999px',
                color: '#121210',
                background: ACCENT,
                opacity: 1,
                transition: 'background 0.15s, opacity 0.15s, color 0.15s',
              }}
            >
              영상
            </a>
            <a
              href="/contact"
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '7px 14px',
                borderRadius: '999px',
                color: TEXT,
                background: 'transparent',
                opacity: 0.55,
                transition: 'background 0.15s, opacity 0.15s, color 0.15s',
              }}
            >
              문의
            </a>
          </nav>
        </div>
      </header>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}`}</style>

      <main style={{ maxWidth: '1040px', margin: '0 auto', padding: '52px clamp(1.2rem,4vw,2rem) 80px' }}>

        {/* 페이지 제목 */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(18,18,16,0.32)', letterSpacing: '0.2em', marginBottom: '10px' }}>
            RECENT WORKS
          </p>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>
            영상
          </h1>
        </div>

        {/* 카테고리 탭 */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          marginBottom: '36px',
          padding: '4px 0',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                padding: '8px 18px', borderRadius: '999px',
                border: active === cat ? 'none' : '1px solid rgba(18,18,16,0.12)',
                background: active === cat ? TEXT : 'transparent',
                color: active === cat ? BG : TEXT,
                fontSize: '0.84rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.14s',
                opacity: active === cat ? 1 : 0.55,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 영상 수 */}
        <p style={{ fontSize: '0.8rem', color: 'rgba(18,18,16,0.35)', fontWeight: 500, marginBottom: '24px' }}>
          {filtered.length}개의 영상
        </p>

        {/* 카드 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {filtered.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>

      </main>
    </div>
  );
}
