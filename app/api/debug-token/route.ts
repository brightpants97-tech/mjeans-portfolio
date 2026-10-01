import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.GITHUB_TOKEN || '';
  const owner = process.env.GITHUB_OWNER || '';
  const repo = process.env.GITHUB_REPO || '';

  const meta = {
    length: token.length,
    startsWith: token.slice(0, 8),
    endsWith: token.slice(-4),
    hasLeadingWhitespace: /^\s/.test(token),
    hasTrailingWhitespace: /\s$/.test(token),
    hasNewline: token.includes('\n') || token.includes('\r'),
    owner,
    repo,
  };

  let githubTest: unknown = null;
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/works.json`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    });
    const body = await res.json().catch(() => null);
    githubTest = { status: res.status, message: (body as { message?: string })?.message };
  } catch (e) {
    githubTest = { error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({ meta, githubTest });
}
