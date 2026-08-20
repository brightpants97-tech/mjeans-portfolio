'use client';
import { useEffect } from 'react';

const BG     = '#faf9f5';
const ACCENT = '#a3e635';
const TEXT   = '#121210';

interface EducationItem {
  school: string;
  major: string;
  period: string;
  status: string;
}

interface CareerItem {
  company: string;
  position: string;
  period: string;
  description: string;
}

interface ResumeInfo {
  name: string;
  address: string;
  phone: string;
  birthDate: string;
  email: string;
  military: {
    status: string;
    branch: string;
    rank: string;
    specialty: string;
    period: string;
  };
  education: EducationItem[];
  career: CareerItem[];
}

interface Resume {
  slug: string;
  company: string;
  role: string;
  body: string;
  published: boolean;
  createdAt: string;
  views: string[];
  photo: string | null;
  resumeInfo: ResumeInfo | null;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(18,18,16,0.4)', letterSpacing: '0.04em', marginBottom: '5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'rgba(18,18,16,0.92)', lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
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
              width: '140px', height: '140px', borderRadius: '16px',
              objectFit: 'cover', display: 'block', marginBottom: '28px',
              border: '1px solid rgba(18,18,16,0.1)',
            }}
          />
        )}
        <h1 style={{ fontSize: 'clamp(1.8rem,4.5vw,2.4rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 36px' }}>
          자기소개서
        </h1>

        {resume.resumeInfo && (
          <div style={{ marginBottom: '48px' }}>
            <p className="mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: 'rgba(18,18,16,0.4)', letterSpacing: '0.16em', marginBottom: '14px' }}>
              이력서
            </p>

            <div style={{ background: '#fff', border: '1px solid rgba(18,18,16,0.1)', borderRadius: '14px', padding: '22px 24px', marginBottom: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '18px 20px' }}>
                <Field label="이름" value={resume.resumeInfo.name} />
                <Field label="생년월일" value={resume.resumeInfo.birthDate} />
                <Field label="휴대전화" value={resume.resumeInfo.phone} />
                <Field label="이메일" value={resume.resumeInfo.email} />
              </div>
              {resume.resumeInfo.address && (
                <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid rgba(18,18,16,0.07)' }}>
                  <Field label="주소" value={resume.resumeInfo.address} />
                </div>
              )}
              {resume.resumeInfo.military?.status && (
                <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid rgba(18,18,16,0.07)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(18,18,16,0.4)', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    병역
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      resume.resumeInfo.military.status,
                      resume.resumeInfo.military.branch,
                      resume.resumeInfo.military.rank,
                      resume.resumeInfo.military.specialty,
                      resume.resumeInfo.military.period,
                    ].filter(Boolean).map((v, i) => (
                      <span key={i} style={{
                        fontSize: '0.86rem', fontWeight: 600, color: 'rgba(18,18,16,0.92)',
                        background: 'rgba(18,18,16,0.05)', padding: '5px 12px', borderRadius: '999px',
                      }}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {resume.resumeInfo.education.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '0.86rem', fontWeight: 800, marginBottom: '8px' }}>학력사항</p>
                <div style={{ background: '#fff', border: '1px solid rgba(18,18,16,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
                  {resume.resumeInfo.education.map((edu, i) => (
                    <div key={i} style={{ padding: '13px 18px', borderBottom: i < resume.resumeInfo!.education.length - 1 ? '1px solid rgba(18,18,16,0.07)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '0.92rem', fontWeight: 700 }}>
                        <span>{edu.school}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(18,18,16,0.45)', flexShrink: 0 }}>{edu.period}</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 500, color: 'rgba(18,18,16,0.55)', marginTop: '3px' }}>
                        {[edu.major, edu.status].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resume.resumeInfo.career.length > 0 && (
              <div>
                <p style={{ fontSize: '0.86rem', fontWeight: 800, marginBottom: '8px' }}>경력</p>
                <div style={{ background: '#fff', border: '1px solid rgba(18,18,16,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
                  {resume.resumeInfo.career.map((c, i) => (
                    <div key={i} style={{ padding: '13px 18px', borderBottom: i < resume.resumeInfo!.career.length - 1 ? '1px solid rgba(18,18,16,0.07)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '0.92rem', fontWeight: 700 }}>
                        <span>{c.company}{c.position && ` · ${c.position}`}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(18,18,16,0.45)', flexShrink: 0 }}>{c.period}</span>
                      </div>
                      {c.description && (
                        <div style={{ fontSize: '0.86rem', fontWeight: 500, color: 'rgba(18,18,16,0.6)', marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {c.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mono" style={{ fontSize: '0.74rem', fontWeight: 800, color: 'rgba(18,18,16,0.4)', letterSpacing: '0.16em', marginBottom: '14px' }}>
          자기소개서
        </p>
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
