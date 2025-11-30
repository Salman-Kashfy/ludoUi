import {Fragment, useContext, useEffect, useState, SyntheticEvent} from 'react'
import PageTitle from "../../components/PageTitle";
import {Box, CircularProgress} from '@mui/material';
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
import { DashboardProvider } from '../../hooks/DashboardContext';
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

    const removeTableSession = (tableUuid: string, sessionUuid: string) => {
        setCategories(prevCategories => 
            prevCategories.map((category: any) => ({
                ...category,
                tables: category.tables.map((table: any) => 
                    table.uuid === tableUuid 
                        ? {
                            ...table,
                            tableSessions: table.tableSessions.filter((session: any) => 
                                session.uuid !== sessionUuid
                            )
                        }
                        : table
                )
            }))
        );
    };

    const updateTable = (tableUuid: string, updates: Record<string, any>) => {
        setCategories(prevCategories => 
            prevCategories.map((category: any) => ({
                ...category,
                tables: category.tables.map((table: any) => 
                    table.uuid === tableUuid 
                        ? { ...table, ...updates }
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
                    totalRounds: e.totalRounds,
                    category: e.category,
                    currencyName: e.currencyName,
                    playerLimit: e.playerLimit,
                    playerCount: e.playerCount,
                    status: e.status,
                    currentRound: e.currentRound,
                    startedAt: e.startedAt,
                    completedAt: e.completedAt,
                }
            }));
        }).catch(() => {
            errorToast('Failed to load tournaments');
        }).finally(() => {
            setTourLoader(false);
        });
    };

    const patchTournament = (tournamentUuid: string, updates: Record<string, any>) => {
        setTournaments(prevTournaments =>
            prevTournaments.map((tournament: any) =>
                tournament.uuid === tournamentUuid
                    ? { ...tournament, ...updates }
                    : tournament
            )
        );
    };

    const updateTournamentPlayerCount = (tournamentUuid: string, playerCount: number) => {
        patchTournament(tournamentUuid, { playerCount });
    };

    return (
        <DashboardProvider loadDashboardStats={loadDashboardStats}>
            <TableSessionProvider updateTableSession={updateTableSession} addTableSession={addTableSession} rechargeTableSession={rechargeTableSession} removeTableSession={removeTableSession} updateTable={updateTable}>
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
                <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, minmax(0, 1fr))',
                                sm: 'repeat(2, minmax(0, 1fr))',
                                md: 'repeat(4, minmax(0, 1fr))'
                            },
                            gap: 2,
                            mb: 4
                        }}
                    >
                        <DashboardStat value={dashboardStats.availableTables} title={'Available Tables'} icon={<Gamepad2 color='#fff' strokeWidth={1.6} size={24} />} iconBg={'primary.main'} loading={statsLoader}/>
                        <DashboardStat value={dashboardStats.occupiedTables} title={'Occupied Tables'} icon={<CircleOff color='#fff' strokeWidth={1.6} size={24} />} iconBg={'triadic.main'} loading={statsLoader}/>
                        <DashboardStat value={dashboardStats.activeTournaments} title={'Active Tournaments'} icon={<Trophy color='#fff' strokeWidth={1.6} size={24} />} iconBg={'success.main'} loading={statsLoader}/>
                        <DashboardStat value={dashboardStats.todaysRevenue} title={'Today\'s Revenue'} icon={<Landmark color='#fff' strokeWidth={1.6} size={24} />} iconBg={'warning.main'} loading={statsLoader}/>
                    </Box>

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
                            <Box
                                sx={{
                                    mt: 4,
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'repeat(2, minmax(0, 1fr))'
                                    }
                                }}
                            >
                                {tournaments.map((tournament: any) => (
                                    <Box key={tournament.id || tournament.uuid}>
                                        <DashboardTournament 
                                            tournament={tournament}
                                            onPlayerRegistered={updateTournamentPlayerCount}
                                            onTournamentUpdated={patchTournament}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
                </Fragment>
            </TableSessionProvider>
        </DashboardProvider>
    )
}

export default Dashboard