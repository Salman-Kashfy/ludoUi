import { Fragment, useState, useEffect, useContext, useCallback } from "react";
import {
    Box, Card, CardContent, Typography, Stack, CircularProgress, Avatar,
    Pagination, TextField, InputAdornment, IconButton, Chip
} from "@mui/material";
import { DataGrid, GridPaginationModel } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs, { Dayjs } from "dayjs";
import { DollarSign, Edit, Search } from "lucide-react";
import { constants } from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import { Payments } from "../../services/payment.service";
import { CompanyContext } from '../../hooks/CompanyContext';

import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { PickersShortcutsItem } from '@mui/x-date-pickers/PickersShortcuts';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';

type Payment = {
    uuid: string;
    customer?: { fullName?: string; phone?: string };
    amount?: number;
    taxAmount?: number;
    totalAmount?: number;
    tournamentId?: string;
    tableSessionId?: string;
    method?: string;
    status?: 'SUCCESS' | 'PENDING' | string;
    createdAt?: number;
};

function TournamentPlayerPayments() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
        dayjs().startOf('month').startOf('day'),
        dayjs().endOf('month').endOf('day')
    ]);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: constants.PER_PAGE,
    });
    const [pagingInfo, setPagingInfo] = useState({
        totalPages: 0,
        totalResultCount: 0,
    });

    const companyContext = useContext(CompanyContext);
    const companyUuid = companyContext?.companyUuid;

    const shortcutsItems: PickersShortcutsItem<[Dayjs | null, Dayjs | null]>[] = [
        { label: 'Today', getValue: () => [dayjs().startOf('day'), dayjs().endOf('day')] },
        {
            label: 'Yesterday', getValue: () => {
                const yesterday = dayjs().subtract(1, 'day');
                return [yesterday.startOf('day'), yesterday.endOf('day')];
            }
        },
        { label: 'Last 7 Days', getValue: () => [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
        {
            label: 'Last Month', getValue: () => [
                dayjs().subtract(1, 'month').startOf('month').startOf('day'),
                dayjs().subtract(1, 'month').endOf('month').endOf('day')
            ]
        },
        { label: 'Current Month', getValue: () => [dayjs().startOf('month').startOf('day'), dayjs().endOf('month').endOf('day')] },
        { label: 'Reset', getValue: () => [null, null] },
    ];

    const getInitials = (name: string) => (name?.charAt(0) || '?').toUpperCase();

    const columns = [
        {
            field: 'customer',
            headerName: 'Player',
            flex: 1,
            minWidth: 200,
            renderCell: (params: any) => {
                const customer = params?.value || {};
                const initials = getInitials(customer.fullName || '');
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36, fontSize: '0.875rem', fontWeight: 600 }}>
                            {initials}
                        </Avatar>
                        <Typography variant="body2">{customer.fullName || '-'} {'(+' + customer.phone + ')'}</Typography>
                    </Box>
                );
            },
        },
        { field: 'amount', headerName: 'SubTotal', width: 120, renderCell: (params: any) => <>₨ {params?.row?.amount || 0}</> },
        { field: 'taxAmount', headerName: 'Tax', width: 120, renderCell: (params: any) => <>₨ {params?.row?.taxAmount || 0}</> },
        { field: 'totalAmount', headerName: 'Total', width: 120, renderCell: (params: any) => <>₨ {params?.row?.totalAmount || 0}</> },
        {
            field: 'type', headerName: 'Type', width: 150, renderCell: (params: any) => {
                const row = params?.row;
                if (!row) return '-';
                if (row.tournamentId) return 'Tournament';
                if (row.tableSessionId) return 'Table';
                return '-';
            }
        },
        { field: 'method', headerName: 'Method', width: 150 },
        {
            field: 'status', headerName: 'Status', width: 150, renderCell: (params: any) => (
                <Chip label={params?.value || '-'} color={params?.value === 'SUCCESS' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 500 }} />
            )
        },
        {
            field: 'createdAt', headerName: 'Created At', flex: 1, minWidth: 180, renderCell: (params: any) => (
                <Typography variant="body2" color="text.secondary">
                    {params?.value ? dayjs(Number(params.value)).format('DD MMM, YYYY hh:mm A') : '-'}
                </Typography>
            )
        }
    ];

    const loadPayments = useCallback(async (page: number = 1, search: string = '') => {
        if (!companyUuid) return;
        setLoading(true);
        try {
            const startDate = dateRange[0]?.startOf('day').toISOString();
            const endDate = dateRange[1]?.endOf('day').toISOString();
            const res: any = await Payments(
                { page, limit: paginationModel.pageSize },
                { companyUuid, startDate, endDate, searchText: search }
            );
            if (res?.list) {
                setPayments(res.list);
                if (res.paging) setPagingInfo({ totalPages: res.paging.totalPages || 0, totalResultCount: res.paging.totalResultCount || 0 });
            } else {
                setPayments([]);
                setPagingInfo({ totalPages: 0, totalResultCount: 0 });
            }
        } catch (error) {
            console.error('Failed to load payments', error);
        } finally {
            setLoading(false);
        }
    }, [companyUuid, paginationModel.pageSize, dateRange]);

    // Debounced search + reload on dateRange change
    useEffect(() => {
        const timer = setTimeout(() => loadPayments(paginationModel.page + 1, searchText), 500);
        return () => clearTimeout(timer);
    }, [searchText, paginationModel.page, paginationModel.pageSize, dateRange, loadPayments]);

    const handlePaginationChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setPaginationModel(prev => ({ ...prev, page: page - 1 }));
    };

    const handleEditPayment = (payment: Payment) => {
        console.log('Edit payment', payment);
    };

    return (
        <Fragment>
            <PageTitle title="Tournament Player Payments" titleIcon={<DollarSign />} />

            {/* Filters */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ minWidth: 250 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateRangePicker
                            slots={{ field: SingleInputDateRangeField }}
                            name="allowedRange"
                            value={dateRange}
                            format="MMM DD, YYYY"
                            label="Select Daterange"
                            onChange={(values) => setDateRange([
                                values[0] ? values[0].startOf('day') : null,
                                values[1] ? values[1].endOf('day') : null
                            ])}
                            slotProps={{
                                textField: { variant: 'standard', sx: { width: '100%' } },
                                shortcuts: { items: shortcutsItems }
                            }}
                        />
                    </LocalizationProvider>
                </Box>

                <TextField
                    size="small"
                    fullWidth
                    placeholder="Search by player..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color={theme.palette.text.secondary} /></InputAdornment> }}
                    sx={{ flex: 1, minWidth: 200 }}
                />
            </Box>

            {/* List */}
            {isMobile ? (
                <>
                    <Stack spacing={2} sx={{ p: 2 }}>
                        {loading ? <CircularProgress sx={{ mx: 'auto', py: 4 }} /> :
                            payments.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <DollarSign size={48} color={theme.palette.text.secondary} style={{ opacity: 0.5, margin: '0 auto 16px' }} />
                                    <Typography variant="body1" color="text.secondary" fontWeight={500}>No payments found</Typography>
                                </Box>
                            ) :
                                payments.map(p => (
                                    <Card key={p.uuid} variant="outlined">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography fontWeight={600}>{p.customer?.fullName || '-'}</Typography>
                                                    <Typography variant="body2">
                                                        SubTotal: ₨ {p.amount || 0} | Tax: ₨ {p.taxAmount || 0} | Total: ₨ {p.totalAmount || 0}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {p.tournamentId ? 'Tournament' : p.tableSessionId ? 'Table Session' : '-'} | {p.method || '-'} | {p.status || '-'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {p.createdAt ? dayjs(Number(p.createdAt)).format('DD MMM, YYYY hh:mm A') : '-'}
                                                    </Typography>
                                                </Box>
                                                <IconButton onClick={() => handleEditPayment(p)}><Edit size={16} /></IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                    </Stack>
                    {pagingInfo.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                            <Pagination count={pagingInfo.totalPages} page={paginationModel.page + 1} onChange={handlePaginationChange} color="primary" size="large" />
                        </Box>
                    )}
                </>
            ) : (
                <Card sx={{ boxShadow: theme.shadows[2], borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                            <Box sx={{ p: 2 }}>
                                <DataGrid
                                    rows={payments}
                                    columns={columns as any}
                                    loading={loading}
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={setPaginationModel}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    rowCount={pagingInfo.totalResultCount}
                                    paginationMode="server"
                                    getRowId={(row) => row.uuid}
                                    autoHeight
                                    disableRowSelectionOnClick
                                />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Fragment>
    );
}

export default TournamentPlayerPayments;
