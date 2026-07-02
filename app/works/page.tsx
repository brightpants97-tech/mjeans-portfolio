import type { Metadata } from 'next';
import WorksClient from './WorksClient';

export const metadata: Metadata = {
  title: '작업물 | Myeongjin',
  description: '명진이 편집한 작업물입니다.',
};

export default function WorksPage() {
  return <WorksClient />;
}
