'use client';

import * as React from 'react';
import {
  Box, Card, CardContent, Typography, Stack,
  FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import {
  stormGrey
} from '@/styles/theme/colors';

// ======================================================
// 상태 정의
// ======================================================
type LineId = `LINE ${string}`;
type LineStatus = 'RUN' | 'ALARM';
type RobotStatus = 'RUN' | 'WARN' | 'ALARM';

// 라인 전용 상태 정의 (정상가동 / 이상발생)
const LINE_STATUS_META: Record<
  LineStatus,
  { label: string; color: string; glow: string; bg: string; border: string }
> = {
  RUN:   { label: '정상가동', color: '#22c55e', glow: 'rgba(34,197,94,.45)', bg: 'rgba(34,197,94,.12)', border: '#22c55e' },
  ALARM: { label: '이상발생', color: '#ef4444', glow: 'rgba(239,68,68,.50)', bg: 'rgba(239,68,68,.12)', border: '#ef4444' },
};

// 로봇 전용 상태 정의 (정상 / 주의 / 경고)
const ROBOT_STATUS_META: Record<
  RobotStatus,
  { label: string; color: string; glow: string; bg: string; border: string }
> = {
  RUN:   { label: '정상', color: '#16a34a', glow: 'rgba(22,163,74,.45)', bg: 'rgba(22,163,74,.12)', border: '#16a34a' },
  WARN:  { label: '주의', color: '#d97706', glow: 'rgba(217,119,6,.45)', bg: 'rgba(217,119,6,.12)', border: '#d97706' },
  ALARM: { label: '경고', color: '#dc2626', glow: 'rgba(220,38,38,.50)', bg: 'rgba(220,38,38,.12)', border: '#dc2626' },
};

// ======================================================
// 샘플 데이터
// ======================================================
const LINES: LineId[] = Array.from({ length: 10 }, (_, i) =>
  (`LINE ${String(i + 1).padStart(2, '0')}`) as LineId
);

type RobotCell = {
  no: number;
  status: RobotStatus;
  reason?: string;
};

type LineSnapshot = {
  line: LineId;
  uptime: number;
  status: LineStatus;
  robots: RobotCell[];
};

// ======================================================
// 헬퍼: MAE 값 범위에 맞는 상태 리턴
// ======================================================
function statusFromMae(mae: number): RobotStatus {
  if (mae >= 0.01974) return 'ALARM';
  if (mae >= 0.018) return 'WARN';
  return 'RUN';
}

// ======================================================
// 데모 스냅샷 생성
// ======================================================
function makeDemoSnapshot(): LineSnapshot[] {
  const demo: LineSnapshot[] = LINES.map((line, idx) => {
    const robots: RobotCell[] = Array.from({ length: 20 }, (_, i) => {
      // 기본은 정상 구간에서 랜덤
      const mae = +(0.01314 + Math.random() * (0.01793 - 0.01314)).toFixed(5);
      return { no: i + 1, status: statusFromMae(mae) };
    });

    return { line, uptime: 100, status: 'RUN', robots };
  });

  // === LINE02 시나리오 반영 ===
  demo[1].robots.forEach((r) => {
    r.status = 'RUN';
  });

  // R02 → ALARM
  demo[1].robots[1] = { no: 2, status: 'ALARM', reason: '베어링 진동 임계치 초과' };

  // R06 → WARN
  demo[1].robots[5] = { no: 6, status: 'WARN', reason: '사이클 지연' };

  // R18 → WARN
  demo[1].robots[17] = { no: 18, status: 'WARN', reason: '전류 스파크 이상' };

  // 라인 상태: ALARM 우선
  demo[1].status = 'ALARM';
  demo[1].uptime = 95;

  return demo;
}

// ======================================================
// LED 컴포넌트 (공용)
// ======================================================
function LedDot<T extends string>({ status, meta, size = 22 }: { status: T; meta: Record<T, any>; size?: number }) {
  const m = meta[status];
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${m.border}`,
        background: `radial-gradient(circle at 35% 35%, ${m.glow} 0%, rgba(0,0,0,0) 55%),
                     radial-gradient(circle at center, ${m.bg} 0%, rgba(0,0,0,0) 70%)`,
        boxShadow: `0 0 12px 2px ${m.glow}`,
        ...(status !== 'RUN' && {
          '@keyframes blink': {
            '0%': { boxShadow: `0 0 10px 0 ${m.glow}` },
            '50%': { boxShadow: `0 0 20px 6px ${m.glow}` },
            '100%': { boxShadow: `0 0 10px 0 ${m.glow}` },
          },
          animation: 'blink 1.6s ease-in-out infinite',
        }),
        flexShrink: 0,
      }}
    />
  );
}

// ======================================================
// 라인 카드
// ======================================================
function LineCard({ snap }: { snap: LineSnapshot }) {
  const meta = LINE_STATUS_META[snap.status];
  return (
    <Card
      sx={{
        borderRadius: 3,
        background: '#111',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#fff',
        p: 1.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <LedDot status={snap.status} meta={LINE_STATUS_META} size={28} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: snap.status === 'ALARM' ? '#fbbf24' : '#fff',
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            {snap.line}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <Chip
              size="small"
              label={meta.label}
              sx={{
                bgcolor: meta.bg,
                color: meta.color,
                fontWeight: 700,
                height: 22,
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

// ======================================================
// 로봇 셀
// ======================================================
function RobotTile({
  cell,
  onSelect,
  selected,
}: {
  cell: RobotCell;
  onSelect: (no: number) => void;
  selected: boolean;
}) {
  const meta = ROBOT_STATUS_META[cell.status];
  return (
    <Card
      onClick={() => onSelect(cell.no)}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        background: '#0f1113',
        border: `1px solid ${selected ? meta.border : 'rgba(255,255,255,.08)'}`,
        outline: selected ? `2px solid ${meta.border}` : 'none',
        p: 1.2,
        transition: 'transform .08s ease',
        '&:hover': { transform: 'translateY(-1px)' },
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <LedDot status={cell.status} meta={ROBOT_STATUS_META} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: '#cbd5e1', fontWeight: 700, fontSize: '.9rem' }}>
            R{String(cell.no).padStart(2, '0')}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'inline-block',
              mt: 0.3,
              px: 0.6,
              py: 0.2,
              borderRadius: 1,
              bgcolor: meta.bg,
              color: meta.color,
              fontWeight: 700,
            }}
          >
            {meta.label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

// ======================================================
// 본문 페이지
// ======================================================
export default function LinesPage(): React.JSX.Element {
  const [snapshots] = React.useState<LineSnapshot[]>(() => makeDemoSnapshot());
  const [selectedLine, setSelectedLine] = React.useState<LineId>(LINES[0]);
  const [selectedRobot, setSelectedRobot] = React.useState<number | null>(null);

  const current = React.useMemo(
    () => snapshots.find((s) => s.line === selectedLine)!,
    [snapshots, selectedLine]
  );
  const selRobot = current.robots.find((r) => r.no === selectedRobot);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: stormGrey[50],   // ✅ 겉 박스 회색
        border: '1px solid #eee',
        borderRadius: 2,
      }}
    >
      {/* 1) 라인 가동 현황 */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          라인 가동 현황
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ color: '#64748b' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <LedDot status="RUN" meta={LINE_STATUS_META} />
            <Typography variant="caption">정상가동</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <LedDot status="ALARM" meta={LINE_STATUS_META} />
            <Typography variant="caption">이상발생</Typography>
          </Stack>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: 'repeat(5, 1fr)',
          mb: 3,
        }}
      >
        {snapshots.map((s) => (
          <LineCard key={s.line} snap={s} />
        ))}
      </Box>

      {/* 2) 로봇 상태 */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        라인별 로봇 상태
      </Typography>

      {/* 3) 라인 선택 + 상태 표시 */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="line-select-label">라인 선택</InputLabel>
          <Select
            labelId="line-select-label"
            label="라인 선택"
            value={selectedLine}
            onChange={(e) => {
              setSelectedLine(e.target.value as LineId);
              setSelectedRobot(null);
            }}
          >
            {LINES.map((ln) => (
              <MenuItem key={ln} value={ln}>
                {ln}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ color: '#64748b' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <LedDot status="RUN" meta={ROBOT_STATUS_META} />
            <Typography variant="caption">정상</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <LedDot status="WARN" meta={ROBOT_STATUS_META} />
            <Typography variant="caption">주의</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <LedDot status="ALARM" meta={ROBOT_STATUS_META} />
            <Typography variant="caption">경고</Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* 4) 로봇 상태 테이블 */}
      <Box
        sx={{
          display: 'grid',
          gap: 1.2,
          gridTemplateColumns: 'repeat(10, 1fr)',
          mb: 3,
        }}
      >
        {current.robots.map((cell) => (
          <RobotTile
            key={cell.no}
            cell={cell}
            selected={selectedRobot === cell.no}
            onSelect={setSelectedRobot}
          />
        ))}
      </Box>

      {/* 5) 로봇 상세 분석 */}
      {selRobot && selRobot.status !== 'RUN' && (
        <Card
          sx={{
            borderRadius: 3,
            background: '#0f1113',
            border: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {selectedLine} · R{String(selRobot.no).padStart(2, '0')} 분석
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip
                    size="small"
                    label={ROBOT_STATUS_META[selRobot.status].label}
                    sx={{
                      bgcolor: ROBOT_STATUS_META[selRobot.status].bg,
                      color: ROBOT_STATUS_META[selRobot.status].color,
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                  사유: {selRobot.reason ?? '—'}
                </Typography>

                <Box
                  sx={{
                    height: 180,
                    borderRadius: 2,
                    border: '1px dashed rgba(255,255,255,.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    mb: 1.5,
                  }}
                >
                  (실시간 진동 파형 그래프)
                </Box>
                <Box
                  sx={{
                    height: 160,
                    borderRadius: 2,
                    border: '1px dashed rgba(255,255,255,.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                >
                  (MAE 추세 / 임계치)
                </Box>
              </Box>

              <Box sx={{ width: { xs: '100%', md: 320 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  조치 제안
                </Typography>
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                  • 최근 7일 2회 이상 경고/주의 발생
                  <br />• 베어링 윤활 상태/체결 상태 점검 권장
                  <br />• 반복 발생 시 **교체 권장**
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
