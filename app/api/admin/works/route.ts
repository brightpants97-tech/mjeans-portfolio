import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import { getWorksFile, updateWorksFile } from '@/lib/github';

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

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { url, category } = await req.json();
  if (typeof url !== 'string' || !url.trim()) {
    return NextResponse.json({ error: '유튜브 링크를 입력해주세요.' }, { status: 400 });
  }
  if (!['일상', '합방', '여행'].includes(category)) {
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
    await updateWorksFile(updated, sha, `admin: 영상 삭제 (${target.category} - ${target.title})`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '삭제 실패' }, { status: 500 });
  }
}
