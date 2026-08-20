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

/** data/works.json 전용 별칭 (기존 코드 호환) */
export const getWorksFile = () => getRepoFile('data/works.json');
export const updateWorksFile = (newContent: unknown, sha: string, message: string) =>
  updateRepoFile('data/works.json', newContent, sha, message);

/** data/resumes.json 전용 별칭 */
export const getResumesFile = () => getRepoFile('data/resumes.json');
export const updateResumesFile = (newContent: unknown, sha: string, message: string) =>
  updateRepoFile('data/resumes.json', newContent, sha, message);
