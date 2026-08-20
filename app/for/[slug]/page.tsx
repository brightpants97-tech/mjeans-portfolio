import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import resumesData from '@/data/resumes.json';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import ForClient from './ForClient';

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
  photoPosition?: PhotoPosition | null;
  resumeInfo: ResumeInfo | null;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ForPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const resumes = resumesData as Resume[];
  const resume = resumes.find((r) => r.slug === slug);

  const cookieStore = await cookies();
  const isAdmin = verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!resume) notFound();
  if (!resume.published && !isAdmin) notFound();

  return <ForClient resume={resume} isAdminViewer={isAdmin} />;
}
