import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import { commitThumbnail, getWorksFile, updateWorksFile } from '@/lib/github';
import { MAX_THUMBNAIL_BYTES, isWorkCategory, type WorkCategory } from '@/lib/work-categories';
import { createHash } from 'node:crypto';

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

const CHANNEL_MAP: Record<string, { channel: string; handle: string }> = {
  UCkQCwnkQfgSuPTTnw_Y7v7w: { channel: '장지수', handle: '@jisoujang' },
  'UCbhJZ-TDueCVATgrfnzZgeA': { channel: '장지수2', handle: '@jangjisou2' },
};

function requireAuth(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const shortsMatch = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  try {
    const { content } = await getWorksFile();
    return NextResponse.json({ works: content });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '조회 실패' }, { status: 500 });
  }
}

async function addThumbnail(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('image');
    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: '원본 이미지를 선택해주세요.' }, { status: 400 });
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      return NextResponse.json({ error: '4MB 이하의 이미지를 선택해주세요.' }, { status: 413 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    let ext: string;
    if (bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') ext = 'png';
    else if (bytes.subarray(0, 3).toString('hex') === 'ffd8ff') ext = 'jpg';
    else if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') ext = 'webp';
    else return NextResponse.json({ error: 'JPG, PNG, WebP 이미지를 선택해주세요.' }, { status: 400 });

    const digest = createHash('sha256').update(bytes).digest('hex');
    const thumbnail = `/images/thumbnails/${digest}.${ext}`;
    const work: Work = { id: `썸네일-${digest}`, category: '썸네일', title: '',
      thumbnail, href: thumbnail, channel: '', handle: '', publishedAt: new Date().toISOString() };
    const { content, sha } = await getWorksFile();
    const works = content as Work[];
    if (works.some((item) => item.id === work.id)) {
      return NextResponse.json({ error: '이미 등록된 원본 이미지입니다.' }, { status: 409 });
    }
    await commitThumbnail([work, ...works], sha, `public${thumbnail}`, bytes, 'admin: 썸네일 추가');
    return NextResponse.json({ ok: true, work });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '썸네일 추가 실패' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  if (req.headers.get('content-type')?.startsWith('multipart/form-data')) return addThumbnail(req);
  const { url, category } = await req.json();
  if (category === '썸네일') {
    return NextResponse.json({ error: '썸네일은 원본 이미지로 등록해주세요.' }, { status: 400 });
  }
  if (typeof url !== 'string' || !url.trim()) {
    return NextResponse.json({ error: '유튜브 링크를 입력해주세요.' }, { status: 400 });
  }
  if (!isWorkCategory(category)) {
    return NextResponse.json({ error: '카테고리가 올바르지 않습니다.' }, { status: 400 });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json({ error: '유효한 유튜브 링크가 아닙니다.' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: '서버에 YOUTUBE_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    const ytJson = await ytRes.json();
    const item = ytJson.items?.[0];
    if (!item) {
      return NextResponse.json({ error: '유튜브에서 영상 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    const snippet = item.snippet;
    const channelInfo = CHANNEL_MAP[snippet.channelId] || { channel: snippet.channelTitle, handle: '' };

    const newWork: Work = {
      id: `${category}-${videoId}`,
      category,
      title: snippet.title,
      channel: channelInfo.channel,
      handle: channelInfo.handle,
      href: url.trim(),
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: snippet.publishedAt,
    };

    const { content, sha } = await getWorksFile();
    const works = content as Work[];

    if (works.some((w) => w.id === newWork.id)) {
      return NextResponse.json({ error: '이미 등록된 영상입니다.' }, { status: 409 });
    }

    const updated = [...works, newWork].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    await updateWorksFile(updated, sha, `admin: 영상 추가 (${newWork.category} - ${newWork.title})`);

    return NextResponse.json({ ok: true, work: newWork });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '추가 실패' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id, category } = await req.json();
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: '변경할 영상을 지정해주세요.' }, { status: 400 });
  }
  if (!isWorkCategory(category)) {
    return NextResponse.json({ error: '카테고리가 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    const { content, sha } = await getWorksFile();
    const works = content as Work[];
    const idx = works.findIndex((w) => w.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: '해당 영상을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (works[idx].category === category) {
      return NextResponse.json({ ok: true, work: works[idx] });
    }

    if (works[idx].thumbnail?.startsWith('/images/thumbnails/')) {
      return NextResponse.json({ error: '원본 이미지는 썸네일 카테고리에서 관리합니다.' }, { status: 400 });
    }
    const videoId = works[idx].id.slice(works[idx].category.length + 1);
    const newId = `${category}-${videoId}`;
    if (works.some((w) => w.id === newId)) {
      return NextResponse.json({ error: '이미 해당 카테고리에 같은 영상이 있습니다.' }, { status: 409 });
    }

    const updatedWork: Work = { ...works[idx], id: newId, category };
    const updated = works.map((w) => (w.id === id ? updatedWork : w));

    await updateWorksFile(updated, sha, `admin: 영상 카테고리 변경 (${works[idx].category} → ${category}, ${updatedWork.title})`);

    return NextResponse.json({ ok: true, work: updatedWork });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '변경 실패' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await req.json();
  if (typeof id !== 'string') {
    return NextResponse.json({ error: '삭제할 영상을 지정해주세요.' }, { status: 400 });
  }

  try {
    const { content, sha } = await getWorksFile();
    const works = content as Work[];
    const target = works.find((w) => w.id === id);
    if (!target) {
      return NextResponse.json({ error: '해당 영상을 찾을 수 없습니다.' }, { status: 404 });
    }

    const updated = works.filter((w) => w.id !== id);
    if (target.thumbnail && /^\/images\/thumbnails\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(target.thumbnail)) {
      await commitThumbnail(updated, sha, `public${target.thumbnail}`, null, 'admin: 썸네일 삭제');
    } else {
      await updateWorksFile(updated, sha, `admin: 영상 삭제 (${target.category} - ${target.title})`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '삭제 실패' }, { status: 500 });
  }
}
