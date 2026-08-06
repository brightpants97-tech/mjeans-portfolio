'use client';
import { useEffect, useRef, useState } from 'react';
import worksData from '@/data/works.json';

const BG = '#faf9f5';
const ACCENT = '#a3e635';
const TOTAL_WORKS = worksData.length;

const CHAPTERS = [
  { id: 'intro', tc: '00:00', label: '홈' },
];

const CHANNELS = [
  {
    name: '장지수',
    handle: '@jisoujang',
    subs: '구독자 112만명',
    img: 'https://yt3.googleusercontent.com/UgUieH1W2YrPx6Py3zOe7z1WidNPSAgLzz6SoL-E_ousNOZCCbAYEoyp10SEaCbnJq64-J04xw=s900-c-k-c0x00ffffff-no-rj',
    href: 'https://www.youtube.com/@jisoujang',
  },
  {
    name: '장지수2',
    handle: '@jangjisou2',
    subs: '구독자 2.46천명',
    img: 'https://yt3.googleusercontent.com/vzkHa7IwvNlRqgKkO5cxUBrHo4br2s4nO1xInjhMp_95XRXpbelq6914ptpIQLap6seCbVx4=s900-c-k-c0x00ffffff-no-rj',
    href: 'https://www.youtube.com/@jangjisou2',
  },
];

const TOOLS = [
  { abbr: 'Pr', name: 'Premiere Pro', desc: '영상 편집', color: '#9468F2', bg: '#2a0a3e' },
  { abbr: 'Ps', name: 'Photoshop',    desc: '썸네일 제작', color: '#3FA9F5', bg: '#001a3e' },
  { abbr: 'Ai', name: 'Illustrator',  desc: '그래픽 작업', color: '#FF9A3D', bg: '#2d1a00' },
  { abbr: 'AI', name: 'AI',           desc: '생성형 AI 활용', color: '#a3e635', bg: '#16210a', icon: true },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in');
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Ruler() {
  // 타임라인 룰러: 5px 간격 눈금, 약한 강조 눈금, 플레이헤드 삼각형
  const ticks = Array.from({ length: 61 }, (_, i) => i);
  return (
    <svg viewBox="0 0 600 28" width="100%" height="28" preserveAspectRatio="none" style={{ display: 'block' }}>
      <line x1="0" y1="22" x2="600" y2="22" stroke="var(--border)" strokeWidth="1" />
      {ticks.map((i) => {
        const x = i * 10;
        const major = i % 10 === 0;
        const mid = i % 5 === 0;
        return (
          <line
            key={i}
            x1={x}
            y1={major ? 8 : mid ? 13 : 17}
            x2={x}
            y2="22"
            stroke={major ? 'var(--text-dim)' : 'var(--border-strong)'}
            strokeWidth="1"
          />
        );
      })}
      <polygon points="0,0 9,0 4.5,7" fill={ACCENT} />
    </svg>
  );
}

function ChapterTag({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
      <span
        className="mono"
        style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dimmer)', letterSpacing: '0.18em', textTransform: 'uppercase' }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState('intro');
  const clickLock = useRef<number | null>(null);

  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const ratios = new Map<string, number>();

    const obs = new IntersectionObserver(
      (entries) => {
        // 클릭으로 이동 중일 때는 스크롤 감지가 끼어들지 않도록 잠금
        if (clickLock.current !== null) return;

        entries.forEach((e) => {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        });

        // 현재 가장 많이 보이는(=화면 중앙에 가까운) 섹션 하나만 활성화
        let bestId: string | null = null;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestId && bestRatio > 0) setActive(bestId);
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setActive(id);
    if (clickLock.current) window.clearTimeout(clickLock.current);
    // 스크롤 애니메이션이 끝날 때까지 스크롤 기반 감지를 잠시 잠금
    clickLock.current = window.setTimeout(() => {
      clickLock.current = null;
    }, 1300);
  };

  const aboutRef = useReveal();
  const worksRef = useReveal();

  return (
    <div style={{ background: BG, minHeight: '100vh', color: 'var(--text)' }}>
      {/* 고정 헤더: 챕터 내비게이션 (유튜브 타임스탬프 형식) */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(250,249,245,0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '0 clamp(1.2rem,4vw,2rem)',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <a href="#intro" onClick={() => handleNavClick('intro')} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="18" fill="#121210"/>
              <text x="40" y="57" textAnchor="middle" fontFamily="'Paperlogy','Arial Black',sans-serif" fontWeight="900" fontSize="48" fill="#a3e635">M</text>
            </svg>
          </a>

          <nav style={{ display: 'flex', gap: 'clamp(4px,1.4vw,10px)', overflowX: 'auto' }}>
            {CHAPTERS.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                onClick={() => handleNavClick(c.id)}
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '7px 14px',
                  borderRadius: '999px',
                  color: active === c.id ? '#121210' : 'var(--text)',
                  background: active === c.id ? ACCENT : 'transparent',
                  opacity: active === c.id ? 1 : 0.55,
                  transition: 'background 0.15s, opacity 0.15s, color 0.15s',
                }}
              >
                {c.label}
              </a>
            ))}
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
                color: 'var(--text)',
                background: 'transparent',
                opacity: 0.55,
                transition: 'opacity 0.15s',
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
                color: 'var(--text)',
                background: 'transparent',
                opacity: 0.55,
                transition: 'opacity 0.15s',
              }}
            >
              문의
            </a>
          </nav>
        </div>
      </header>

      {/* INTRO / HERO */}
      <section
        id="intro"
        style={{
          scrollMarginTop: '56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '150px clamp(1.2rem,4vw,2rem) 70px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 60% at 18% 30%, rgba(163,230,53,0.1) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', position: 'relative' }}>
          <p className="mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dimmer)', letterSpacing: '0.22em', marginBottom: '22px' }}>
            VIDEO EDITOR
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.6rem,9vw,6rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 0.98,
              margin: '0 0 22px',
              color: 'var(--text)',
            }}
          >
            MYEONGJIN<br />
            <span style={{ color: ACCENT }}>PORTFOLIO</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2.4vw,1.3rem)', color: 'var(--text-dim)', fontWeight: 500, lineHeight: 1.6, maxWidth: '620px', margin: '0 0 32px' }}>
            다양한 콘텐츠를 중심으로 영상을 편집합니다.<br />
            정확한 컷과 자연스러운 스토리 전개의 편집을 지향합니다.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '46px' }}>
            <a
              href="/works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                minHeight: '48px',
                flex: '1 1 150px',
                boxSizing: 'border-box',
                borderRadius: '999px',
                background: ACCENT,
                color: '#121210',
                fontSize: '0.94rem',
                fontWeight: 800,
                textDecoration: 'none',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              영상 보기 ↗
            </a>
            <a
              href="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                minHeight: '48px',
                flex: '1 1 150px',
                boxSizing: 'border-box',
                borderRadius: '999px',
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                color: 'var(--text)',
                fontSize: '0.94rem',
                fontWeight: 800,
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
            >
              문의하기
            </a>
          </div>
          <Ruler />
        </div>
      </section>

      {/* WORKS */}
      <section id="works" style={{ scrollMarginTop: '56px', padding: '72px clamp(1.2rem,4vw,2rem)', borderTop: '1px solid var(--border)' }}>
        <div ref={worksRef} className="reveal" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <ChapterTag label="Channel" />
          <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 12px' }}>채널</h2>
          <p style={{ fontSize: '0.96rem', fontWeight: 500, color: 'var(--text-dim)', margin: '0 0 36px' }}>함께 작업한 채널입니다.</p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {CHANNELS.map((c) => (
                <a
                  key={c.handle}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '22px 18px',
                    background: '#fff',
                    border: '1px solid rgba(18,18,16,0.1)',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    width: '150px',
                    transition: 'border-color 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = ACCENT;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(18,18,16,0.1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <img
                    src={c.img}
                    alt={c.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{c.name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: 500 }}>{c.subs}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* 통계 카드 */}
            <div
              style={{
                flex: '1 1 260px',
                display: 'flex',
                gap: '0',
                background: '#fff',
                border: '1px solid rgba(18,18,16,0.1)',
                borderRadius: '14px',
                overflow: 'hidden',
              }}
            >
              {[
                { value: '2', label: '함께한 채널' },
                { value: `${TOTAL_WORKS}+`, label: '편집 영상' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    padding: '28px 16px',
                    textAlign: 'center',
                    borderLeft: i > 0 ? '1px solid rgba(18,18,16,0.08)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div className="mono" style={{ fontSize: '2.4rem', fontWeight: 900, color: ACCENT, lineHeight: 1, marginBottom: '10px', WebkitTextStroke: '0.6px rgba(18,18,16,0.5)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ scrollMarginTop: '56px', padding: '90px clamp(1.2rem,4vw,2rem) 120px', borderTop: '1px solid var(--border)' }}>
        <div ref={aboutRef} className="reveal" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <ChapterTag label="About" />
          <div>
            <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 20px' }}>사용툴</h2>

            {/* TOOLS 패널 */}
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border-strong)',
                borderRadius: '16px',
                padding: '20px 24px',
                maxWidth: '100%',
              }}
            >
              <p
                className="mono"
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--text-dimmer)',
                  letterSpacing: '0.2em',
                  margin: '0 0 16px',
                }}
              >
                TOOLS
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {TOOLS.map((t) => (
                  <div
                    key={t.abbr}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '10px',
                      padding: '20px 12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      className={t.icon ? undefined : 'mono'}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        background: t.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '1rem',
                        fontWeight: 900,
                        color: t.color,
                      }}
                    >
                      {t.icon ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2.5L13.8 8.2L19.5 10L13.8 11.8L12 17.5L10.2 11.8L4.5 10L10.2 8.2L12 2.5Z" fill={t.color} />
                          <path d="M19 2.5L19.7 4.7L22 5.5L19.7 6.3L19 8.5L18.3 6.3L16 5.5L18.3 4.7L19 2.5Z" fill={t.color} />
                        </svg>
                      ) : (
                        t.abbr
                      )}
                    </div>
                    <div style={{ minWidth: 0, width: '100%' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>{t.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dimmer)', marginTop: '4px' }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px clamp(1.2rem,4vw,2rem)' }}>
        <div className="mono" style={{ maxWidth: '960px', margin: '0 auto', fontSize: '0.74rem', color: 'var(--text-dimmer)' }}>
          © 2026 Myeongjin. 채널 콘텐츠의 저작권은 각 채널에 있습니다.
        </div>
      </footer>
    </div>
  );
}
