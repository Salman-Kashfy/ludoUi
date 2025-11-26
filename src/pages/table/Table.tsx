import { GalleryHorizontal } from "lucide-react"
import { Fragment, useState, useEffect, useContext } from "react"
import PageTitle from "../../components/PageTitle"
import { Box, IconButton, Card, CardContent, Typography, Stack, Divider, Chip, CircularProgress } from "@mui/material";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetTables, DeleteTable } from "../../services/table.service"
import { useToast } from "../../utils/toast"
import { DataGrid } from '@mui/x-data-grid';
import {Pencil, Trash2} from 'lucide-react';
import { NavLink } from "react-router-dom"
import { PERMISSIONS, ROUTES } from "../../utils/constants"
import { hasPermission } from "../../utils/permissions";
import ResponsiveTableContainer from "../../components/ResponsiveTableContainer";
import AppDialog from "../../components/AppDialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function Table() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast, successToast } = useToast()
    const [loading, setLoading] = useState(true);
    const [tables, setTables] = useState<any[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTableUuid, setDeleteTableUuid] = useState<string>('');
    const [deleteTableName, setDeleteTableName] = useState<string>('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const btn = {
        to: ROUTES.TABLE.CREATE,
        label: 'Add Table',
        color: 'primary',
        show: hasPermission(PERMISSIONS.TABLE.UPSERT),
    }

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { 
            field: 'category', 
            headerName: 'Category', 
            width: 200,
            renderCell: (params: any) => {
                const category = params.value;
                return category ? category.name : '-';
            }
        },
        { field: 'sortNo', headerName: 'Sort No', width: 120 },
        { 
            field: 'action', 
            headerName: 'Action',
            width: 150,
            renderCell: (params: any) => {
                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton color="info" size="small" component={NavLink} to={ROUTES.TABLE.EDIT(params.row.id)}>
                            <Pencil size={20} strokeWidth={1.5} />
                        </IconButton>
                        {hasPermission(PERMISSIONS.TABLE.DELETE) && (
                            <IconButton 
                                color="error" 
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTableUuid(params.row.id);
                                    setDeleteTableName(params.row.name);
                                    setDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 size={18} />
                            </IconButton>
                        )}
                    </Box>
                );
            }
        }

    ];

    const loadTables = () => {
        setLoading(true);
        GetTables({companyUuid: companyContext.companyUuid}).then((res:any) => {
            setTables(res.list.map((e:any) => {
                return {
                    id: e.uuid,
                    name: e.name,
                    category: e.category,
                    sortNo: e.sortNo,
                    action: null // Placeholder, actual rendering happens in renderCell
                }
            }));
        }).catch(() => {
            errorToast('Failed to load tables');
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        loadTables();
    }, [companyContext.companyUuid]);

    const handleDeleteTable = () => {
        setDeleteLoading(true);
        DeleteTable(deleteTableUuid).then((res) => {
            if(res.status) {
                successToast('Table deleted successfully');
                setDeleteDialogOpen(false);
                setDeleteTableUuid('');
                setDeleteTableName('');
                loadTables();
            } else {
                errorToast(res.errorMessage || 'Failed to delete table');
            }
        }).catch(() => {
            errorToast('Failed to delete table');
        }).finally(() => {
            setDeleteLoading(false);
        });
    };

    const handleCloseDeleteDialog = () => {
        if (!deleteLoading) {
            setDeleteDialogOpen(false);
            setDeleteTableUuid('');
            setDeleteTableName('');
        }
    };

    const handleDeleteClick = (table: any) => {
        setDeleteTableUuid(table.id);
        setDeleteTableName(table.name);
        setDeleteDialogOpen(true);
    };

    const renderMobileList = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!tables.length) {
            return (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
                    No tables found.
                </Typography>
            );
        }

        return (
            <Stack spacing={2} sx={{ p: 2 }}>
                {tables.map((table) => (
                    <Card key={table.id} variant="outlined">
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>{table.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Sort No: {table.sortNo ?? '-'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton color="info" size="small" component={NavLink} to={ROUTES.TABLE.EDIT(table.id)}>
                                        <Pencil size={20} strokeWidth={1.5} />
                                    </IconButton>
                                    {hasPermission(PERMISSIONS.TABLE.DELETE) && (
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteClick(table)}
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Category
                                </Typography>
                                {table.category ? (
                                    <Chip label={table.category.name} size="small" color="primary" variant="outlined" />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">-</Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    };
    
    return (
        <Fragment>
            <PageTitle title="Table" titleIcon={<GalleryHorizontal />} btn={btn} />
            {isMobile ? (
                renderMobileList()
            ) : (
                <Card>
                    <CardContent>
                        <ResponsiveTableContainer>
                            <Box sx={{ p: 2 }}>
                                <DataGrid
                                    rows={tables}
                                    columns={columns}
                                    loading={loading}
                                    sx={{ border: 0 }}
                                    hideFooter
                                    autoHeight
                                />
                            </Box>
                        </ResponsiveTableContainer>
                    </CardContent>
                </Card>
            )}
            <AppDialog
                open={deleteDialogOpen}
                handleDialogClose={handleCloseDeleteDialog}
                title="Delete Table"
                body={`Are you sure you want to delete the table "${deleteTableName}"? This action cannot be undone.`}
                dialogBtnLoading={deleteLoading}
                dialogBtnLabel="Delete"
                onSubmit={handleDeleteTable}
            />
        </Fragment>
    )
}

export default Table

