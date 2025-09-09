export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    overview: '/dashboard',
    lines: '/dashboard/lines',                 // 라인 별 가동 현황
    downtime: '/dashboard/downtime',           // 비가동 일지
    maintenance: '/dashboard/maintenance',     // 수리 이력
    spare: '/dashboard/spare',                 // 스페어 현황
    account: '/dashboard/account',
    settings: '/dashboard/settings',
    // customers / integrations는 쓰면 남기고, 아니면 지워도 됨
  },
  errors: { notFound: '/errors/not-found' },   // ← 이 경로 유지 권장
} as const;
