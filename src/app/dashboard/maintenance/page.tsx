'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  useTheme,
  Select,
} from '@mui/material';

import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';

import DownloadIcon from '@mui/icons-material/Download';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';

// 🎨 색상 팔레트 import
import {
  stormGrey,
  redOrange,
  california,
  kepple,
  neonBlue,
} from '@/styles/theme/colors';

// ------------------
// Types & Mock Data
// ------------------
export type Row = {
  id: number;
  date: string;
  line: string;
  robot: string;
  part: string;
  action: string;
  result: string;
  mttrMin: number;
  engineer: string;
  status: '완료' | '진행중';
};

const initialRows: Row[] = [
  { id: 1, date: '2025-09-13', line: 'LINE 02', robot: 'R02', part: '베어링', action: '점검', result: '이상감지', mttrMin: 40, engineer: '자동생성', status: '진행중' },
  { id: 2, date: '2025-09-13', line: 'LINE 02', robot: 'R06', part: '기타', action: '점검', result: '추가점검필요', mttrMin: 20, engineer: '자동생성', status: '진행중' },
  { id: 3, date: '2025-09-13', line: 'LINE 02', robot: 'R08', part: '기타', action: '점검', result: '추가점검필요', mttrMin: 20, engineer: '자동생성', status: '진행중' },
];

// ------------------
// Helpers
// ------------------
const resultColor = (v: string): 'success' | 'warning' | 'error' | 'default' => {
  if (v === '정상') return 'success';
  if (v.includes('추가') || v.includes('점검')) return 'warning';
  if (v.includes('이상')) return 'error';
  return 'default';
};

const statusColor = (v: Row['status']): 'success' | 'warning' =>
  v === '완료' ? 'success' : 'warning';

function toCsv(rows: Row[]): string {
  const header = ['id','date','line','robot','part','action','result','mttrMin','engineer','status'];
  const esc = (val: unknown) => {
    const s = String(val ?? '');
    const needs = /[",\n\r]/.test(s);
    const body = s.replace(/"/g, '""');
    return needs ? `"${body}"` : body;
  };
  const body = rows.map(r => header.map(h => esc((r as any)[h])).join(','));
  return [header.join(','), ...body].join('\r\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ------------------
// Component
// ------------------
export default function MaintenancePage(): React.JSX.Element {
  const theme = useTheme();
  const [rows, setRows] = React.useState<Row[]>(initialRows);

  const [dateFrom, setDateFrom] = React.useState<Dayjs | null>(dayjs().subtract(7, 'day'));
  const [dateTo, setDateTo] = React.useState<Dayjs | null>(dayjs());
  const [q, setQ] = React.useState('');
  const [line, setLine] = React.useState<string>('ALL');
  const [robot, setRobot] = React.useState<string>('ALL');
  const [status, setStatus] = React.useState<'ALL' | Row['status']>('ALL');

  const lines = React.useMemo(() => Array.from(new Set(rows.map(r => r.line))), [rows]);
  const robots = React.useMemo(() => Array.from(new Set(rows.map(r => r.robot))), [rows]);

  const filtered = React.useMemo(() => {
    return rows.filter(r => {
      const d = dayjs(r.date, 'YYYY-MM-DD');
      const matchDate =
        (!dateFrom || d.isSame(dateFrom, 'day') || d.isAfter(dateFrom, 'day')) &&
        (!dateTo || d.isSame(dateTo, 'day') || d.isBefore(dateTo, 'day'));
      const matchLine = line === 'ALL' || r.line === line;
      const matchRobot = robot === 'ALL' || r.robot === robot;
      const matchStatus = status === 'ALL' || r.status === status;
      const matchQ = q
        ? [r.line, r.robot, r.part, r.action, r.result, r.engineer].some(v =>
            v.toLowerCase().includes(q.toLowerCase())
          )
        : true;
      return matchDate && matchLine && matchRobot && matchStatus && matchQ;
    });
  }, [rows, dateFrom, dateTo, line, robot, status, q]);

  // KPIs
  const weekCnt = filtered.length;
  const avgMttr = filtered.length
    ? Math.round(filtered.reduce((a, b) => a + b.mttrMin, 0) / filtered.length)
    : 0;
  const doneCnt = filtered.filter(r => r.status === '완료').length;
  const progressCnt = filtered.filter(r => r.status === '진행중').length;
  const doneRate = filtered.length ? Math.round((doneCnt / filtered.length) * 100) : 0;

  const mttrDist = React.useMemo(
    () => filtered.map(r => ({ name: r.id, mttr: r.mttrMin })),
    [filtered]
  );

  const columns: GridColDef<Row>[] = [
    { field: 'date', headerName: '일자', width: 110 },
    { field: 'line', headerName: '라인', width: 110 },
    { field: 'robot', headerName: '로봇', width: 100 },
    { field: 'part', headerName: '부품', width: 140 },
    { field: 'action', headerName: '작업', width: 120 },
    {
      field: 'result',
      headerName: '결과',
      width: 140,
      renderCell: p => (
        <Chip
          size="small"
          label={p.value}
          color={resultColor(String(p.value))}
          variant="outlined"
        />
      ),
    },
    {
      field: 'mttrMin',
      headerName: 'MTTR(분)',
      width: 120,
      renderCell: p => {
        const v = p.value as number;
        const sev: 'default' | 'warning' | 'error' =
          v >= 40 ? 'error' : v >= 25 ? 'warning' : 'default';
        return (
          <Chip
            size="small"
            variant="filled"
            color={sev === 'default' ? 'default' : sev}
            label={`${v}분`}
          />
        );
      },
    },
    { field: 'engineer', headerName: '담당', width: 110 },
    {
      field: 'status',
      headerName: '상태',
      width: 140,
      editable: true,
      renderCell: p => (
        <Chip size="small" label={p.value} color={statusColor(p.value)} />
      ),
      renderEditCell: (params: GridRenderEditCellParams) => (
        <Select
          value={params.value}
          onChange={e => {
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: e.target.value,
            });
          }}
          size="small"
          fullWidth
        >
          <MenuItem value="진행중">진행중</MenuItem>
          <MenuItem value="완료">완료</MenuItem>
        </Select>
      ),
    },
  ];

  function Toolbar() {
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          csvOptions={{
            fileName: `repair-history_${dayjs().format('YYYYMMDD_HHmm')}`,
          }}
        />
        <Box sx={{ flex: 1 }} />
        <TextField
          size="small"
          placeholder="검색: 라인/로봇/부품/담당"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <Tooltip title="CSV 내보내기(필터 적용)">
          <IconButton
            onClick={() =>
              downloadCsv(
                `repair-history-filtered_${dayjs().format('YYYYMMDD_HHmm')}.csv`,
                toCsv(filtered)
              )
            }
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 3, bgcolor: stormGrey[50], minHeight: '100vh' }}>
        
        {/* ✅ 상단 KPI 박스 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          <KpiBox><KpiCard icon={<BuildCircleIcon />} label="선택 구간 수리 건수" value={weekCnt} color={california[600]} /></KpiBox>
          <KpiBox><KpiCard icon={<AccessTimeIcon />} label="평균 MTTR" value={`${avgMttr}분`} color={neonBlue[600]} /></KpiBox>
          <KpiBox><KpiCard icon={<DoneAllIcon />} label="완료율" value={`${doneRate}%`} subText={`(완료 ${doneCnt} / 전체 ${filtered.length})`} color={kepple[600]} /></KpiBox>
          <KpiBox><KpiCard icon={<PendingActionsIcon />} label="진행중" value={progressCnt} color={redOrange[600]} /></KpiBox>
        </Box>

        {/* ✅ 필터 */}
        <Box sx={{ bgcolor: stormGrey[100], borderRadius: 2, border: `1px solid ${stormGrey[200]}`, p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <DatePicker label="시작일" value={dateFrom} onChange={setDateFrom} format="YYYY-MM-DD" />
            <DatePicker label="종료일" value={dateTo} onChange={setDateTo} format="YYYY-MM-DD" />
            <TextField select size="small" label="라인" value={line} onChange={e => setLine(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="ALL">ALL</MenuItem>
              {lines.map(l => (<MenuItem key={l} value={l}>{l}</MenuItem>))}
            </TextField>
            <TextField select size="small" label="로봇" value={robot} onChange={e => setRobot(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="ALL">ALL</MenuItem>
              {robots.map(r => (<MenuItem key={r} value={r}>{r}</MenuItem>))}
            </TextField>
            <TextField select size="small" label="상태" value={status} onChange={e => setStatus(e.target.value as any)} sx={{ minWidth: 160 }}>
              <MenuItem value="ALL">ALL</MenuItem>
              <MenuItem value="완료">완료</MenuItem>
              <MenuItem value="진행중">진행중</MenuItem>
            </TextField>
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" sx={{ whiteSpace: 'nowrap', minWidth: 120, px: 2 }}
              onClick={() => { setDateFrom(dayjs().subtract(7, 'day')); setDateTo(dayjs()); setLine('ALL'); setRobot('ALL'); setStatus('ALL'); setQ(''); }}
            >
              필터 초기화
            </Button>
          </Stack>
        </Box>

        {/* ✅ 수리 이력표 */}
        <Box sx={{ bgcolor: stormGrey[100], borderRadius: 2, border: `1px solid ${stormGrey[200]}`, p: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>수리 이력</Typography>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
              density="compact"
              slots={{ toolbar: Toolbar }}
              processRowUpdate={(newRow) => {
                setRows(prev => prev.map(r => (r.id === newRow.id ? newRow : r)));
                return newRow;
              }}
              onProcessRowUpdateError={err => console.error(err)}
            />
          </Box>
        </Box>

        {/* ✅ MTTR 차트 */}
        <Box sx={{ bgcolor: stormGrey[100], borderRadius: 2, border: `1px solid ${stormGrey[200]}`, p: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>MTTR 분포</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mttrDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickFormatter={v => `#${v}`} />
                <YAxis />
                <RTooltip formatter={(v: any) => `${v}분`} labelFormatter={l => `작업 ID: ${l}`} />
                <Bar dataKey="mttr" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

// ------------------
// KPI Card 컴포넌트
// ------------------
type PaletteKey = string;

function KpiCard({
  icon,
  label,
  value,
  subText,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subText?: string;
  color: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 40, height: 40, borderRadius: '50%',
          bgcolor: `${color}22`,
          color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="overline" sx={{ letterSpacing: 1, color: stormGrey[600] }}>{label}</Typography>
        <Typography variant="h5" fontWeight={800} color={stormGrey[700]}>{value}</Typography>
        {subText && <Typography variant="caption" color={stormGrey[500]}>{subText}</Typography>}
      </Box>
    </Stack>
  );
}

// ------------------
// KPI Box Wrapper
// ------------------
function KpiBox({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: stormGrey[100], borderRadius: 2, border: `1px solid ${stormGrey[200]}`, p: 2 }}>
      {children}
    </Box>
  );
}
