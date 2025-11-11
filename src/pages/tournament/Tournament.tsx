import { Trophy } from "lucide-react"
import { Fragment, useState, useEffect, useContext } from "react"
import PageTitle from "../../components/PageTitle"
import { Box, Chip, IconButton, Card, CardContent } from "@mui/material";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetTournaments } from "../../services/tournament.service"
import { useToast } from "../../utils/toast"
import { DataGrid } from '@mui/x-data-grid';
import {Pencil} from 'lucide-react';
import { NavLink } from "react-router-dom"
import { PERMISSIONS, ROUTES } from "../../utils/constants"
import { hasPermission } from "../../utils/permissions";

function Tournament() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast } = useToast()
    const [loading, setLoading] = useState(true);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const btn = {
        to: ROUTES.TOURNAMENT.CREATE,
        label: 'Add Tournament',
        color: 'primary',
        show: hasPermission(PERMISSIONS.TOURNAMENT.UPSERT),
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'UPCOMING':
                return 'info';
            case 'RUNNING':
                return 'success';
            case 'COMPLETED':
                return 'default';
            case 'CANCELLED':
                return 'error';
            case 'POSTPONED':
                return 'warning';
            default:
                return 'default';
        }
    }

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'startTime', headerName: 'Start Time', width: 150 },
        { field: 'playerLimit', headerName: 'Player Limit', width: 130 },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 150,
            renderCell: (params: any) => {
                return (
                    <Chip 
                        label={params.value} 
                        size="small" 
                        color={getStatusColor(params.value) as any}
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
                    <IconButton color="info" size="small" component={NavLink} to={ROUTES.TOURNAMENT.EDIT(params.row.id)}>
                        <Pencil size={20} strokeWidth={1.5} />
                    </IconButton>
                );
            }
        }

    ];

    const loadTournaments = () => {
        setLoading(true);
        GetTournaments({companyUuid: companyContext.companyUuid}).then((res:any) => {
            setTournaments(res.list.map((e:any) => {
                return {
                    id: e.uuid,
                    name: e.name,
                    date: e.date,
                    startTime: e.startTime,
                    entryFee: e.entryFee,
                    prizePool: e.prizePool,
                    currencyName: e.currencyName,
                    playerLimit: e.playerLimit,
                    status: e.status,
                    action: null // Placeholder, actual rendering happens in renderCell
                }
            }));
        }).catch(() => {
            errorToast('Failed to load tournaments');
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        loadTournaments();
    }, [companyContext.companyUuid]);
    
    return (
        <Fragment>
            <PageTitle title="Tournament" titleIcon={<Trophy />} btn={btn} />
            <Card>
                <CardContent>   
                    <Box sx={{p:2}}>
                        <DataGrid
                            rows={tournaments}
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

export default Tournament

