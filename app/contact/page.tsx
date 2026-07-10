import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: '문의 | Myeongjin',
  description: '명진에게 편집 문의를 남겨보세요.',
};

export default function ContactPage() {
  return <ContactClient />;
}
