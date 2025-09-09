'use client';

import { Box, Grid, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Row = {
  id: number;
  date: string;       // YYYY-MM-DD
  line: string;
  robot: string;
  part: string;
  action: string;     // 교체/청소/조정 등
  result: string;     // 정상/추가점검필요 등
  mttrMin: number;    // 수리 소요(분)
  engineer: string;
  status: '완료' | '진행중';
};

const rows: Row[] = [
  { id: 1, date: '2025-09-09', line: 'WELD-A', robot: 'R03', part: '전극팁', action: '교체', result: '정상', mttrMin: 18, engineer: 'Kim',  status: '완료' },
  { id: 2, date: '2025-09-09', line: 'WELD-B', robot: 'R02', part: '케이블', action: '점검', result: '추가점검필요', mttrMin: 35, engineer: 'Lee', status: '진행중' },
  { id: 3, date: '2025-09-08', line: 'WELD-A', robot: 'R01', part: '베어링', action: '윤활', result: '정상', mttrMin: 22, engineer: 'Park', status: '완료' },
];

export default function MaintenancePage() {
  const weekCnt = rows.length;
  const avgMttr = Math.round(rows.reduce((a,b)=>a+b.mttrMin,0) / rows.length);

  const columns: GridColDef<Row>[] = [
    { field: 'date', headerName: '일자', width: 110 },
    { field: 'line', headerName: '라인', width: 110 },
    { field: 'robot', headerName: '로봇', width: 100 },
    { field: 'part', headerName: '부품', width: 140 },
    { field: 'action', headerName: '작업', width: 120 },
    { field: 'result', headerName: '결과', width: 140 },
    { field: 'mttrMin', headerName: 'MTTR(분)', width: 110 },
    { field: 'engineer', headerName: '담당', width: 110 },
    {
      field: 'status', headerName: '상태', width: 120,
      renderCell: (p) => <Chip size="small" label={p.value} color={p.value === '완료' ? 'success' : 'warning'} />
    },
  ];

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {/* KPI */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="overline">이번 주 수리 건수</Typography>
            <Typography variant="h4">{weekCnt}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="overline">평균 MTTR</Typography>
            <Typography variant="h4">{avgMttr}분</Typography>
          </CardContent></Card>
        </Grid>

        {/* 표 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>수리 이력</Typography>
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
