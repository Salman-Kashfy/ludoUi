import { Trophy } from "lucide-react"
import { Fragment, useState, useEffect, useContext } from "react"
import PageTitle from "../../components/PageTitle"
import { Box, Chip, IconButton, Card, CardContent, Typography, Stack, Divider, CircularProgress } from "@mui/material";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetTournaments } from "../../services/tournament.service"
import { useToast } from "../../utils/toast"
import { DataGrid } from '@mui/x-data-grid';
import {Pencil} from 'lucide-react';
import { NavLink } from "react-router-dom"
import { PERMISSIONS, ROUTES } from "../../utils/constants"
import { hasPermission } from "../../utils/permissions";
import ResponsiveTableContainer from "../../components/ResponsiveTableContainer";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function Tournament() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast } = useToast()
    const [loading, setLoading] = useState(true);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const btn = {
        to: ROUTES.TOURNAMENT.CREATE,
        label: 'Create Tournament',
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
        { field: 'date', headerName: 'Date', width: 150, renderCell: (params: any) => {
            return dayjs(params.value).format('MMM DD, YYYY');
        } },
        { field: 'startTime', headerName: 'Start Time', width: 150, renderCell: (params: any) => {
            const date = params.row.date;
            const time = params.value;
            // Combine date and time to create a proper datetime
            const dateTime = dayjs(`${date} ${time}`);
            return dateTime.isValid() ? dateTime.format('h:mm A') : time;
        } },
        { 
            field: 'category', 
            headerName: 'Category', 
            width: 150,
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
                    category: e.category,
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
    
    const renderMobileList = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!tournaments.length) {
            return (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
                    No tournaments found.
                </Typography>
            );
        }

        return (
            <Stack spacing={2} sx={{ p: 2 }}>
                {tournaments.map((tournament) => (
                    <Card key={tournament.id} variant="outlined">
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>{tournament.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {dayjs(tournament.date).format('MMM DD, YYYY')} • {dayjs(`${tournament.date} ${tournament.startTime}`).format('h:mm A')}
                                    </Typography>
                                </Box>
                                <IconButton color="info" size="small" component={NavLink} to={ROUTES.TOURNAMENT.EDIT(tournament.id)}>
                                    <Pencil size={20} strokeWidth={1.5} />
                                </IconButton>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Category
                                </Typography>
                                {tournament.category ? (
                                    <Chip label={tournament.category.name} size="small" color="primary" variant="outlined" />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">-</Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">Status</Typography>
                                <Chip
                                    label={tournament.status}
                                    size="small"
                                    color={getStatusColor(tournament.status) as any}
                                    variant="outlined"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    };

    return (
        <Fragment>
            <PageTitle title="Tournament" titleIcon={<Trophy />} btn={btn} />
            {isMobile ? (
                renderMobileList()
            ) : (
                <Card>
                    <CardContent>
                        <ResponsiveTableContainer>
                            <Box sx={{ p: 2 }}>
                                <DataGrid
                                    rows={tournaments}
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
        </Fragment>
    )
}

export default Tournament

