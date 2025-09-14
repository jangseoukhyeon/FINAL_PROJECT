import type { Metadata } from 'next';
import Main from './main'; // ← 그냥 일반 import (main.tsx는 'use client')

export const metadata: Metadata = {
  title: 'Overview | Dashboard',
};

export default function Page() {
  return <Main />; // 서버에서 클라이언트 컴포넌트를 렌더(정상)
}
