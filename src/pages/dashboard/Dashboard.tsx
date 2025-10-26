import {Fragment, useContext, useEffect, useState} from 'react'
import PageTitle from "../../components/PageTitle";
import {Box, CircularProgress} from '@mui/material';
import Grid from '@mui/material/Grid';
import {CompanyContext} from '../../hooks/CompanyContext';
import {useBooking} from '../../hooks/BookingContext';
import {useToast} from '../../utils/toast.tsx';
import DashboardStat from "./DashboardStat";
import { LayoutDashboard, Gamepad2, CircleOff, Trophy, Landmark } from 'lucide-react';
import { TableStats } from '../../services/dashboard.service';
import { GetCategories } from '../../services/category.service';
import { CategorySection } from '../../components/CategorySection';
import BookSession from '../table/BookSession';

function Dashboard() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast } = useToast()
    const { bookSessionDialog, tableUuid, closeBookingDialog } = useBooking()

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

    /* Starting Point */
    useEffect(() => {
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

        loadCategories();
    }, [companyContext.companyUuid])

    const afterBooking = () => {
        closeBookingDialog();
        loadCategories();
    };

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

    return (
        <Fragment>
            <BookSession
                open={bookSessionDialog}
                tableUuid={tableUuid}
                handleDialogClose={closeBookingDialog}
                onSuccess={afterBooking}
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
                            onUpdateTableSession={updateTableSession}
                        />
                    ))
                )}
            </Box>
        </Fragment>
    )
}

export default Dashboard