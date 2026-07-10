import type { Metadata } from 'next';
import WorksClient from './WorksClient';

export const metadata: Metadata = {
  title: '영상 | Myeongjin',
  description: '명진이 편집한 영상입니다.',
};

export default function WorksPage() {
  return <WorksClient />;
}
