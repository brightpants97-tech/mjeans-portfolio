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

export default async function ForPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resumes = resumesData as Resume[];
  const resume = resumes.find((r) => r.slug === slug);

  const cookieStore = await cookies();
  const isAdmin = verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!resume) notFound();
  if (!resume.published && !isAdmin) notFound();

  return <ForClient resume={resume} isAdminViewer={isAdmin} />;
}
