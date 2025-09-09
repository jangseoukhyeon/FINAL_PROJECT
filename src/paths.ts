export const paths = {
  home: '/',
  dashboard: {
    overview: '/dashboard',
    lines: '/dashboard/lines',                 // 라인 별 가동 현황
    downtime: '/dashboard/downtime',           // 비가동 일지
    maintenance: '/dashboard/maintenance',     // 수리 이력
    spare: '/dashboard/spare',                 // 스페어 현황
  },
  errors: { notFound: '/errors/not-found' },   // ← 이 경로 유지 권장
} as const;
