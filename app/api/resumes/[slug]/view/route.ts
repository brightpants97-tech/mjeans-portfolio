import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import { getResumesFile, updateResumesFile } from '@/lib/github';

interface Resume {
  slug: string;
  company: string;
  role: string;
  body: string;
  published: boolean;
  createdAt: string;
  views: string[];
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 관리자 본인이 로그인된 상태로 열람한 경우는 조회로 기록하지 않는다.
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (verifySessionToken(token)) {
    return NextResponse.json({ ok: true, counted: false });
  }

  try {
    const { content, sha } = await getResumesFile();
    const resumes = content as Resume[];
    const idx = resumes.findIndex((r) => r.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const updated = [...resumes];
    updated[idx] = { ...updated[idx], views: [...updated[idx].views, new Date().toISOString()] };

    await updateResumesFile(updated, sha, `view: ${updated[idx].company} 페이지 조회`);

    return NextResponse.json({ ok: true, counted: true });
  } catch {
    // 조회 기록 실패는 방문자 경험에 영향을 주지 않도록 조용히 무시한다.
    return NextResponse.json({ ok: false });
  }
}
