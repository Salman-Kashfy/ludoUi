import { GalleryHorizontal } from "lucide-react"
import { Fragment, useState, useEffect, useContext } from "react"
import PageTitle from "../../components/PageTitle"
import { Box, Chip, IconButton, Card, CardContent } from "@mui/material";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetTables } from "../../services/table.service"
import { useToast } from "../../utils/toast"
import { DataGrid } from '@mui/x-data-grid';
import {Pencil} from 'lucide-react';
import { NavLink } from "react-router-dom"
import { PERMISSIONS, ROUTES } from "../../utils/constants"
import { hasPermission } from "../../utils/permissions";

function Table() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast } = useToast()
    const [loading, setLoading] = useState(true);
    const [tables, setTables] = useState<any[]>([]);
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
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 150,
            renderCell: (params: any) => {
                const status = params.value;
                const color = status === 'AVAILABLE' ? 'success' : status === 'OCCUPIED' ? 'error' : 'default';
                return (
                    <Chip 
                        label={status || '-'} 
                        color={color}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        { 
            field: 'action', 
            headerName: 'Action',
            width: 100,
            renderCell: (params: any) => {
                return (
                    <IconButton color="info" size="small" component={NavLink} to={ROUTES.TABLE.EDIT(params.row.id)}>
                        <Pencil size={20} strokeWidth={1.5} />
                    </IconButton>
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
                    status: e.status,
                    category: e.category,
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
        </Fragment>
    )
}

export default Table

