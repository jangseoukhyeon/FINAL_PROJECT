'use client';

import { Box, Grid, Card, CardContent, Typography, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Row = {
  id: number;
  part: string;
  partNo: string;
  location: string;
  onHand: number;
  minQty: number;
  vendor?: string;
};

const rows: Row[] = [
  { id: 1, part: '전극팁',     partNo: 'ELE-TP-12', location: 'A-01', onHand: 24, minQty: 20, vendor: 'Hyosung' },
  { id: 2, part: '케이블',     partNo: 'CAB-7M-02', location: 'B-11', onHand: 3,  minQty: 5,  vendor: 'LS' },
  { id: 3, part: '베어링',     partNo: 'BRG-6203Z', location: 'C-05', onHand: 12, minQty: 8,  vendor: 'NSK' },
  { id: 4, part: '팁드레서칼', partNo: 'TDK-14',    location: 'A-03', onHand: 1,  minQty: 4,  vendor: 'Kiswel' },
];

export default function SparePage() {
  const shortageCnt = rows.filter(r => r.onHand < r.minQty).length;
  const totalOnHand = rows.reduce((a,b)=>a+b.onHand,0);

  const columns: GridColDef<Row>[] = [
    { field: 'part', headerName: '품목', width: 160 },
    { field: 'partNo', headerName: '품번', width: 140 },
    { field: 'location', headerName: '위치', width: 100 },
    { field: 'vendor', headerName: '업체', width: 140 },
    { field: 'onHand', headerName: '재고', width: 100 },
    { field: 'minQty', headerName: '최소재고', width: 110 },
    {
      field: 'status', headerName: '상태', width: 120,
      valueGetter: (_v, row) => (row.onHand < row.minQty ? '재고부족' : '정상'),
      renderCell: (p) => {
        const ok = p.value === '정상';
        return <Chip size="small" label={p.value} color={ok ? 'success' : 'error'} />;
      }
    },
  ];

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {/* KPI */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="overline">재고부족 품목</Typography>
            <Typography variant="h4">{shortageCnt}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="overline">총 On-hand</Typography>
            <Typography variant="h4">{totalOnHand} EA</Typography>
          </CardContent></Card>
        </Grid>

        {/* 표 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>스페어 현황</Typography>
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
