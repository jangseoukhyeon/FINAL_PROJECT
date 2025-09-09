'use client';

import { Box, Grid, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Status = 0 | 1 | 2;
type Row = {
  id: number;
  line: string;
  robot: string;
  station: string;
  mae: number;
  status: Status;
  cycle: number;         // sec
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

const statusMeta: Record<Status, {label: string; color: 'success'|'warning'|'error'}> = {
  0: { label: '정상', color: 'success' },
  1: { label: '주의', color: 'warning' },
  2: { label: '경고', color: 'error'   },
};

export default function LinesPage() {
  // 간단 KPI
  const uptime = Math.round((rows.filter(r => r.running).length / rows.length) * 100);
  const avgCycle = rows.reduce((a,b)=>a+b.cycle,0) / rows.length;
  const uph = Math.round(3600 / avgCycle);
  const warnCount = rows.filter(r => r.status === 1).length;
  const alarmCount = rows.filter(r => r.status === 2).length;

  const columns: GridColDef<Row>[] = [
    { field: 'line', headerName: '라인', width: 110 },
    { field: 'station', headerName: '스테이션', width: 110 },
    { field: 'robot', headerName: '로봇', width: 100 },
    { field: 'mae', headerName: 'MAE', width: 110, valueFormatter: p => p.value.toFixed(3) },
    {
      field: 'status', headerName: '상태', width: 120,
      renderCell: (p) => {
        const s = statusMeta[p.value as Status];
        return <Chip size="small" label={s.label} color={s.color} />;
      }
    },
    { field: 'cycle', headerName: '사이클(sec)', width: 130, valueFormatter: p => p.value.toFixed(1) },
    {
      field: 'running', headerName: 'RUN/IDLE', width: 120,
      renderCell: (p) => <Chip size="small" label={p.value ? 'RUN' : 'IDLE'} variant="outlined" />
    },
    { field: 'updatedAt', headerName: '업데이트', width: 170 },
  ];

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {/* KPI */}
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography variant="overline">가동률</Typography>
            <Typography variant="h4">{uptime}%</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography variant="overline">평균 사이클</Typography>
            <Typography variant="h4">{avgCycle.toFixed(1)}s</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography variant="overline">UPH(추정)</Typography>
            <Typography variant="h4">{uph}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Stack direction="row" spacing={2} alignItems="baseline">
              <div>
                <Typography variant="overline">경고</Typography>
                <Typography variant="h4">{alarmCount}</Typography>
              </div>
              <div>
                <Typography variant="overline">주의</Typography>
                <Typography variant="h4">{warnCount}</Typography>
              </div>
            </Stack>
          </CardContent></Card>
        </Grid>

        {/* 표 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>로봇 상태</Typography>
              <div style={{ height: 480, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} pageSizeOptions={[5,10]} initialState={{ pagination:{ paginationModel:{ pageSize: 8 }}}}/>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
