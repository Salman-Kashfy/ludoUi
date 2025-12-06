import { Fragment, useState, useEffect, useCallback } from "react";
import { 
    Box, Card, CardContent, Typography, Stack, CircularProgress, Avatar, 
    Pagination, TextField, InputAdornment, Button, IconButton, Chip 
} from "@mui/material";
import { DataGrid, GridPaginationModel, GridActionsCellItem } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from "dayjs";
import { DollarSign, Edit, Search, Plus } from "lucide-react";
import { constants } from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import { Payments } from "../../services/payment.service";

function TournamentPlayerPayments() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: constants.PER_PAGE,
    });
    const [pagingInfo, setPagingInfo] = useState({
        totalPages: 0,
        totalResultCount: 0,
    });
    const [savePaymentDialogOpen, setSavePaymentDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);

    // Helper functions
    const getInitials = (name: string) => (name?.charAt(0) || '?').toUpperCase();

    const handleCreatePayment = () => {
        setEditingPayment(null);
        setSavePaymentDialogOpen(true);
    };

    const handleEditPayment = (payment: any) => {
        setEditingPayment(payment);
        setSavePaymentDialogOpen(true);
    };

    const handlePaymentSaved = () => {
        loadPayments(paginationModel.page + 1, searchText);
    };

    // Columns for DataGrid (desktop)
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
                        <Typography variant="body2">{customer.fullName || '-'} { '(+' + customer.phone + ')'}</Typography>
                    </Box>
                );
            },
        },
        {
            field: 'amount',
            headerName: 'SubTotal',
            width: 120,
            renderCell: (params: any) => <>₨ {params?.row?.amount || 0}</>,
        },
        {
            field: 'taxAmount',
            headerName: 'Tax',
            width: 120,
            renderCell: (params: any) => <>₨ {params?.row?.taxAmount || 0}</>,
        },
        {
            field: 'totalAmount',
            headerName: 'Total',
            width: 120,
            renderCell: (params: any) => <>₨ {params?.row?.totalAmount || 0}</>,
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 150,
            renderCell: (params: any) => {
                const row = params?.row;
                if (!row) return 'aa-';
        
                if (row.tournamentId) return 'Tournament';
                if (row.tableSessionId) return 'Table';
        
                return '-';
            },
        },
        {
            field: 'method',
            headerName: 'Method',
            width: 150
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params: any) => (
                <Chip
                    label={params?.value || '-'}
                    color={params?.value === 'SUCCESS' ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 500 }}
                />
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            flex: 1,
            minWidth: 180,
            renderCell: (params: any) => (
                <Typography variant="body2" color="text.secondary">
                    {params?.value ? dayjs(Number(params.value)).format('DD MMM, YYYY hh:mm A') : '-'}
                </Typography>
            ),
        }
    ];

    // Load payments
    const loadPayments = useCallback(async (page: number = 1, search: string = '') => {
        setLoading(true);
        try {
            const res: any = await Payments({ page, limit: paginationModel.pageSize }, { searchText: search });
            if (res?.list) {
                setPayments(res.list);
                if (res.paging) {
                    setPagingInfo({
                        totalPages: res.paging.totalPages || 0,
                        totalResultCount: res.paging.totalResultCount || 0,
                    });
                }
            } else {
                setPayments([]);
                setPagingInfo({ totalPages: 0, totalResultCount: 0 });
            }
        } catch (error) {
            console.error('Failed to load payments', error);
        } finally {
            setLoading(false);
        }
    }, [paginationModel.pageSize]);

    useEffect(() => {
        loadPayments(paginationModel.page + 1, searchText);
    }, [paginationModel.page, paginationModel.pageSize, searchText, loadPayments]);

    useEffect(() => {
        const handler = setTimeout(() => loadPayments(1, searchText), 500);
        return () => clearTimeout(handler);
    }, [searchText, loadPayments]);

    const handlePaginationChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setPaginationModel(prev => ({ ...prev, page: page - 1 }));
    };

    // Mobile card view
    const renderMobileList = () => {
        if (loading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
        }
        if (!payments.length) {
            return (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <DollarSign size={48} color={theme.palette.text.secondary} style={{ opacity: 0.5, margin: '0 auto 16px' }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>No payments found</Typography>
                </Box>
            );
        }

        return (
            <Stack spacing={2} sx={{ p: 2 }}>
                {payments.map(p => (
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
                                <IconButton onClick={() => handleEditPayment(p)}>
                                    <Edit size={16} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    };

    return (
        <Fragment>
            <PageTitle title="Tournament Player Payments" titleIcon={<DollarSign />} />
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by player..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} color={theme.palette.text.secondary} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        }
                    }}
                />
            </Box>

            {isMobile ? (
                <>
                    {renderMobileList()}
                    {pagingInfo.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                            <Pagination
                                count={pagingInfo.totalPages}
                                page={paginationModel.page + 1}
                                onChange={handlePaginationChange}
                                color="primary"
                                size="large"
                            />
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
