'use client';
import { useEffect, useState } from 'react';

const BG     = '#faf9f5';
const ACCENT = '#a3e635';
const TEXT   = '#121210';

interface Work {
  id: string;
  category: '일상' | '합방' | '여행';
  title: string;
  channel: string;
  handle: string;
  href: string;
  thumbnail: string | null;
  publishedAt: string;
}

const CATEGORIES: Work['category'][] = ['일상', '합방', '여행'];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminClient() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [works, setWorks] = useState<Work[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Work['category']>('일상');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (authed) loadWorks();
  }, [authed]);

  async function loadWorks() {
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/works');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '조회 실패');
      setWorks(data.works);
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

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setWorks(null);
    setPassword('');
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '추가 실패');
      setUrl('');
      setNotice(`"${data.work.title}" 추가 완료. 배포까지 약 1분 정도 걸려요.`);
      loadWorks();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : '추가 실패');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(work: Work) {
    if (!confirm(`"${work.title}"을(를) 삭제할까요?`)) return;
    setDeletingId(work.id);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/works', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: work.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '삭제 실패');
      setNotice('삭제 완료. 배포까지 약 1분 정도 걸려요.');
      loadWorks();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제 실패');
    } finally {
      setDeletingId(null);
    }
  }

  if (checking) {
    return <div style={{ background: BG, minHeight: '100vh' }} />;
  }

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
          {loginError && (
            <p style={{ color: '#d33', fontSize: '0.82rem', marginBottom: '10px' }}>{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loggingIn}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: TEXT, color: BG, fontWeight: 800, fontSize: '0.92rem',
              cursor: loggingIn ? 'default' : 'pointer', opacity: loggingIn ? 0.6 : 1,
              fontFamily: 'inherit',
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>영상 관리</h1>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '0.8rem', fontWeight: 700, color: TEXT, opacity: 0.5,
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            로그아웃
          </button>
        </div>
        <a href="/admin/resumes" style={{ display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, color: ACCENT, textDecoration: 'none', marginBottom: '24px' }}>
          → 자기소개서 관리로
        </a>

        {/* 추가 폼 */}
        <form onSubmit={handleAdd} style={{
          background: '#fff', border: '1px solid rgba(18,18,16,0.1)', borderRadius: '14px',
          padding: '20px', marginBottom: '28px',
        }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(18,18,16,0.4)', letterSpacing: '0.1em', marginBottom: '12px' }}>
            영상 추가
          </p>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="유튜브 링크 (youtu.be/... 또는 youtube.com/watch?v=...)"
            style={{
              width: '100%', padding: '11px 13px', borderRadius: '9px',
              border: '1px solid rgba(18,18,16,0.15)', fontSize: '0.88rem',
              marginBottom: '10px', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '7px 16px', borderRadius: '999px',
                  border: category === cat ? 'none' : '1px solid rgba(18,18,16,0.15)',
                  background: category === cat ? ACCENT : 'transparent',
                  color: TEXT, fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={adding || !url.trim()}
            style={{
              width: '100%', padding: '11px', borderRadius: '9px', border: 'none',
              background: TEXT, color: BG, fontWeight: 800, fontSize: '0.88rem',
              cursor: adding ? 'default' : 'pointer', opacity: adding || !url.trim() ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            {adding ? '추가 중...' : '추가'}
          </button>
          {addError && <p style={{ color: '#d33', fontSize: '0.8rem', marginTop: '10px' }}>{addError}</p>}
        </form>

        {notice && (
          <div style={{
            background: '#f0fbe0', border: `1px solid ${ACCENT}`, borderRadius: '10px',
            padding: '12px 14px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '24px',
          }}>
            {notice}
          </div>
        )}

        {/* 목록 */}
        {loadError && <p style={{ color: '#d33', fontSize: '0.85rem' }}>{loadError}</p>}
        {!works && !loadError && <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>불러오는 중...</p>}

        {works && CATEGORIES.map((cat) => {
          const items = works
            .filter((w) => w.category === cat)
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          if (items.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '10px' }}>
                {cat} <span style={{ opacity: 0.4, fontWeight: 600 }}>({items.length})</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((w) => (
                  <div key={w.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fff', border: '1px solid rgba(18,18,16,0.08)',
                    borderRadius: '10px', padding: '10px 12px',
                  }}>
                    {w.thumbnail && (
                      <img src={w.thumbnail} alt="" style={{ width: '64px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {w.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.45, marginTop: '2px' }}>
                        {w.channel} · {fmtDate(w.publishedAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(w)}
                      disabled={deletingId === w.id}
                      style={{
                        fontSize: '0.78rem', fontWeight: 700, color: '#d33',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        flexShrink: 0, fontFamily: 'inherit', opacity: deletingId === w.id ? 0.4 : 1,
                      }}
                    >
                      {deletingId === w.id ? '삭제 중' : '삭제'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
