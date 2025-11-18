import {Fragment, useContext, useEffect, useState, SyntheticEvent} from 'react'
import PageTitle from "../../components/PageTitle";
import {Box, CircularProgress} from '@mui/material';
import Grid from '@mui/material/Grid';
import {CompanyContext} from '../../hooks/CompanyContext';
import {useBooking} from '../../hooks/BookingContext';
import {useToast} from '../../utils/toast.tsx';
import DashboardStat from "./DashboardStat";
import DashboardTournament from "./DashboardTournament";
import { LayoutDashboard, Gamepad2, CircleOff, Trophy, Landmark, GalleryHorizontal } from 'lucide-react';
import { TableStats } from '../../services/dashboard.service';
import { GetCategories } from '../../services/category.service';
import { CategorySection } from '../../components/CategorySection';
import BookSession from '../table/BookSession';
import RechargeSession from '../table/RechargeSession';
import { TableSessionProvider } from '../../hooks/TableSessionContext';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { GetTournaments } from "../../services/tournament.service"

function Dashboard() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast } = useToast()
    const { bookSessionDialog, tableUuid, categoryPrices, closeBookingDialog, rechargeSessionDialog, tableSessionUuid, rechargeCategoryPrices, closeRechargeDialog } = useBooking()
    const [tab, setTab] = useState(0);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [tourLoader, setTourLoader] = useState<boolean>(false);

    /**
    * Dashboard Stats
    * */
    const [statsLoader, setStatsLoader] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        availableTables: 0,
        occupiedTables: 0,
        activeTournaments: 0,
        todaysRevenue: 0
    })

    /**
    * Categories and Tables
    * */
    const [categoriesLoader, setCategoriesLoader] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    const loadCategories = () => {
        setCategoriesLoader(true);
        GetCategories({companyUuid: companyContext.companyUuid}).then((res:any) => {
            setCategories(res.list || []);
        }).catch(() => {
            errorToast('Failed to load categories');
        }).finally(() => {
            setCategoriesLoader(false);
        });
    };

    const loadDashboardStats = () => {
        setStatsLoader(true);
        TableStats({companyUuid: companyContext.companyUuid}).then((res:any) => {
            if(res.status) {
                setDashboardStats(res.data)
            }
        }).catch((err:any) => {
            console.log(err)
            errorToast('Something went wrong!')
        }).finally(() => {
            setStatsLoader(false)
        })
    };

    /* Starting Point */
    useEffect(() => {
        loadDashboardStats();
        loadCategories();
        loadTournaments();
    }, [companyContext.companyUuid])

    const updateTableSession = (tableUuid: string, updatedSession: any) => {
        setCategories(prevCategories => 
            prevCategories.map((category: any) => ({
                ...category,
                tables: category.tables.map((table: any) => 
                    table.uuid === tableUuid 
                        ? {
                            ...table,
                            tableSessions: table.tableSessions.map((session: any) => 
                                session.uuid === updatedSession.uuid ? updatedSession : session
                            )
                        }
                        : table
                )
            }))
        );
    };

    const addTableSession = (tableUuid: string, newSession: any) => {
        setCategories(prevCategories => 
            prevCategories.map((category: any) => ({
                ...category,
                tables: category.tables.map((table: any) => 
                    table.uuid === tableUuid 
                        ? {
                            ...table,
                            tableSessions: [...table.tableSessions, newSession]
                        }
                        : table
                )
            }))
        );
    };

    const rechargeTableSession = (tableUuid: string, rechargedSession: any) => {
        setCategories(prevCategories => 
            prevCategories.map((category: any) => ({
                ...category,
                tables: category.tables.map((table: any) => 
                    table.uuid === tableUuid 
                        ? {
                            ...table,
                            tableSessions: table.tableSessions.map((session: any) => 
                                session.uuid === rechargedSession.uuid ? rechargedSession : session
                            )
                        }
                        : table
                )
            }))
        );
    };

    /**
    * Tournaments
    * */

    const handleTab = (_e: SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const loadTournaments = () => {
        setTourLoader(true);
        GetTournaments({companyUuid: companyContext.companyUuid}).then((res:any) => {
            setTournaments(res.list.map((e:any) => {
                return {
                    uuid: e.uuid,
                    name: e.name,
                    date: e.date,
                    startTime: e.startTime,
                    entryFee: e.entryFee,
                    prizePool: e.prizePool,
                    category: e.category,
                    currencyName: e.currencyName,
                    playerLimit: e.playerLimit,
                    playerCount: e.playerCount,
                    status: 'UPCOMING'
                }
            }));
        }).catch(() => {
            errorToast('Failed to load tournaments');
        }).finally(() => {
            setTourLoader(false);
        });
    };

    return (
        <TableSessionProvider updateTableSession={updateTableSession} addTableSession={addTableSession} rechargeTableSession={rechargeTableSession}>
            <Fragment>
                <BookSession
                    open={bookSessionDialog}
                    tableUuid={tableUuid}
                    categoryPrices={categoryPrices}
                    handleDialogClose={closeBookingDialog}
                    onBookingSuccess={loadDashboardStats}
                />
                <RechargeSession
                    open={rechargeSessionDialog}
                    tableUuid={tableUuid}
                    tableSessionUuid={tableSessionUuid}
                    categoryPrices={rechargeCategoryPrices}
                    handleDialogClose={closeRechargeDialog}
                />
                <PageTitle title="Dashboard" titleIcon={<LayoutDashboard />} />
                <Box sx={{p:2}}>
                    <Grid container spacing={2} sx={{mb:4}}>
                        <Grid size={3}>
                            <DashboardStat value={dashboardStats.availableTables} title={'Available Tables'} icon={<Gamepad2 color='#fff' strokeWidth={1.6} size={24} />} iconBg={'primary.main'} loading={statsLoader}/>
                        </Grid>
                        <Grid size={3}>
                            <DashboardStat value={dashboardStats.occupiedTables} title={'Occupied Tables'} icon={<CircleOff color='#fff' strokeWidth={1.6} size={24} />} iconBg={'triadic.main'} loading={statsLoader}/>
                        </Grid>
                        <Grid size={3}>
                            <DashboardStat value={dashboardStats.activeTournaments} title={'Active Tournaments'} icon={<Trophy color='#fff' strokeWidth={1.6} size={24} />} iconBg={'success.main'} loading={statsLoader}/>
                        </Grid>
                        <Grid size={3}>
                            <DashboardStat value={dashboardStats.todaysRevenue} title={'Today\'s Revenue'} icon={<Landmark color='#fff' strokeWidth={1.6} size={24} />} iconBg={'warning.main'} loading={statsLoader}/>
                        </Grid>
                    </Grid>

                    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        <Tabs value={tab} onChange={handleTab} centered>
                            <Tab label="Tables" icon={<GalleryHorizontal strokeWidth={1}/>} iconPosition="start"/>
                            <Tab label="Tournaments" icon={<Trophy strokeWidth={1}/>} iconPosition="start"/>
                        </Tabs>
                    </Box>
                    <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
                        {categoriesLoader ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            categories.map((category: any) => (
                                <CategorySection 
                                    key={category.uuid} 
                                    category={category}
                                    onUpdate={loadCategories}
                                />
                            ))
                        )}
                    </Box>
                    <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
                        {tourLoader ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box sx={{ mt: 4 }}>
                                <Grid container spacing={2}>
                                    {tournaments.map((tournament: any) => (
                                        <Grid size={6} key={tournament.id || tournament.uuid}>
                                            <DashboardTournament 
                                                tournament={tournament}
                                                onPlayerRegistered={(tournamentUuid: string, playerCount: number) => {
                                                    setTournaments((prevTournaments) =>
                                                        prevTournaments.map((t: any) =>
                                                            t.uuid === tournamentUuid
                                                                ? { ...t, playerCount }
                                                                : t
                                                        )
                                                    );
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Fragment>
        </TableSessionProvider>
    )
}

export default Dashboard