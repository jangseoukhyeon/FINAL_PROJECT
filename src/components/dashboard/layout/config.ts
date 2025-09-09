import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'lines',     title: '라인 별 가동 현황', href: paths.dashboard.lines},
  { key: 'downtime',  title: '비가동 일지',       href: paths.dashboard.downtime},
  { key: 'maint',     title: '수리 이력',         href: paths.dashboard.maintenance},
  { key: 'spare',     title: '스페어 현황',       href: paths.dashboard.spare,},

  // 필요 시 유지
  // { key: 'settings',  title: '설정',              href: paths.dashboard.settings,     icon: 'gear-six' },
  // { key: 'account',   title: '계정',              href: paths.dashboard.account,      icon: 'user' },

  // 디버그용(원하면 숨김)
  // { key: 'error',   title: '에러 페이지',       href: paths.errors.notFound,        icon: 'x-square' },

  // 개요를 맨 위로 두고 싶으면 아래 줄을 맨 첫 줄에 추가
  // { key: 'overview', title: '개요',             href: paths.dashboard.overview,     icon: 'chart-pie' },
] satisfies NavItemConfig[];
