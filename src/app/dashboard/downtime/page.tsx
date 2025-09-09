'use client';

import { Box, Grid, Card, CardContent, Typography, TextField, MenuItem, Stack, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

type Row = {
  id: number;
  date: string;       // YYYY-MM-DD
  start: string;      // HH:mm
  end: string;        // HH:mm
  line: string;
  station: string;
  reason: string;
  minutes: number;
  note?: string;
};

const allRows: Row[] = [
  { id: 1, date: '2025-09-09', start: '09:12', end: '09:32', line: 'WELD-A', station: 'OP20', reason: '전극교체', minutes: 20, note: '정기교체' },
  { id: 2, date: '2025-09-09', start: '10:05', end: '10:18', line: 'WELD-A', station: 'OP30', reason: '품종변경셋업', minutes: 13 },
  { id: 3, date: '2025-09-09', start: '11:41', end: '11:55', line: 'WELD-B', station: 'OP20', reason: '비상정지', minutes: 14, note: '안전스위치' },
  { id: 4, date: '2025-09-09', start: '13:20', end: '13:27', line: 'WELD-C', station: 'OP10', reason: '센서오류', minutes: 7 },
];

export default function DowntimePage() {
  const [line, setLine] = useState<string>('ALL');
  const [date, setDate] = useState<string>('2025-09-09');

  const rows = useMemo(() => {
    return allRows.filter(r => (line === 'ALL' || r.line === line) && (date ? r.date === date : true));
  }, [line, date]);

  const totalMin = rows.reduce((a,b)=>a+b.minutes,0);
  const topReason = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach(r => map.set(r.reason, (map.get(r.reason) ?? 0) + r.minutes));
    const arr = Array.from(map.entries()).sort((a,b)=>b[1]-a[1]);
    return arr[0]?.[0] ?? '-';
  }, [rows]);

  const columns: GridColDef<Row>[] = [
    { field: 'date', headerName: '일자', width: 110 },
    { field: 'start', headerName: '시작', width: 90 },
    { field: 'end', headerName: '종료', width: 90 },
    { field: 'line', headerName: '라인', width: 110 },
    { field: 'station', headerName: '스테이션', width: 120 },
    { field: 'reason', headerName: '사유', width: 160 },
    { field: 'minutes', headerName: '분', width: 80 },
    { field: 'note', headerName: '비고', flex: 1, minWidth: 200 },
  ];

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {/* 필터 */}
        <Grid item xs={12}>
          <P>test </P>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField label="일자" type="date" value={date} onChange={e=>setDate(e.target.value)} InputLabelProps={{ shrink: true }}/>
                <TextField select label="라인" value={line} onChange={e=>setLine(e.target.value)}>
                  <MenuItem value="ALL">ALL</MenuItem>
                  <MenuItem value="WELD-A">WELD-A</MenuItem>
                  <MenuItem value="WELD-B">WELD-B</MenuItem>
                  <MenuItem value="WELD-C">WELD-C</MenuItem>
                </TextField>
                <Chip label={`총 비가동 ${totalMin}분`} color={totalMin >= 30 ? 'error' : 'default'} />
                <Chip label={`Top 사유: ${topReason}`} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 표 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>비가동 일지</Typography>
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
