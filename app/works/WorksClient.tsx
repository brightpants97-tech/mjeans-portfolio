'use client';
import { useEffect, useState } from 'react';
import worksData from '@/data/works.json';

const BG     = '#faf9f5';
const ACCENT = '#a3e635';
const CATEGORY_COLORS: Record<string, string> = {
  일상: '#a3e635',
  합방: '#E65535',
  여행: '#7BD599',
};
const CATEGORY_TEXT_COLORS: Record<string, string> = {
  일상: '#121210',
  합방: '#ffffff',
  여행: '#121210',
};
const TEXT   = '#121210';

const CATEGORIES = ['최근영상', '일상', '합방', '여행'] as const;
type Category = typeof CATEGORIES[number];
type WorkCategory = Exclude<Category, '최근영상'>;

interface Work {
  id: string;
  category: WorkCategory;
  title: string;
  channel: string;
  handle: string;
  href: string;
  thumbnail: string | null;
  publishedAt: string;
}

const PLACEHOLDER_WORKS: Work[] = worksData as Work[];


function fmtDate(iso: string) {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

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
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.35s ease',
            }}
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
        {/* 뱃지 시인성을 위한 상단 그라데이션 */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 30%)',
        }} />
        {/* 카테고리 뱃지 */}
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          fontSize: '0.68rem', fontWeight: 700,
          background: CATEGORY_COLORS[work.category] || ACCENT, color: CATEGORY_TEXT_COLORS[work.category] || '#121210',
          padding: '3px 8px', borderRadius: '999px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(18,18,16,0.38)' }}>
              {fmtDate(work.publishedAt)}
            </span>
            {work.href !== '#' && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT }}>↗</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function WorksClient() {
  const [active, setActive] = useState<Category>('최근영상');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const filtered = active === '최근영상'
    ? [...PLACEHOLDER_WORKS]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 9)
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

      <main className={`reveal${revealed ? ' in' : ''}`} style={{ maxWidth: '1040px', margin: '0 auto', padding: '52px clamp(1.2rem,4vw,2rem) 80px' }}>

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
                boxSizing: 'border-box',
                padding: '8px 18px', borderRadius: '999px',
                border: active === cat ? '1px solid transparent' : '1px solid rgba(18,18,16,0.12)',
                background: active === cat ? TEXT : 'transparent',
                color: active === cat ? BG : TEXT,
                fontSize: '0.84rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.14s, color 0.14s, border-color 0.14s, opacity 0.14s',
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
