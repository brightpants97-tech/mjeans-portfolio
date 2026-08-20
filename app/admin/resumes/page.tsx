import type { Metadata } from 'next';
import ResumesClient from './ResumesClient';

export const metadata: Metadata = {
  title: '자기소개서 관리 | Myeongjin',
  robots: { index: false, follow: false },
};

export default function AdminResumesPage() {
  return <ResumesClient />;
}
