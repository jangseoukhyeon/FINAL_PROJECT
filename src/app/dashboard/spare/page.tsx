'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  LineChart,
  PieChart,
  pieArcLabelClasses,
} from '@mui/x-charts';

/* =========================
   샘플 데이터
   ========================= */
type Row = {
  id: number; part: string; partNo: string; location: string;
  onHand: number; minQty: number; vendor?: string;
};
const rows: Row[] = [
  { id: 1, part: '전극팁', partNo: 'ELE-TP-12', location: 'A-01', onHand: 24, minQty: 20, vendor: 'Hyosung' },
  { id: 2, part: '케이블', partNo: 'CAB-7M-02', location: 'B-11', onHand: 3, minQty: 5, vendor: 'LS' },
];

type UsageLog = { id: number; date: string; partNo: string; qty: number };
const usageLogs: UsageLog[] = [
  { id: 1, date: '2025-09-07', partNo: 'ELE-TP-12', qty: 2 },
  { id: 2, date: '2025-09-14', partNo: 'ELE-TP-12', qty: 6 },
  { id: 3, date: '2025-09-07', partNo: 'CAB-7M-02', qty: 1 },
];

type InboundLog = { id: number; date: string; partNo: string; qty: number };
const inboundLogs: InboundLog[] = [
  { id: 1, date: '2025-09-14', partNo: 'TDK-14', qty: 2 },
];

/* =========================
   페이지 컴포넌트
   ========================= */
export default function Page(): React.JSX.Element {
  const columns: GridColDef<Row>[] = [
    { field: 'part', headerName: '품목', flex: 1 },
    { field: 'partNo', headerName: '품번', flex: 1 },
    { field: 'location', headerName: '위치', flex: 1 },
    { field: 'vendor', headerName: '업체', flex: 1 },
    { field: 'onHand', headerName: '재고', flex: 1 },
    { field: 'minQty', headerName: '최소재고', flex: 1 },
  ];

  const usageColumns: GridColDef<UsageLog>[] = [
    { field: 'date', headerName: '날짜', flex: 1 },
    { field: 'partNo', headerName: '품번', flex: 1 },
    { field: 'qty', headerName: '수량', flex: 1 },
  ];

  const usageByPart = [
    { id: 'ELE-TP-12', value: 6, label: 'ELE-TP-12' },
    { id: 'CAB-7M-02', value: 1, label: 'CAB-7M-02' },
  ];
  const inboundByPart = [
    { id: 'TDK-14', value: 2, label: 'TDK-14' },
  ];

  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {/* 품목현황 */}
      <Card sx={{ width: 800, height: 350, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>품목현황</Typography>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{ flex: 1 }}
          />
        </CardContent>
      </Card>

      {/* 사용실적 */}
      <Card sx={{ width: 400, height: 350, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>사용실적</Typography>
          <DataGrid
            rows={usageLogs}
            columns={usageColumns}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{ flex: 1 }}
          />
        </CardContent>
      </Card>

      {/* 사용량 추이 */}
      <Card sx={{ width: 800, height: 350, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>사용량 추이</Typography>
          <LineChart
            height={250}
            xAxis={[{ data: ['2025-09-07', '2025-09-14'], scaleType: 'point' }]}
            series={[
              { label: 'ELE-TP-12', data: [2, 6] },
              { label: 'CAB-7M-02', data: [1, 1] },
            ]}
          />
        </CardContent>
      </Card>

      {/* 사용량/입고량 파이 */}
      <Card sx={{ width: 400, height: 350, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>사용량/입고량 파이</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <PieChart
              width={120}
              height={120}
              series={[{ data: usageByPart, arcLabel: (item) => `${item.value}` }]}
              sx={{ [`& .${pieArcLabelClasses.root}`]: { fill: 'white', fontSize: 10 } }}
            />
            <PieChart
              width={120}
              height={120}
              series={[{ data: inboundByPart, arcLabel: (item) => `${item.value}` }]}
              sx={{ [`& .${pieArcLabelClasses.root}`]: { fill: 'white', fontSize: 10 } }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
