import type { Metadata } from 'next';
import AdminClient from './AdminClient';

export const metadata: Metadata = {
  title: '관리자 | Myeongjin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
