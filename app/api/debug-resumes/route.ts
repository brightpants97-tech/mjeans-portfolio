import { NextResponse } from 'next/server';
import resumesData from '@/data/resumes.json';

interface Resume {
  slug: string;
  company: string;
  published: boolean;
}

export async function GET() {
  const resumes = resumesData as Resume[];
  return NextResponse.json({
    count: resumes.length,
    items: resumes.map((r) => ({
      slug: r.slug,
      slugCodePoints: Array.from(r.slug).map((c) => c.codePointAt(0)?.toString(16)),
      company: r.company,
      published: r.published,
    })),
  });
}
