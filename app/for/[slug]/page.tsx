import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import resumesData from '@/data/resumes.json';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import ForClient from './ForClient';

interface Resume {
  slug: string;
  company: string;
  role: string;
  body: string;
  published: boolean;
  createdAt: string;
  views: string[];
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ForPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { slug } = await params;
  const { debug } = await searchParams;
  const resumes = resumesData as Resume[];
  // Next.js가 URL 세그먼트를 자동으로 디코딩해 넘겨주므로 slug는 원문(한글 등) 그대로 비교한다.
  const resume = resumes.find((r) => r.slug === slug);

  const cookieStore = await cookies();
  const isAdmin = verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);

  if (debug) {
    return (
      <pre style={{ padding: 20, fontSize: 12, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(
          {
            receivedSlug: slug,
            receivedSlugCodePoints: Array.from(slug).map((c) => c.codePointAt(0)?.toString(16)),
            receivedSlugLength: slug.length,
            matchFound: !!resume,
            availableSlugs: resumes.map((r) => ({
              slug: r.slug,
              codePoints: Array.from(r.slug).map((c) => c.codePointAt(0)?.toString(16)),
              published: r.published,
            })),
            isAdmin,
          },
          null,
          2
        )}
      </pre>
    );
  }

  if (!resume) notFound();
  if (!resume.published && !isAdmin) notFound();

  return <ForClient resume={resume} isAdminViewer={isAdmin} />;
}
