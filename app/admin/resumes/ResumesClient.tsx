'use client';
import { useEffect, useState } from 'react';

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
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const emptyForm = { slug: '', company: '', role: '', body: '', published: true };

export default function ResumesClient() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (authed) loadResumes();
  }, [authed]);

  async function loadResumes() {
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/resumes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '조회 실패');
      setResumes(data.resumes);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '조회 실패');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '로그인 실패');
      setAuthed(true);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : '로그인 실패');
    } finally {
      setLoggingIn(false);
    }
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingSlug('new');
    setSaveError(null);
  }

  function startEdit(r: Resume) {
    setForm({ slug: r.slug, company: r.company, role: r.role, body: r.body, published: r.published });
    setEditingSlug(r.slug);
    setSaveError(null);
  }

  function cancelEdit() {
    setEditingSlug(null);
    setForm(emptyForm);
    setSaveError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setNotice(null);
    try {
      const isNew = editingSlug === 'new';
      const res = await fetch('/api/admin/resumes', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isNew
            ? { company: form.company, role: form.role, body: form.body, published: form.published, slug: form.slug || undefined }
            : { slug: editingSlug, company: form.company, role: form.role, body: form.body, published: form.published }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장 실패');
      setNotice(isNew ? `"${data.resume.company}" 페이지 생성 완료. 배포까지 약 1분 정도 걸려요.` : '수정 완료. 배포까지 약 1분 정도 걸려요.');
      cancelEdit();
      loadResumes();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r: Resume) {
    if (!confirm(`"${r.company}" 페이지를 삭제할까요? 링크가 즉시 사라져요.`)) return;
    setDeletingSlug(r.slug);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/resumes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: r.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '삭제 실패');
      setNotice('삭제 완료. 배포까지 약 1분 정도 걸려요.');
      loadResumes();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제 실패');
    } finally {
      setDeletingSlug(null);
    }
  }

  async function togglePublished(r: Resume) {
    setNotice(null);
    try {
      const res = await fetch('/api/admin/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: r.slug, published: !r.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '변경 실패');
      loadResumes();
    } catch (e) {
      alert(e instanceof Error ? e.message : '변경 실패');
    }
  }

  if (checking) return <div style={{ background: BG, minHeight: '100vh' }} />;

  if (!authed) {
    return (
      <div style={{
        background: BG, minHeight: '100vh', color: TEXT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Paperlogy', -apple-system, sans-serif", padding: '20px',
      }}>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '320px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px' }}>관리자 로그인</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '10px',
              border: '1px solid rgba(18,18,16,0.15)', fontSize: '0.95rem',
              marginBottom: '10px', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          {loginError && <p style={{ color: '#d33', fontSize: '0.82rem', marginBottom: '10px' }}>{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: TEXT, color: BG, fontWeight: 800, fontSize: '0.92rem',
              cursor: loggingIn ? 'default' : 'pointer', opacity: loggingIn ? 0.6 : 1, fontFamily: 'inherit',
            }}
          >
            {loggingIn ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "'Paperlogy', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px clamp(1.2rem,4vw,2rem) 100px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>자기소개서 관리</h1>
          <a href="/admin" style={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT, opacity: 0.5, textDecoration: 'none' }}>
            영상 관리로 →
          </a>
        </div>
        <p style={{ fontSize: '0.84rem', opacity: 0.5, marginBottom: '28px' }}>
          회사별 비공개 링크(mjeans.co.kr/for/URL)를 만들고 관리해요. 검색엔진엔 노출되지 않아요.
        </p>

        {editingSlug ? (
          <form onSubmit={handleSave} style={{
            background: '#fff', border: '1px solid rgba(18,18,16,0.1)', borderRadius: '14px',
            padding: '20px', marginBottom: '28px',
          }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(18,18,16,0.4)', letterSpacing: '0.1em', marginBottom: '14px' }}>
              {editingSlug === 'new' ? '새 페이지 만들기' : `"${form.company}" 수정`}
            </p>

            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>회사명</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="예: 카카오"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,16,0.15)', fontSize: '0.88rem', marginBottom: '12px', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />

            {editingSlug === 'new' && (
              <>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  URL (비워두면 회사명으로 자동 생성) — mjeans.co.kr/for/...
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="예: kakao-editor-2026"
                  className="mono"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,16,0.15)', fontSize: '0.84rem', marginBottom: '12px', boxSizing: 'border-box' }}
                />
              </>
            )}

            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>지원 직무 (선택)</label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="예: 영상 편집자"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,16,0.15)', fontSize: '0.88rem', marginBottom: '12px', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>자기소개서 본문</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="이 회사만을 위한 자기소개서 내용을 적어주세요."
              rows={10}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,16,0.15)', fontSize: '0.88rem', marginBottom: '12px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '16px' }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              바로 게시 (끄면 나만 볼 수 있는 초안으로 저장)
            </label>

            {saveError && <p style={{ color: '#d33', fontSize: '0.8rem', marginBottom: '10px' }}>{saveError}</p>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={saving || !form.company.trim()}
                style={{
                  flex: 1, padding: '11px', borderRadius: '9px', border: 'none',
                  background: TEXT, color: BG, fontWeight: 800, fontSize: '0.88rem',
                  cursor: saving ? 'default' : 'pointer', opacity: saving || !form.company.trim() ? 0.5 : 1, fontFamily: 'inherit',
                }}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: '11px 18px', borderRadius: '9px', border: '1px solid rgba(18,18,16,0.15)',
                  background: 'transparent', color: TEXT, fontWeight: 700, fontSize: '0.88rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={startCreate}
            style={{
              width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
              background: ACCENT, color: '#121210', fontWeight: 800, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: '24px',
            }}
          >
            + 새 회사 페이지 만들기
          </button>
        )}

        {notice && (
          <div style={{
            background: '#f0fbe0', border: `1px solid ${ACCENT}`, borderRadius: '10px',
            padding: '12px 14px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '24px',
          }}>
            {notice}
          </div>
        )}

        {loadError && <p style={{ color: '#d33', fontSize: '0.85rem' }}>{loadError}</p>}
        {!resumes && !loadError && <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>불러오는 중...</p>}
        {resumes && resumes.length === 0 && <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>아직 만든 페이지가 없어요.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {resumes?.map((r) => (
            <div key={r.slug} style={{
              background: '#fff', border: '1px solid rgba(18,18,16,0.08)',
              borderRadius: '12px', padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 800 }}>{r.company}</span>
                    {!r.published && (
                      <span className="mono" style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: 'rgba(18,18,16,0.08)', color: 'rgba(18,18,16,0.5)' }}>
                        초안
                      </span>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: '0.76rem', color: 'rgba(18,18,16,0.4)', wordBreak: 'break-all' }}>
                    mjeans.co.kr/for/{r.slug}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(18,18,16,0.45)', marginTop: '4px' }}>
                    {r.role && `${r.role} · `}{fmtDateTime(r.createdAt)} 생성 · 조회 {r.views.length}회
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => startEdit(r)} style={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  수정
                </button>
                <button onClick={() => togglePublished(r)} style={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  {r.published ? '초안으로 전환' : '게시하기'}
                </button>
                {r.views.length > 0 && (
                  <button
                    onClick={() => setExpandedSlug(expandedSlug === r.slug ? null : r.slug)}
                    style={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                  >
                    조회 시각 {expandedSlug === r.slug ? '숨기기' : '보기'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(r)}
                  disabled={deletingSlug === r.slug}
                  style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d33', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginLeft: 'auto', opacity: deletingSlug === r.slug ? 0.4 : 1 }}
                >
                  {deletingSlug === r.slug ? '삭제 중' : '삭제'}
                </button>
              </div>

              {expandedSlug === r.slug && (
                <div className="mono" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(18,18,16,0.06)', fontSize: '0.74rem', color: 'rgba(18,18,16,0.5)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {r.views.slice().reverse().map((v, i) => (
                    <span key={i}>{fmtDateTime(v)}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
