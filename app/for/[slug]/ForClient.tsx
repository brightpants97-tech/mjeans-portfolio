'use client';
import { useEffect } from 'react';

const BG     = '#faf9f5';
const ACCENT = '#a3e635';
const TEXT   = '#121210';

interface Resume {
  slug: string;
  company: string;
  role: string;
  body: string;
  published: boolean;
  createdAt: string;
  views: string[];
  photo: string | null;
}

export default function ForClient({ resume, isAdminViewer }: { resume: Resume; isAdminViewer: boolean }) {
  useEffect(() => {
    if (isAdminViewer) return;
    fetch(`/api/resumes/${resume.slug}/view`, { method: 'POST' }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "'Paperlogy', -apple-system, sans-serif" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <header className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,249,245,0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(18,18,16,0.08)',
      }}>
        <div style={{
          maxWidth: '760px', margin: '0 auto',
          padding: '0 clamp(1.2rem,4vw,2rem)',
          height: '56px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
        }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="홈으로">
            <svg width="32" height="32" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="18" fill="#121210"/>
              <text x="40" y="57" textAnchor="middle" fontFamily="'Paperlogy','Arial Black',sans-serif" fontWeight="900" fontSize="48" fill="#a3e635">M</text>
            </svg>
          </a>
          <button
            onClick={() => window.print()}
            style={{
              fontSize: '0.82rem', fontWeight: 700, color: TEXT,
              background: 'transparent', border: '1px solid rgba(18,18,16,0.15)',
              borderRadius: '999px', padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            인쇄 / PDF 저장
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '52px clamp(1.2rem,4vw,2rem) 100px' }}>
        {resume.photo && (
          <img
            src={resume.photo}
            alt={resume.company}
            style={{
              width: '84px', height: '84px', borderRadius: '50%',
              objectFit: 'cover', display: 'block', marginBottom: '24px',
              border: '1px solid rgba(18,18,16,0.1)',
            }}
          />
        )}
        <h1 style={{ fontSize: 'clamp(1.8rem,4.5vw,2.4rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 36px' }}>
          자기소개서
        </h1>
        <div style={{
          whiteSpace: 'pre-wrap',
          fontSize: '1.02rem',
          lineHeight: 1.85,
          color: 'rgba(18,18,16,0.85)',
        }}>
          {resume.body}
        </div>

        <div className="no-print" style={{ marginTop: '56px', paddingTop: '28px', borderTop: '1px solid rgba(18,18,16,0.1)' }}>
          <a href="/works" style={{ fontSize: '0.88rem', fontWeight: 700, color: ACCENT, textDecoration: 'none' }}>
            편집 영상 포트폴리오 보러가기 →
          </a>
        </div>
      </main>
    </div>
  );
}
