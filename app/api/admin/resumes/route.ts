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

function requireAuth(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const { content } = await getResumesFile();
    return NextResponse.json({ resumes: content });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '조회 실패' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { company, role, body, published, slug: customSlug } = await req.json();
  if (typeof company !== 'string' || !company.trim()) {
    return NextResponse.json({ error: '회사명을 입력해주세요.' }, { status: 400 });
  }

  const slug = slugify(customSlug || company);
  if (!slug) {
    return NextResponse.json({ error: '슬러그(URL)를 생성할 수 없습니다.' }, { status: 400 });
  }

  try {
    const { content, sha } = await getResumesFile();
    const resumes = content as Resume[];

    if (resumes.some((r) => r.slug === slug)) {
      return NextResponse.json({ error: '이미 같은 URL의 페이지가 있습니다.' }, { status: 409 });
    }

    const newResume: Resume = {
      slug,
      company: company.trim(),
      role: typeof role === 'string' ? role.trim() : '',
      body: typeof body === 'string' ? body : '',
      published: published !== false,
      createdAt: new Date().toISOString(),
      views: [],
    };

    const updated = [newResume, ...resumes];
    await updateResumesFile(updated, sha, `admin: 자기소개서 페이지 생성 (${newResume.company})`);

    return NextResponse.json({ ok: true, resume: newResume });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '생성 실패' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { slug, company, role, body, published } = await req.json();
  if (typeof slug !== 'string' || !slug) {
    return NextResponse.json({ error: '수정할 페이지를 지정해주세요.' }, { status: 400 });
  }

  try {
    const { content, sha } = await getResumesFile();
    const resumes = content as Resume[];
    const idx = resumes.findIndex((r) => r.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ error: '해당 페이지를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updatedResume: Resume = {
      ...resumes[idx],
      company: typeof company === 'string' && company.trim() ? company.trim() : resumes[idx].company,
      role: typeof role === 'string' ? role.trim() : resumes[idx].role,
      body: typeof body === 'string' ? body : resumes[idx].body,
      published: typeof published === 'boolean' ? published : resumes[idx].published,
    };

    const updated = [...resumes];
    updated[idx] = updatedResume;

    await updateResumesFile(updated, sha, `admin: 자기소개서 페이지 수정 (${updatedResume.company})`);

    return NextResponse.json({ ok: true, resume: updatedResume });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '수정 실패' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { slug } = await req.json();
  if (typeof slug !== 'string' || !slug) {
    return NextResponse.json({ error: '삭제할 페이지를 지정해주세요.' }, { status: 400 });
  }

  try {
    const { content, sha } = await getResumesFile();
    const resumes = content as Resume[];
    const target = resumes.find((r) => r.slug === slug);
    if (!target) {
      return NextResponse.json({ error: '해당 페이지를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updated = resumes.filter((r) => r.slug !== slug);
    await updateResumesFile(updated, sha, `admin: 자기소개서 페이지 삭제 (${target.company})`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '삭제 실패' }, { status: 500 });
  }
}
