'use client';

import * as React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Status = 0 | 1 | 2;

type Row = {
  id: number;
  line: string;
  robot: string;
  station: string;
  mae?: number;     // ← 혹시 없는 값이 들어와도 안전하게
  status?: Status;
  cycle?: number;   // sec
  running: boolean;
  updatedAt: string;
};

const rows: Row[] = [
  { id: 1, line: 'WELD-A', robot: 'R01', station: 'OP10', mae: 0.18, status: 0, cycle: 28.3, running: true,  updatedAt: '2025-09-09 15:20:10' },
  { id: 2, line: 'WELD-A', robot: 'R02', station: 'OP20', mae: 0.27, status: 1, cycle: 31.1, running: true,  updatedAt: '2025-09-09 15:20:12' },
  { id: 3, line: 'WELD-A', robot: 'R03', station: 'OP30', mae: 0.41, status: 2, cycle: 35.2, running: false, updatedAt: '2025-09-09 15:20:13' },
  { id: 4, line: 'WELD-A', robot: 'R04', station: 'OP40', mae: 0.21, status: 0, cycle: 29.4, running: true,  updatedAt: '2025-09-09 15:20:14' },
  { id: 5, line: 'WELD-B', robot: 'R01', station: 'OP10', mae: 0.33, status: 1, cycle: 30.6, running: true,  updatedAt: '2025-09-09 15:20:10' },
  { id: 6, line: 'WELD-B', robot: 'R02', station: 'OP20', mae: 0.37, status: 2, cycle: 36.9, running: false, updatedAt: '2025-09-09 15:20:11' },
  { id: 7, line: 'WELD-C', robot: 'R01', station: 'OP10', mae: 0.15, status: 0, cycle: 27.7, running: true,  updatedAt: '2025-09-09 15:20:10' },
  { id: 8, line: 'WELD-C', robot: 'R02', station: 'OP20', mae: 0.22, status: 0, cycle: 28.9, running: true,  updatedAt: '2025-09-09 15:20:12' },
];

const statusMeta: Record<Status, { label: string; color: 'success' | 'warning' | 'error' }> = {
  0: { label: '정상', color: 'success' },
  1: { label: '주의', color: 'warning' },
  2: { label: '경고', color: 'error' },
};

export default function LinesPage() {
  // KPI 계산 (undefined 안전 처리)
  const total = rows.length || 1;
  const runningCnt = rows.filter((r) => r.running).length;
  const uptime = Math.round((runningCnt / total) * 100);

  const cycles = rows.map((r) => r.cycle ?? 0);
  const avgCycle = cycles.reduce((a, b) => a + b, 0) / total;
  const uph = avgCycle > 0 ? Math.round(3600 / avgCycle) : 0;

  const warnCount = rows.filter((r) => r.status === 1).length;
  const alarmCount = rows.filter((r) => r.status === 2).length;

  const columns: GridColDef<Row>[] = [
    { field: 'line', headerName: '라인', width: 110 },
    { field: 'station', headerName: '스테이션', width: 110 },
    { field: 'robot', headerName: '로봇', width: 100 },
    {
      field: 'mae',
      headerName: 'MAE',
      width: 110,
      valueFormatter: (p) => (typeof p.value === 'number' ? p.value.toFixed(3) : '-'), // ✅ 안전
    },
    {
      field: 'status',
      headerName: '상태',
      width: 120,
      renderCell: (p) => {
        const s = statusMeta[(p.value as Status) ?? 0]; // 기본 '정상'
        return <Chip size="small" label={s.label} color={s.color} />;
      },
    },
    {
      field: 'cycle',
      headerName: '사이클(sec)',
      width: 130,
      valueFormatter: (p) => (typeof p.value === 'number' ? p.value.toFixed(1) : '-'), // ✅ 안전
    },
    {
      field: 'running',
      headerName: 'RUN/IDLE',
      width: 120,
      renderCell: (p) => <Chip size="small" label={p.value ? 'RUN' : 'IDLE'} variant="outlined" />,
    },
    { field: 'updatedAt', headerName: '업데이트', width: 170 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* KPI */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline">가동률</Typography>
              <Typography variant="h4">{uptime}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline">평균 사이클</Typography>
              <Typography variant="h4">{avgCycle > 0 ? `${avgCycle.toFixed(1)}s` : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline">UPH(추정)</Typography>
              <Typography variant="h4">{uph}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={3} alignItems="baseline">
                <div>
                  <Typography variant="overline">경고</Typography>
                  <Typography variant="h4">{alarmCount}</Typography>
                </div>
                <div>
                  <Typography variant="overline">주의</Typography>
                  <Typography variant="h4">{warnCount}</Typography>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 표 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                로봇 상태
              </Typography>
              <div style={{ height: 480, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSizeOptions={[5, 10]}
                  initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
                  disableRowSelectionOnClick
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
