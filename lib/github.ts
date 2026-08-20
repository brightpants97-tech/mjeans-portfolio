const GITHUB_API = 'https://api.github.com';

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function repoInfo() {
  return {
    owner: env('GITHUB_OWNER'),
    repo: env('GITHUB_REPO'),
    branch: process.env.GITHUB_BRANCH || 'main',
    token: env('GITHUB_TOKEN'),
  };
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/**
 * 저장소 내 임의의 JSON 파일 내용과 sha(버전 식별자)를 가져온다.
 */
export async function getRepoFile(path: string): Promise<{ content: unknown; sha: string }> {
  const { owner, repo, branch, token } = repoInfo();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers: authHeaders(token), cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`GitHub 파일 조회 실패 (${res.status})`);
  }
  const json = await res.json();
  const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
  return { content: JSON.parse(decoded), sha: json.sha };
}

/**
 * 저장소 내 임의의 JSON 파일을 새 내용으로 커밋한다. Vercel이 이 커밋을 감지해 자동 재배포한다.
 */
export async function updateRepoFile(path: string, newContent: unknown, sha: string, message: string): Promise<void> {
  const { owner, repo, branch, token } = repoInfo();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message,
    content: Buffer.from(JSON.stringify(newContent, null, 2) + '\n', 'utf-8').toString('base64'),
    sha,
    branch,
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub 커밋 실패 (${res.status}): ${text}`);
  }
}

/**
 * 저장소에 바이너리(이미지 등) 파일을 새로 만들거나 교체한다. 이미 있으면 덮어쓰고, 없으면 새로 만든다.
 * base64Content는 데이터만 담긴 base64 문자열이어야 한다 (data: 접두사 제외).
 */
export async function upsertRepoBinaryFile(path: string, base64Content: string, message: string): Promise<void> {
  const { owner, repo, branch, token } = repoInfo();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;

  let sha: string | undefined;
  const existing = await fetch(`${url}?ref=${branch}`, { headers: authHeaders(token), cache: 'no-store' });
  if (existing.ok) {
    const json = await existing.json();
    sha = json.sha;
  }

  const body: Record<string, unknown> = { message, content: base64Content, branch };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub 이미지 업로드 실패 (${res.status}): ${text}`);
  }
}

/**
 * 저장소에서 파일을 삭제한다. 파일이 없으면 조용히 무시한다.
 */
export async function deleteRepoFile(path: string, message: string): Promise<void> {
  const { owner, repo, branch, token } = repoInfo();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;

  const existing = await fetch(`${url}?ref=${branch}`, { headers: authHeaders(token), cache: 'no-store' });
  if (!existing.ok) return;
  const json = await existing.json();

  await fetch(url, {
    method: 'DELETE',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha: json.sha, branch }),
  });
}

/** data/works.json 전용 별칭 (기존 코드 호환) */
export const getWorksFile = () => getRepoFile('data/works.json');
export const updateWorksFile = (newContent: unknown, sha: string, message: string) =>
  updateRepoFile('data/works.json', newContent, sha, message);

/** data/resumes.json 전용 별칭 */
export const getResumesFile = () => getRepoFile('data/resumes.json');
export const updateResumesFile = (newContent: unknown, sha: string, message: string) =>
  updateRepoFile('data/resumes.json', newContent, sha, message);
