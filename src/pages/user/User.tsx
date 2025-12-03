import { User as UserIcon, Phone, Calendar, Search, Plus, Edit, Mail } from "lucide-react"
import { Fragment, useState, useEffect, useContext, useCallback } from "react"
import PageTitle from "../../components/PageTitle"
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Avatar, Pagination, TextField, InputAdornment, Button, IconButton, Chip } from "@mui/material";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetUsers } from "../../services/user.service"
import { useToast } from "../../utils/toast"
import { DataGrid, GridPaginationModel, GridActionsCellItem } from '@mui/x-data-grid';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from "dayjs";
import { constants } from "../../utils/constants";
import { debounce } from "@mui/material/utils";
import SaveUser from "../../components/SaveUser";

function User() {
    const companyContext: any = useContext(CompanyContext)
    const { errorToast } = useToast()
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: constants.PER_PAGE,
    });
    const [paginationInfo, setPaginationInfo] = useState({
        totalPages: 0,
        totalResultCount: 0,
    });
    const [saveUserDialogOpen, setSaveUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Get initials for avatar
    const getInitials = (firstName: string, lastName: string) => {
        const first = firstName?.charAt(0)?.toUpperCase() || '';
        const last = lastName?.charAt(0)?.toUpperCase() || '';
        return first + last || '?';
    };

    // Get avatar color based on name
    const getAvatarColor = (name: string) => {
        const colors = [
            theme.palette.primary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main,
            theme.palette.info.main,
        ];
        const index = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setSaveUserDialogOpen(true);
    };

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        setSaveUserDialogOpen(true);
    };

    const handleUserSaved = (user: any) => {
        // Reload users after create/update
        loadUsers(paginationModel.page + 1, searchText);
    };

    const columns = [
        { 
            field: 'fullName', 
            headerName: 'User', 
            flex: 1,
            minWidth: 250,
            renderCell: (params: any) => {
                const row = params.row;
                const initials = getInitials(row.firstName || '', row.lastName || '');
                const color = getAvatarColor(row.fullName || '');
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                            sx={{ 
                                bgcolor: color, 
                                width: 36, 
                                height: 36,
                                fontSize: '0.875rem',
                                fontWeight: 600
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={500} component="span">
                                {row.fullName || '-'} {row.role?.name && (
                                <Chip 
                                    label={row.role.name} 
                                    size="small" 
                                    sx={{ 
                                        height: 20, 
                                        fontSize: '0.7rem',
                                        mt: 0.5
                                    }} 
                                />
                            )}
                            </Typography>
                            
                        </Box>
                    </Box>
                );
            }
        },
        { 
            field: 'email', 
            headerName: 'Email', 
            flex: 1,
            minWidth: 200,
            renderCell: (params: any) => {
                if (!params.value) return <Typography variant="body2" color="text.secondary">-</Typography>;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Mail size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2">{params.value}</Typography>
                    </Box>
                );
            }
        },
        { 
            field: 'phone', 
            headerName: 'Phone', 
            flex: 1,
            minWidth: 150,
            renderCell: (params: any) => {
                if (!params.value) return <Typography variant="body2" color="text.secondary">-</Typography>;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2">{params.value}</Typography>
                    </Box>
                );
            }
        },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 120,
            renderCell: (params: any) => {
                const status = params.value || 'ACTIVE';
                const color = status === 'ACTIVE' ? 'success' : 'error';
                return (
                    <Chip 
                        label={status} 
                        color={color}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                );
            }
        },
        { 
            field: 'createdAt', 
            headerName: 'Registered', 
            flex: 1,
            minWidth: 180,
            renderCell: (params: any) => {
                if (!params.value) return <Typography variant="body2" color="text.secondary">-</Typography>;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calendar size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color="text.secondary">
                            {dayjs(params.value).format('MMM DD, YYYY')}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params: any) => [
                <GridActionsCellItem
                    icon={<Edit size={18} />}
                    label="Edit"
                    onClick={() => handleEditUser(params.row)}
                />,
            ],
        },
    ];

    const loadUsers = useCallback((page: number = 1, search: string = '') => {
        setLoading(true);
        const params: any = {};
        if (search) {
            params.searchText = search;
        }
        // Note: Backend may require status and companyId in UserFilter
        // If you get validation errors, you may need to add:
        // params.status = 'ACTIVE';
        // params.companyId = <companyId number>;
        
        GetUsers({ page, limit: constants.PER_PAGE }, params).then((res:any) => {
            setUsers(res.list.map((e:any) => {
                // Construct phone from phoneCode and phoneNumber
                const phone = (e.phoneCode && e.phoneNumber) 
                    ? `${e.phoneCode}${e.phoneNumber}` 
                    : '';
                return {
                    id: e.uuid,
                    fullName: e.fullName || `${e.firstName || ''} ${e.middleName || ''} ${e.lastName || ''}`.trim(),
                    firstName: e.firstName,
                    middleName: e.middleName,
                    lastName: e.lastName,
                    email: e.email || '',
                    phone: phone,
                    phoneCode: e.phoneCode || '',
                    phoneNumber: e.phoneNumber || '',
                    role: e.role || {},
                    status: e.status || 'ACTIVE',
                    gender: e.gender || '',
                    createdAt: e.createdAt || '',
                }
            }));
            if (res.paging) {
                setPaginationInfo({
                    totalPages: res.paging.totalPages || 0,
                    totalResultCount: res.paging.totalResultCount || 0,
                });
            }
        }).catch(() => {
            errorToast('Failed to load users');
        }).finally(() => {
            setLoading(false);
        });
    }, [companyContext.companyUuid, errorToast]);

    // Handle pagination changes (when search is not active or cleared)
    useEffect(() => {
        // Only load if search is empty or search has been applied
        if (searchText === '') {
            loadUsers(paginationModel.page + 1, '');
        }
    }, [paginationModel.page, paginationModel.pageSize, companyContext.companyUuid, searchText, loadUsers]);

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((search: string) => {
            setPaginationModel(prev => ({ ...prev, page: 0 }));
            loadUsers(1, search);
        }, 500),
        [loadUsers]
    );

    // Handle search text changes
    useEffect(() => {
        debouncedSearch(searchText);
        return () => {
            debouncedSearch.clear();
        };
    }, [searchText, debouncedSearch]);

    const handlePaginationChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setPaginationModel(prev => ({ ...prev, page: page - 1 }));
    };

    const renderMobileList = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!users.length) {
            return (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    px: 2 
                }}>
                    <UserIcon size={48} color={theme.palette.text.secondary} style={{ opacity: 0.5, margin: '0 auto 16px' }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Users will appear here once they are created
                    </Typography>
                </Box>
            );
        }

        return (
            <Stack spacing={2} sx={{ p: 2 }}>
                {users.map((user) => {
                    const initials = getInitials(user.firstName || '', user.lastName || '');
                    const color = getAvatarColor(user.fullName || '');
                    return (
                        <Card 
                            key={user.id} 
                            variant="outlined"
                            sx={{
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    boxShadow: theme.shadows[4],
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: color, 
                                            width: 48, 
                                            height: 48,
                                            fontSize: '1rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {initials}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {user.fullName} {user.role?.name && (
                                                    <Chip 
                                                        label={user.role.name} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 20, 
                                                            fontSize: '0.7rem',
                                                            mt: 0.5
                                                        }} 
                                                    />
                                                )}
                                                </Typography>
                                                
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditUser(user)}
                                                sx={{ ml: 1 }}
                                            >
                                                <Edit size={16} />
                                            </IconButton>
                                        </Box>
                                        {user.email && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Mail size={16} color={theme.palette.text.secondary} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        )}
                                        {user.phone && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Phone size={16} color={theme.palette.text.secondary} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.phone}
                                                </Typography>
                                            </Box>
                                        )}
                                        {user.createdAt && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Calendar size={16} color={theme.palette.text.secondary} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Registered {dayjs(user.createdAt).format('MMM DD, YYYY')}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        );
    };
    
    return (
        <Fragment>
            <PageTitle title="Users" titleIcon={<UserIcon />} />
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, email or phone number..."
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
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleCreateUser}
                    sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
                >
                    Create User
                </Button>
            </Box>
            {isMobile ? (
                <>
                    {renderMobileList()}
                    {paginationInfo.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                            <Pagination
                                count={paginationInfo.totalPages}
                                page={paginationModel.page + 1}
                                onChange={handlePaginationChange}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            ) : (
                <Card 
                    sx={{ 
                        boxShadow: theme.shadows[2],
                        borderRadius: 2,
                        overflow: 'hidden',
                        width: '100%'
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                            <Box sx={{ width: '100%', minWidth: 0 }}>
                                <Box sx={{ p: 2 }}>
                                    <DataGrid
                                        rows={users}
                                        columns={columns as any}
                                        loading={loading}
                                        paginationModel={paginationModel}
                                        onPaginationModelChange={setPaginationModel}
                                        pageSizeOptions={[10, 25, 50, 100]}
                                        rowCount={paginationInfo.totalResultCount}
                                        paginationMode="server"
                                        sx={{ 
                                            border: 0,
                                            width: '100%',
                                            '& .MuiDataGrid-cell': {
                                                borderBottom: `1px solid ${theme.palette.divider}`,
                                            },
                                            '& .MuiDataGrid-columnHeaders': {
                                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                                borderBottom: `2px solid ${theme.palette.divider}`,
                                                fontWeight: 600,
                                            },
                                            '& .MuiDataGrid-row:hover': {
                                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                            },
                                        }}
                                        autoHeight
                                        disableRowSelectionOnClick
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}
            <SaveUser
                open={saveUserDialogOpen}
                handleDialogClose={() => {
                    setSaveUserDialogOpen(false);
                    setEditingUser(null);
                }}
                onUserSaved={handleUserSaved}
                user={editingUser}
            />
        </Fragment>
    )
}

export default User

