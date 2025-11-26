import {useEffect, useState} from 'react'
import { Navigate } from "react-router-dom";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Box from '@mui/material/Box';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import {constants} from "../utils/constants";
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { useMediaQuery } from "@mui/material";
import { lightTheme, darkTheme } from '../utils/theme';
import { hasPermission } from '../utils/permissions.ts';
import { BreadcrumbContext } from '../hooks/BreadcrumbContext';
import { GetToken } from '../services/auth/auth.service'
import PermissionDenied from '../components/PermissionDenied'

const drawerWidth = 240

const getStoredDrawerState = () => {
    if (typeof window === 'undefined') {
        return true;
    }
    const stored = localStorage.getItem(constants.DOC_SIDEBAR);
    if (stored === null) {
        localStorage.setItem(constants.DOC_SIDEBAR, 'true');
        return true;
    }
    return JSON.parse(stored);
}

function DashboardLayout({ children, isDarkMode, handleThemeChange }:any) {
    const [open, setOpen] = useState(getStoredDrawerState);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [breadcrumb, setBreadcrumb] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen((prev) => !prev);
        } else {
            setOpen((prevOpen) => {
                const next = !prevOpen;
                localStorage.setItem(constants.DOC_SIDEBAR, JSON.stringify(next));
                return next;
            });
        }
    };

    const breadcrumbData = {
        breadcrumb, setBreadcrumb
    }

    useEffect(() => {
        if (!isMobile) {
            setMobileOpen(false);
        }
    }, [isMobile]);

    return (
        <AppProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <BreadcrumbContext.Provider value={breadcrumbData}>
                <Box sx={{ display: 'flex' }}>
                    <Header
                        open={open}
                        mobileOpen={mobileOpen}
                        drawerWidth={drawerWidth}
                        handleDrawerOpen={handleDrawerToggle}
                        isDarkMode={isDarkMode}
                        handleThemeChange={handleThemeChange}
                        isMobile={isMobile}
                    />
                    <Sidebar
                        open={open}
                        drawerWidth={drawerWidth}
                        isMobile={isMobile}
                    />
                    <Box component="main" sx={{ flexGrow: 1, mt: { xs: '56px', sm: '64px', md: '65px' }, pb: '90px' }}>
                        <Box sx={{ px: { xs: 0, sm: 2 }, pt: { xs: 0.5, sm: 2 } }}>
                            <Box
                                sx={{
                                    borderRadius: { xs: 0, md: 3 },
                                    border: { xs: 'none', md: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}` },
                                    boxShadow: { xs: 'none', md: '0 6px 24px -12px rgba(15,23,42,0.2)' },
                                    backgroundColor: theme.palette.background.paper,
                                    p: { xs: 2, md: 3 }
                                }}
                            >
                                {children}
                            </Box>
                        </Box>
                    </Box>
                    {isMobile && <BottomNav />}
                </Box>
            </BreadcrumbContext.Provider>
        </AppProvider>
    );
}

const DashboardLayoutRoute = ({ isAuth, component: Component, permissionName }) => {
    isAuth = Boolean(GetToken());
    let permission
    if(permissionName){
        permission = hasPermission(permissionName)
    }

    const [isDarkMode, setIsDarkMode] = useState(JSON.parse(localStorage.getItem(constants.DARK_MODE)) || false);
    const handleThemeChange = () => {
        const _isDarkMode = !isDarkMode
        localStorage.setItem(constants.DARK_MODE,_isDarkMode)
        setIsDarkMode(_isDarkMode);
    }

    return (
        <>
            { isAuth ?
                <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
                    <DashboardLayout isDarkMode={isDarkMode} handleThemeChange={handleThemeChange}>
                        { permission || permission === undefined ? <Component /> : <PermissionDenied/> }
                    </DashboardLayout>
                </ThemeProvider>
                :  <Navigate to="/" /> }
        </>
    );
};

export default DashboardLayoutRoute;
