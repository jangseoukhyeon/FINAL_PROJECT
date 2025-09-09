'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';

import { NoSsr } from '@/components/core/no-ssr';

type Color = 'dark' | 'light';

export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

/**
 * ✅ PNG 로고 (사이드바 가로 꽉 차게)
 * - width: 100% → 부모(Box) 넓이에 맞춰 늘어남
 * - height: auto → 비율 유지
 */
export function Logo(): React.JSX.Element {
  return (
    <Box
      component="img"
      src="/assets/ajin-logo.png"
      alt="Ajin Logo"
      sx={{
        display: 'block',
        width: '80%',      // ✅ 사이드바 가로폭에 맞춰 꽉 차게
        height: 'auto',     // ✅ 세로 자동 비율 유지
        objectFit: 'contain',
      }}
    />
  );
}

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

/**
 * ✅ 다크/라이트 모드 분기는 유지
 */
export function DynamicLogo({
  colorDark = 'light',
  colorLight = 'dark',
  ...props
}: DynamicLogoProps): React.JSX.Element {
  const { colorScheme } = useColorScheme();
  const _color = colorScheme === 'dark' ? colorDark : colorLight;

  return (
    <NoSsr fallback={<Box sx={{ width: '100%', height: 'auto' }} />}>
      <Logo {...props} />
    </NoSsr>
  );
}
