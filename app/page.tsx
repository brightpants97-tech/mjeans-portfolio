'use client';
import { useEffect, useRef, useState } from 'react';

const BG = '#faf9f5';
const ACCENT = '#a3e635';

const CHAPTERS = [
  { id: 'intro', tc: '00:00', label: '인트로' },
  { id: 'about', tc: '00:08', label: '소개' },
  { id: 'works', tc: '00:21', label: '작업물' },
  { id: 'contact', tc: '00:34', label: '연락처' },
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
  const contactRef = useReveal();

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
          <a href="#intro" onClick={() => handleNavClick('intro')} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--rec)', animation: 'blink 1.8s ease-in-out infinite', flexShrink: 0 }} />
            <span className="mono" style={{ fontWeight: 700, fontSize: '0.84rem', letterSpacing: '0.04em', color: 'var(--text)' }}>MJ</span>
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
              최근 작업물
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
          <p style={{ fontSize: 'clamp(1rem,2.4vw,1.3rem)', color: 'var(--text-dim)', fontWeight: 500, lineHeight: 1.6, maxWidth: '620px', margin: '0 0 46px' }}>
            개인방송, 합방, 예능, 게임, 여행 등 다양한 콘텐츠를 중심으로 영상을 편집합니다.
            정확한 컷과 자연스러운 스토리 전개의 편집을 지향합니다.
          </p>
          <Ruler />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ scrollMarginTop: '56px', padding: '72px clamp(1.2rem,4vw,2rem)', borderTop: '1px solid var(--border)' }}>
        <div ref={aboutRef} className="reveal" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <ChapterTag label="About" />
          <div>
            <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 20px' }}>사용툴</h2>

            {/* TOOLS 패널 */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                padding: '20px 24px',
                maxWidth: '400px',
              }}
            >
              <p
                className="mono"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--card-text-dimmer)',
                  letterSpacing: '0.18em',
                  margin: '0 0 16px',
                }}
              >
                TOOLS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {TOOLS.map((t, i) => (
                  <div
                    key={t.abbr}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 0',
                      borderBottom: i < TOOLS.length - 1 ? '1px solid var(--card-border)' : 'none',
                    }}
                  >
                    <div
                      className="mono"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        background: t.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: t.color,
                      }}
                    >
                      {t.abbr}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--card-text)', lineHeight: 1.2 }}>{t.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--card-text-dimmer)', marginTop: '3px' }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKS */}
      <section id="works" style={{ scrollMarginTop: '56px', padding: '90px clamp(1.2rem,4vw,2rem)', borderTop: '1px solid var(--border)' }}>
        <div ref={worksRef} className="reveal" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <ChapterTag label="Works" />
          <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 12px' }}>작업물</h2>
          <p style={{ fontSize: '0.96rem', fontWeight: 500, color: 'var(--text-dim)', margin: '0 0 36px' }}>함께 작업한 채널입니다.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {CHANNELS.map((c) => (
              <a
                key={c.handle}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  background: 'var(--surface)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '16px',
                  padding: '28px 26px',
                  transition: 'border-color 0.18s, transform 0.18s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-strong)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'relative', width: '72px', height: '72px', marginBottom: '20px' }}>
                  {/* 뷰파인더 프레임 코너 */}
                  <span style={{ position: 'absolute', top: -6, left: -6, width: '14px', height: '14px', borderTop: `2px solid ${ACCENT}`, borderLeft: `2px solid ${ACCENT}` }} />
                  <span style={{ position: 'absolute', bottom: -6, right: -6, width: '14px', height: '14px', borderBottom: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}` }} />
                  <img
                    src={c.img}
                    alt={c.name}
                    style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--card-text)', marginBottom: '4px' }}>{c.name}</div>
                <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--card-text-dimmer)', marginBottom: '14px' }}>{c.handle}</div>
                <div className="mono" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--card-text)', marginBottom: '18px' }}>{c.subs}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--card-text)' }}>
                  유튜브에서 보기
                  <span style={{ fontSize: '0.9rem' }}>↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ scrollMarginTop: '56px', padding: '90px clamp(1.2rem,4vw,2rem) 120px', borderTop: '1px solid var(--border)' }}>
        <div ref={contactRef} className="reveal" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <ChapterTag label="Contact" />
          <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 16px' }}>연락처</h2>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)', margin: '0 0 32px' }}>작업하길 원하신다면 언제든 메일 주세요.</p>
          <a
            href="mailto:brightpants97@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px 26px',
              background: ACCENT,
              color: '#121210',
              borderRadius: '11px',
              fontWeight: 700,
              fontSize: '0.96rem',
              textDecoration: 'none',
            }}
            className="mono"
          >
            brightpants97@gmail.com
            <span>↗</span>
          </a>
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
