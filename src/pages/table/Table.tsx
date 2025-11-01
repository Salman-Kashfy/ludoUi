import { GalleryHorizontal } from "lucide-react"
import { Fragment, useState, useEffect, useContext } from "react"
import PageTitle from "../../components/PageTitle"
import { Box, IconButton, Card, CardContent } from "@mui/material";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetTables, DeleteTable } from "../../services/table.service"
import { useToast } from "../../utils/toast"
import { DataGrid } from '@mui/x-data-grid';
import {Pencil, Trash2} from 'lucide-react';
import { NavLink } from "react-router-dom"
import { PERMISSIONS, ROUTES } from "../../utils/constants"
import { hasPermission } from "../../utils/permissions";
import AppDialog from "../../components/AppDialog";

function Table() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast, successToast } = useToast()
    const [loading, setLoading] = useState(true);
    const [tables, setTables] = useState<any[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTableUuid, setDeleteTableUuid] = useState<string>('');
    const [deleteTableName, setDeleteTableName] = useState<string>('');
    const [deleteLoading, setDeleteLoading] = useState(false);
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
    
    return (
        <Fragment>
            <PageTitle title="Table" titleIcon={<GalleryHorizontal />} btn={btn} />
            <Card>
                <CardContent>   
                    <Box sx={{p:2, width: '99%'}}>
                        <DataGrid
                            rows={tables}
                            columns={columns}
                            loading={loading}
                            sx={{ border: 0 }}
                            hideFooter
                        />
                    </Box>
                </CardContent>
            </Card>
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

