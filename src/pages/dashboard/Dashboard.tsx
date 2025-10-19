import {Fragment, useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import PageTitle from "../../components/PageTitle";
import {Alert, Box} from '@mui/material';
import Grid from '@mui/material/Grid';
import {CompanyContext} from '../../hooks/CompanyContext';
import {useToast} from '../../utils/toast.tsx';
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import FormInput from "../../components/FormInput";
import DashboardStat from "./DashboardStat";
import {NavLink} from "react-router-dom";
import Link from "@mui/material/Link";
import { LayoutDashboard, Gamepad2, CircleOff, Trophy, Landmark } from 'lucide-react';
import { TableStats } from '../../services/dashboard.service';

function Dashboard() {
    const companyContext:any = useContext(CompanyContext)
    const { successToast, errorToast } = useToast()

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

    /* Starting Point */
    useEffect(() => {
        TableStats({companyId: companyContext.companyId}).then((res:any) => {
            if(res.status) {
                setDashboardStats(res.data)
            }
        }).catch((err:any) => {
            console.log(err)
            errorToast('Something went wrong!')
        }).finally(() => {
            setStatsLoader(false)
        })
    }, [companyContext.companyId])
    return (
        <Fragment>
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
            </Box>
        </Fragment>
    )
}

export default Dashboard