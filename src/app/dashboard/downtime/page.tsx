'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Select,
  LinearProgress,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// 🎨 색상 팔레트 import
import {
  stormGrey,
  redOrange,
  california,
  kepple,
  neonBlue,
} from '@/styles/theme/colors';

// ======================================================
// 상태 정의
// ======================================================
type LineId = `LINE ${string}`;
type LineStatus = 'RUN' | 'ALARM';
type RobotStatus = 'RUN' | 'WARN' | 'ALARM';

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
// 라인/로봇 스냅샷 생성
// ======================================================
function makeDemoSnapshot(): LineSnapshot[] {
  const LINES: LineId[] = Array.from({ length: 10 }, (_, i) =>
    (`LINE ${String(i + 1).padStart(2, '0')}`) as LineId
  );

  const demo: LineSnapshot[] = LINES.map((line) => {
    const robots: RobotCell[] = Array.from({ length: 20 }, (_, i) => ({
      no: i + 1,
      status: 'RUN',
    }));
    return { line, uptime: 100, status: 'RUN', robots };
  });

  // === LINE02 시나리오 반영 ===
  demo[1].robots[1] = { no: 2, status: 'ALARM', reason: '베어링 진동 임계치 초과' };
  demo[1].robots[5] = { no: 6, status: 'WARN', reason: '사이클 지연' };
  demo[1].robots[17] = { no: 18, status: 'WARN', reason: '전류 스파크 이상' };

  demo[1].status = 'ALARM';
  demo[1].uptime = 91;

  return demo;
}

// ======================================================
// 비가동 일지 대시보드 (최종)
// ======================================================
export default function DowntimeDashboard() {
  const [date, setDate] = React.useState('2025-01-16');
  const [line, setLine] = React.useState('LINE 02');
  const [periodType, setPeriodType] = React.useState<'월간' | '주간' | '연간'>('월간');

  const snapshots = React.useMemo(() => makeDemoSnapshot(), []);
  const currentLine = snapshots.find((s) => s.line === line)!;
  const errorRobots = currentLine.robots.filter((r) => r.status !== 'RUN');

  // === 비가동 통계 ===
  const downtimeMinutes = errorRobots.length * 35;
  const downtimeTarget = 80; // 목표 기준
  const downtimeCount = errorRobots.length;

  // === 예방정비 일정 (더미) ===
  const maintenanceList = [
    { line: 'LINE 01', date: '2025-01-20', task: '로봇 윤활유 교체' },
    { line: 'LINE 02', date: '2025-01-25', task: '베어링 점검' },
    { line: 'LINE 05', date: '2025-01-28', task: '센서 교정' },
  ];

  // === 더미 차트 데이터 ===
  const monthlyData = [
    { period: 'Jan', minutes: 40 },
    { period: 'Feb', minutes: 60 },
    { period: 'Mar', minutes: 20 },
    { period: 'Apr', minutes: 80 },
    { period: 'May', minutes: 30 },
    { period: 'Jun', minutes: 100 },
  ];

  const weeklyData = [
    { period: '1주차', minutes: 15 },
    { period: '2주차', minutes: 25 },
    { period: '3주차', minutes: 10 },
    { period: '4주차', minutes: 30 },
  ];

  const yearlyData = [
    { period: '2022', minutes: 400 },
    { period: '2023', minutes: 520 },
    { period: '2024', minutes: 310 },
    { period: '2025', minutes: 600 },
  ];

  const data =
    periodType === '월간'
      ? monthlyData
      : periodType === '주간'
      ? weeklyData
      : yearlyData;

  return (
    <Box sx={{ p: 3, bgcolor: stormGrey[50], minHeight: '100vh' }}>
      {/* ================= 상단 4개 박스 ================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          mb: 4,
        }}
      >
        {/* 총 비가동 시간 */}
        <Card sx={{ minHeight: 180, bgcolor: stormGrey[100] }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 36, color: redOrange[500], mb: 1 }} />
            <Typography variant="subtitle2" color={stormGrey[600]}>
              총 비가동 시간
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: redOrange[600], mt: 1 }}>
              {downtimeMinutes}분
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(downtimeMinutes / downtimeTarget) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: stormGrey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: downtimeMinutes > downtimeTarget ? redOrange[500] : kepple[500],
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* 비가동 발생 건수 */}
        <Card sx={{ minHeight: 180, bgcolor: stormGrey[100] }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <WarningAmberIcon sx={{ fontSize: 36, color: california[600], mb: 1 }} />
            <Typography variant="subtitle2" color={stormGrey[600]}>
              비가동 발생 건수
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: california[700], mt: 1 }}>
              {downtimeCount}건
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(downtimeCount / 5) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: stormGrey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: california[500],
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* 설비 가동률 */}
        <Card sx={{ minHeight: 180, bgcolor: stormGrey[100] }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <SettingsIcon sx={{ fontSize: 36, color: kepple[600], mb: 1 }} />
            <Typography variant="subtitle2" color={stormGrey[600]}>
              설비 가동률
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: kepple[600], mt: 1 }}>
              {currentLine.uptime}%
            </Typography>
            <Typography variant="body2" color={stormGrey[500]}>
              
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={currentLine.uptime}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: stormGrey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: kepple[500],
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* 예방정비 일정 알림 */}
        <Card sx={{ minHeight: 180, bgcolor: stormGrey[100] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" color={stormGrey[700]}>
                예방정비 일정 알림
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {maintenanceList.map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    bgcolor: neonBlue[50],
                    border: `1px solid ${neonBlue[200]}`,
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.8,
                    fontSize: 13,
                    color: neonBlue[800],
                  }}
                >
                  <strong>{m.line}</strong> · {m.task} ({m.date})
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ================= 하단 3개 박스 ================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '5fr 3fr 2fr',
          gap: 2,
        }}
      >
        {/* 비가동 라인 선택 (제목 왼쪽, 선택 오른쪽) */}
        <Card sx={{ minHeight: 320, bgcolor: stormGrey[100] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" color={stormGrey[700]}>
                비가동 라인 선택
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <TextField
                  select
                  size="small"
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  {snapshots.map((s) => (
                    <MenuItem key={s.line} value={s.line}>
                      {s.line}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
            <Typography variant="body2" align="center" color={stormGrey[600]} sx={{ mb: 2 }}>
              {line} · 비가동 {errorRobots.length}건 / 가동률 {currentLine.uptime}%
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {errorRobots.map((r, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: r.status === 'ALARM' ? redOrange[50] : california[50],
                    border: `1px solid ${r.status === 'ALARM' ? redOrange[200] : california[200]}`,
                    color: r.status === 'ALARM' ? redOrange[700] : california[700],
                    fontSize: 14,
                  }}
                >
                  <span style={{ width: '60px' }}>R{String(r.no).padStart(2, '0')}</span>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      width: '80px',
                    }}
                  >
                    {r.status === 'ALARM' ? '⚠' : '◆'}
                    <span>{r.status === 'ALARM' ? '경고' : '주의'}</span>
                  </Box>
                  <span style={{ flex: 1, textAlign: 'right' }}>{r.reason ?? '—'}</span>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* 비가동 이력분석 (제목 왼쪽, 선택 오른쪽) */}
        <Card sx={{ minHeight: 320, bgcolor: stormGrey[100] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" color={stormGrey[700]}>
                비가동 이력분석
              </Typography>
              <Select
                size="small"
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as any)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="월간">월간</MenuItem>
                <MenuItem value="주간">주간</MenuItem>
                <MenuItem value="연간">연간</MenuItem>
              </Select>
            </Box>
            <Box sx={{ mt: 1, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={stormGrey[200]} />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill={kepple[400]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 비가동 주요 원인 (가로바 형식) */}
        <Card sx={{ minHeight: 320, bgcolor: stormGrey[100] }}>
          <CardContent>
            <Typography variant="h6" align="left" gutterBottom color={stormGrey[700]}>
              비가동 주요 원인
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 2 }}>
              {errorRobots.map((r, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: neonBlue[50],
                    border: `1px solid ${neonBlue[200]}`,
                    color: neonBlue[700],
                    fontSize: 14,
                  }}
                >
                  <span>{r.reason ?? '기타'}</span>
                  <span>1회</span>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
