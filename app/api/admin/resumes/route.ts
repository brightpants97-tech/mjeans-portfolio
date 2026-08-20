import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import { getResumesFile, updateResumesFile, upsertRepoBinaryFile, deleteRepoFile } from '@/lib/github';

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

interface PhotoPosition {
  x: number;
  y: number;
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
  photoPosition: PhotoPosition | null;
  resumeInfo: ResumeInfo | null;
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

/** data:image/jpeg;base64,xxxx 형태의 문자열을 저장소에 업로드하고 공개 경로를 반환한다. */
async function uploadPhotoIfProvided(photoDataUrl: string | undefined | null, slug: string): Promise<string | null> {
  if (!photoDataUrl) return null;
  const match = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/.exec(photoDataUrl);
  if (!match) return null;
  const ext = match[1] === 'jpg' ? 'jpeg' : match[1];
  const base64 = match[2];
  const path = `public/resumes/${slug}.${ext}`;
  await upsertRepoBinaryFile(path, base64, `admin: 자기소개서 사진 업로드 (${slug})`);
  return `/resumes/${slug}.${ext}`;
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

  const { company, role, body, published, slug: customSlug, photo, resumeInfo, photoPosition } = await req.json();
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

    const photoPath = await uploadPhotoIfProvided(photo, slug);

    const newResume: Resume = {
      slug,
      company: company.trim(),
      role: typeof role === 'string' ? role.trim() : '',
      body: typeof body === 'string' ? body : '',
      published: published !== false,
      createdAt: new Date().toISOString(),
      views: [],
      photo: photoPath,
      photoPosition: photoPath ? (photoPosition && typeof photoPosition === 'object' ? photoPosition : { x: 50, y: 50 }) : null,
      resumeInfo: resumeInfo && typeof resumeInfo === 'object' ? resumeInfo : null,
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

  const { slug, company, role, body, published, photo, removePhoto, resumeInfo, photoPosition } = await req.json();
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

    let photoPath = resumes[idx].photo ?? null;
    let photoPos = resumes[idx].photoPosition ?? null;
    if (removePhoto) {
      photoPath = null;
      photoPos = null;
    } else if (typeof photo === 'string' && photo.startsWith('data:image/')) {
      photoPath = await uploadPhotoIfProvided(photo, slug);
      photoPos = { x: 50, y: 50 };
    }
    if (photoPath && photoPosition && typeof photoPosition === 'object') {
      photoPos = photoPosition;
    }

    const updatedResume: Resume = {
      ...resumes[idx],
      company: typeof company === 'string' && company.trim() ? company.trim() : resumes[idx].company,
      role: typeof role === 'string' ? role.trim() : resumes[idx].role,
      body: typeof body === 'string' ? body : resumes[idx].body,
      published: typeof published === 'boolean' ? published : resumes[idx].published,
      photo: photoPath,
      photoPosition: photoPos,
      resumeInfo: resumeInfo !== undefined ? (resumeInfo && typeof resumeInfo === 'object' ? resumeInfo : null) : (resumes[idx].resumeInfo ?? null),
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

    if (target.photo) {
      const ext = target.photo.split('.').pop();
      await deleteRepoFile(`public/resumes/${slug}.${ext}`, `admin: 자기소개서 사진 삭제 (${slug})`).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '삭제 실패' }, { status: 500 });
  }
}
