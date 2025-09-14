'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, LinearProgress,
  IconButton, Divider, ToggleButtonGroup, ToggleButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  SyncRounded, MoreVertRounded, RefreshRounded
} from '@mui/icons-material';
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine
} from 'recharts';

/* =========================
   타입/더미 데이터
   ========================= */
type MaintRow = {
  id: number; date: string; line: string; robot: string; part: string;
  action: string; result: string; mttrMin: number; engineer: string; status: '완료' | '진행중';
};

const maintenanceRows: MaintRow[] = [
  { id: 1, date: '2025-09-09', line: 'WELD-A', robot: 'R03', part: '전극팁', action: '교체', result: '정상', mttrMin: 18, engineer: 'Kim', status: '완료' },
  { id: 2, date: '2025-09-09', line: 'WELD-B', robot: 'R02', part: '케이블', action: '점검', result: '추가점검필요', mttrMin: 35, engineer: 'Lee', status: '진행중' },
  { id: 3, date: '2025-09-08', line: 'WELD-A', robot: 'R01', part: '베어링', action: '윤활', result: '정상', mttrMin: 22, engineer: 'Park', status: '완료' },
];

type EquipStatus = 'ok' | 'warn' | 'alarm' | 'stop';
type EquipCard = {
  id: string; line: string; status: EquipStatus; rul: number; anomaly: number; defect: number; spark: { t: string; v: number }[];
};

/* ▶ 20개 자동 생성: WELD-A ~ WELD-T */
const equipCards: EquipCard[] = Array.from({ length: 20 }, (_, i) => {
  const line = `WELD-${String.fromCharCode(65 + i)}`; // A~T
  const status: EquipStatus =
    i % 9 === 0 ? 'stop' :
    i % 7 === 0 ? 'alarm' :
    i % 5 === 0 ? 'warn' : 'ok';
  const rul = Math.max(0, Math.min(100, 20 + (i * 3) % 70 + (status === 'stop' ? 0 : 0)));
  const anomaly = status === 'alarm' ? 92 : status === 'warn' ? 72 : status === 'stop' ? 0 : 28 + (i % 10);
  const defect = status === 'alarm' ? 2.5 : status === 'warn' ? 1.7 : status === 'stop' ? 0 : 1.1 + (i % 3) * 0.2;
  return {
    id: line,
    line,
    status,
    rul,
    anomaly,
    defect: Math.round(defect * 10) / 10,
    spark: status === 'stop' ? [] : Array.from({ length: 24 }, (_, h) => ({ t: `${h}`, v: 1 + Math.random() * (status === 'ok' ? 1.2 : 2.5) }))
  };
});

/* 이상점수(또는 MAE) 트렌드 */
const anomalyTrend = Array.from({ length: 48 }, (_, i) => ({
  t: i % 2 === 0 ? `${i/2}h` : '',
  score: 40 + Math.random() * 20 + (i > 36 ? (i - 36) * 1.5 : 0)
}));
const BASELINE = 80;     // 기준선(주의)
const CRITICAL = 95;     // 기준선(경고)

/* =========================
   공통: KPI Card
   ========================= */
type Trend = 'up' | 'down' | 'flat';

function StatCard({
  title, value, sub, tone = 'neutral', percent, trend = 'up'
}: {
  title: string; value: string;
  sub?: string; tone?: 'neutral' | 'positive' | 'negative';
  percent?: number; trend?: Trend;
}) {
  const bg =
    tone === 'positive' ? 'var(--mui-palette-success-main)'
    : tone === 'negative' ? 'var(--mui-palette-error-main)'
    : 'var(--mui-palette-background-paper)';
  const fg = tone === 'neutral' ? 'var(--mui-palette-text-primary)' : '#fff';

  return (
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{
          p: 2, bgcolor: bg, color: fg, minHeight: 100,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 0.5
        }}>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 700 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
        </Box>
        {(sub || typeof percent === 'number') && (
          <Box sx={{ px: 2, py: 1.5 }}>
            {sub && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: trend === 'down' ? 'error.main' : 'success.main' }}>
                {sub}
              </Typography>
            )}
            {typeof percent === 'number' && (
              <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 999, mt: 1 }} />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================
   설비 카드 (상태 맵)
   ========================= */
function statusColor(s: EquipStatus) {
  switch (s) {
    case 'ok': return '#2e7d32';      // green
    case 'warn': return '#ed6c02';    // amber
    case 'alarm': return '#d32f2f';   // red
    case 'stop': return '#9e9e9e';    // grey
  }
}

function EquipmentCard({ item }: { item: EquipCard }) {
  const c = statusColor(item.status);
  return (
    <Card sx={{ height: 132, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pt: 1.25, pb: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c, boxShadow: `0 0 0 2px ${c}33` }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{item.line}</Typography>
          </Stack>
          <Chip size="small" label={`${item.anomaly}%`} sx={{ bgcolor: `${c}22`, color: c, fontWeight: 700 }} />
        </Stack>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>RUL</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>{item.rul}%</Typography>

            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, mt: .25 }}>불량률</Typography>
            {/* ▼ 잘림 방지: 줄간격/여백/nowrap 조정 */}
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {item.defect}%
            </Typography>
          </Grid>

          <Grid item xs={6}>
            {/* ▼ 차트 높이 살짝 ↓ (텍스트 여유 확보) */}
            <Box sx={{ height: 46 }}>
              {item.spark.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.spark} margin={{ top: 2, right: 0, left: -16, bottom: 0 }}>
                    <Line type="monotone" dataKey="v" dot={false} stroke={c} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="caption" color="text.secondary">정지</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

/* =========================
   페이지
   ========================= */
export default function DashboardMainPage(): React.JSX.Element {
  const [period, setPeriod] = React.useState<'realtime'|'1h'|'24h'|'7d'>('24h');
  const [plant, setPlant] = React.useState('정정');
  const [autoRefresh, setAutoRefresh] = React.useState('on');

  const maintCols: GridColDef<MaintRow>[] = [
    { field: 'date', headerName: '일자', width: 110, headerAlign: 'center', align: 'center' },
    { field: 'line', headerName: '라인', width: 110, headerAlign: 'center', align: 'center' },
    { field: 'robot', headerName: '로봇', width: 100, headerAlign: 'center', align: 'center' },
    { field: 'part', headerName: '부품', width: 140, headerAlign: 'center', align: 'center' },
    { field: 'action', headerName: '작업', width: 120, headerAlign: 'center', align: 'center' },
    { field: 'result', headerName: '결과', width: 140, headerAlign: 'center', align: 'center' },
    { field: 'mttrMin', headerName: 'MTTR(분)', width: 110, headerAlign: 'center', align: 'center' },
    { field: 'engineer', headerName: '담당', width: 110, headerAlign: 'center', align: 'center' },
    {
      field: 'status', headerName: '상태', width: 120, headerAlign: 'center', align: 'center',
      renderCell: (p) => <Chip size="small" label={p.value} color={p.value === '완료' ? 'success' : 'warning'} />
    },
  ];

  type AlarmRow = {
    id: number; time: string; line: string; robot: string; metric: string; score: number; severity: '주의'|'경고'; rul: number; status: '미확인'|'확인'|'조치중';
  };
  const alarmRows: AlarmRow[] = [
    { id: 1, time: '11:18', line: 'WELD-D', robot: 'R02', metric: 'MAE', score: 95, severity: '경고', rul: 9,  status: '미확인' },
    { id: 2, time: '11:12', line: 'WELD-C', robot: 'R01', metric: 'DynRes', score: 88, severity: '주의', rul: 22, status: '조치중' },
    { id: 3, time: '10:58', line: 'WELD-F', robot: 'R03', metric: 'Current σ', score: 86, severity: '주의', rul: 18, status: '확인' },
    { id: 4, time: '10:54', line: 'WELD-B', robot: 'R08', metric: 'MAE', score: 83, severity: '주의', rul: 74, status: '미확인' },
  ];

  const alarmCols: GridColDef<AlarmRow>[] = [
    { field: 'time', headerName: '시간', width: 90, headerAlign: 'center', align: 'center' },
    { field: 'line', headerName: '라인', width: 100, headerAlign: 'center', align: 'center' },
    { field: 'robot', headerName: '로봇', width: 90, headerAlign: 'center', align: 'center' },
    { field: 'metric', headerName: '지표', width: 110, headerAlign: 'center', align: 'center' },
    { field: 'score', headerName: '이상점수', width: 110, headerAlign: 'center', align: 'center' },
    { field: 'rul', headerName: 'RUL(%)', width: 100, headerAlign: 'center', align: 'center' },
    { field: 'severity', headerName: '심각도', width: 100, headerAlign: 'center', align: 'center',
      renderCell: (p) => <Chip size="small" label={p.value} color={p.value === '경고' ? 'error' : 'warning'} /> },
    { field: 'status', headerName: '상태', width: 100, headerAlign: 'center', align: 'center' },
  ];

  const nowTxt = new Date().toLocaleString('ko-KR', { hour12: false });

  return (
    <Container maxWidth="xl" sx={{ mx: 'auto', py: 2 }}>
      {/* 헤더 컨트롤바 (로고/제목 제거 버전) */}
        {/* ===== 헤더 컨트롤바 (윗쪽으로 끌어올리고 간격 확대) ===== */}
        {/* === 헤더 컨트롤바: 최상단으로 끌어올림(데스크톱), 모바일은 정상 흐름 === */}
        <Box sx={{ position: 'relative', mb: { xs: 1.5, md: 0 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems="center"
            justifyContent="flex-end"
            spacing={{ xs: 1.25, md: 1.5 }}
            sx={{
              position: { xs: 'static', md: 'absolute' },  // 데스크톱에서 떠 있게
              right: { md: 0 },
              top: { md: -56 },                             // ⬅️ 위로 당김(원하면 -64/-72로 더 올려도 됨)
              zIndex: (t) => t.zIndex.appBar + 1,
              bgcolor: 'transparent',
              // 줄바꿈 시 깔끔한 간격
              '& .MuiToggleButtonGroup-root': { flexWrap: 'nowrap' },
            }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="plant-label">공장</InputLabel>
              <Select labelId="plant-label" label="공장" value={plant} onChange={(e)=>setPlant(e.target.value)}>
                <MenuItem value="정정">정정</MenuItem>
                <MenuItem value="직인">직인</MenuItem>
              </Select>
            </FormControl>

            <ToggleButtonGroup size="small" value={period} exclusive onChange={(_,v)=>v&&setPeriod(v as any)}>
              <ToggleButton value="realtime">실시간</ToggleButton>
              <ToggleButton value="1h">1H</ToggleButton>
              <ToggleButton value="24h">24H</ToggleButton>
              <ToggleButton value="7d">7D</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup size="small" value={autoRefresh} exclusive onChange={(_,v)=>v&&setAutoRefresh(v)}>
              <ToggleButton value="on">자동</ToggleButton>
              <ToggleButton value="off">수동</ToggleButton>
            </ToggleButtonGroup>

            <IconButton size="small" aria-label="sync"><SyncRounded fontSize="small" /></IconButton>
            <IconButton size="small"><RefreshRounded /></IconButton>
          </Stack>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' }, height: 58 }} />




            {/* ===== KPI 스트립 (좌우 풀폭, 자동 배치) ===== */}
        {/* ===== KPI 스트립 (4 × 2, 가운데 정렬) ===== */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              display: 'grid',
              // 모바일(2열) → 데스크톱(4열)
              gridTemplateColumns: { xs: 'repeat(2, minmax(200px, 1fr))', md: 'repeat(4, minmax(240px, 1fr))' },
              gap: 2,
              width: '100%',
              maxWidth: 1320,     // ✅ 전체 그리드 폭 제한 → 가운데 정렬 효과
              alignItems: 'stretch',
            }}
          >
            <StatCard title="OEE" value="86.4%" sub="▲ 1.2% (전일)" tone="positive" />
            <StatCard title="MTBF" value="18.2h" sub="▼ 0.3h" />
            <StatCard title="MTTR" value="24 min" sub="±0.0" />
            <StatCard title="비가동 시간" value="62 min" sub="(88건)" />
            <StatCard title="활성 알람" value="7건" sub="(경고 2, 주의 5)" tone="negative" />
            <StatCard title="위험 로봇" value="2대" />
            <StatCard title="평균 RUL" value="72%" percent={72} />
            <StatCard title="예정 정비(오늘)" value="3건" />
          </Box>
        </Box>




      {/* ===== 1행: 좌 설비 상태맵(축소, 20개) / 우 알람 큐 ===== */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* 설비 상태 맵: 가로폭 md=7 + 내부 스크롤 */}
       {/* ===== 좌: 설비 상태 맵 (4 x 5 고정) ===== */}
          {/* ===== 좌: 설비 상태 맵 (5 x 2 고정, 총 10개) ===== */}
          <Grid item xs={12} md={7}>
            <Card>
            {/* ⬅️ 좌우 여백 제거 */}
            <CardContent sx={{ p: 0 }}>
              {/* 헤더만 살짝 패딩 */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1 }}>
                <Typography variant="h6">설비 상태 맵 (10)</Typography>
                <IconButton size="small"><MoreVertRounded fontSize="small" /></IconButton>
              </Stack>

              {/* 내용: 좌/우 패딩 없이 카드 끝까지 꽉 차게 */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
                  gap: 0.75,   // 카드 간 간격만 유지, 가장자리엔 여백 없음
                }}
              >
                {equipCards.slice(0, 10).map((it) => (
                  <Box key={it.id}>
                    <EquipmentCard item={it} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>


        {/* 알람 / 이상 큐 */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>알람 / 이상 큐</Typography>
              <DataGrid
                autoHeight
                rows={[
                  { id: 1, time: '11:18', line: 'WELD-D', robot: 'R02', metric: 'MAE',        score: 95, severity: '경고', rul: 9,  status: '미확인' },
                  { id: 2, time: '11:12', line: 'WELD-C', robot: 'R01', metric: 'DynRes',     score: 88, severity: '주의', rul: 22, status: '조치중' },
                  { id: 3, time: '10:58', line: 'WELD-F', robot: 'R03', metric: 'Current σ',  score: 86, severity: '주의', rul: 18, status: '확인' },
                  { id: 4, time: '10:54', line: 'WELD-B', robot: 'R08', metric: 'MAE',        score: 83, severity: '주의', rul: 74, status: '미확인' },
                ]}
                columns={[
                  { field: 'time', headerName: '시간', width: 90, headerAlign: 'center', align: 'center' },
                  { field: 'line', headerName: '라인', width: 100, headerAlign: 'center', align: 'center' },
                  { field: 'robot', headerName: '로봇', width: 90, headerAlign: 'center', align: 'center' },
                  { field: 'metric', headerName: '지표', width: 110, headerAlign: 'center', align: 'center' },
                  { field: 'score', headerName: '이상점수', width: 110, headerAlign: 'center', align: 'center' },
                  { field: 'rul', headerName: 'RUL(%)', width: 100, headerAlign: 'center', align: 'center' },
                  { field: 'severity', headerName: '심각도', width: 100, headerAlign: 'center', align: 'center',
                    renderCell: (p) => <Chip size="small" label={p.value} color={p.value === '경고' ? 'error' : 'warning'} /> },
                  { field: 'status', headerName: '상태', width: 100, headerAlign: 'center', align: 'center' },
                ] as GridColDef[]}
                pageSizeOptions={[5]}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-columnHeaders': { textAlign: 'center' },
                  '& .MuiDataGrid-cell': { justifyContent: 'center' }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== 2행: 24h 이상점수(또는 MAE) 트렌드 + 기준선 ===== */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ height: 360 }}>
            <CardContent sx={{ height: '100%' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6">이상점수 트렌드 (24h)</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={`기준선 ${BASELINE}`} color="warning" variant="outlined" />
                  <Chip size="small" label={`경고선 ${CRITICAL}`} color="error" variant="outlined" />
                </Stack>
              </Stack>

              <Box sx={{ height: '85%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={anomalyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={BASELINE} stroke="#ff9800" strokeDasharray="6 6" ifOverflow="extendDomain" />
                    <ReferenceLine y={CRITICAL} stroke="#d32f2f" strokeDasharray="6 6" ifOverflow="extendDomain" />
                    <Line type="monotone" dataKey="score" stroke="#42a5f5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== 3행: 최근 수리 이력 ===== */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5, textAlign: 'center' }}>최근 수리 이력</Typography>
              <DataGrid
                autoHeight
                rows={maintenanceRows}
                columns={([
                  { field: 'date', headerName: '일자', width: 110, headerAlign: 'center', align: 'center' },
                  { field: 'line', headerName: '라인', width: 110, headerAlign: 'center', align: 'center' },
                  { field: 'robot', headerName: '로봇', width: 100, headerAlign: 'center', align: 'center' },
                  { field: 'part', headerName: '부품', width: 140, headerAlign: 'center', align: 'center' },
                  { field: 'action', headerName: '작업', width: 120, headerAlign: 'center', align: 'center' },
                  { field: 'result', headerName: '결과', width: 140, headerAlign: 'center', align: 'center' },
                  { field: 'mttrMin', headerName: 'MTTR(분)', width: 110, headerAlign: 'center', align: 'center' },
                  { field: 'engineer', headerName: '담당', width: 110, headerAlign: 'center', align: 'center' },
                  {
                    field: 'status', headerName: '상태', width: 120, headerAlign: 'center', align: 'center',
                    renderCell: (p) => <Chip size="small" label={p.value} color={p.value === '완료' ? 'success' : 'warning'} />
                  },
                ]) as GridColDef<MaintRow>[]}
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-columnHeaders': { textAlign: 'center' },
                  '& .MuiDataGrid-cell': { justifyContent: 'center' }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1.5, color: 'text.secondary' }}>
        마지막 업데이트: {nowTxt} KST
      </Typography>
    </Container>
  );
}
