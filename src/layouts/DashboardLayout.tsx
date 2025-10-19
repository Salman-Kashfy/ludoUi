import {useEffect, useState, useContext} from 'react'
import { Navigate, NavLink, useLocation } from "react-router-dom";
import {useNavigate} from "react-router";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Box from '@mui/material/Box';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import {constants, ROUTES} from "../utils/constants";
import '@fontsource/plus-jakarta-sans/300.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/700.css';
import {Breadcrumbs, Link} from "@mui/material";
import { lightTheme, darkTheme } from '../utils/theme';
import { hasPermission } from '../utils/permissions.ts';
import { BreadcrumbContext } from '../hooks/BreadcrumbContext';
import { GetToken } from '../services/auth/auth.service'
import PermissionDenied from '../components/PermissionDenied'

const drawerWidth = 240

function DashboardLayout({ children, isDarkMode, handleThemeChange }:any) {
    const [open, setOpen] = useState(JSON.parse(localStorage.getItem('DOC_SIDEBAR')) === null ? true : JSON.parse(localStorage.getItem('DOC_SIDEBAR')) );
    const [breadcrumb, setBreadcrumb] = useState([]);
    const theme = useTheme();

    const handleDrawerOpen = () => {
        const _open = !open
        localStorage.setItem(constants.DOC_SIDEBAR,_open)
        setOpen(_open);
    };

    const breadcrumbData = {
        breadcrumb, setBreadcrumb
    }

    useEffect(() => {
        if(JSON.parse(localStorage.getItem('DOC_SIDEBAR')) === null){
            localStorage.setItem(constants.DOC_SIDEBAR,true)
            setOpen(true)
        }else{
            setOpen(JSON.parse(localStorage.getItem('DOC_SIDEBAR')))
        }
    },[open])

    return (
        <AppProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <BreadcrumbContext.Provider value={breadcrumbData}>
                <Box sx={{ display: 'flex' }}>
                    <Header open={open} drawerWidth={drawerWidth} handleDrawerOpen={handleDrawerOpen} isDarkMode={isDarkMode} handleThemeChange={handleThemeChange}/>
                    <Sidebar open={open} drawerWidth={drawerWidth}/>
                    <Box component="main" sx={{ flexGrow: 1, mt: '65px', pb: 3 }}>
                        <Box sx={{px:1}}>
                            <Box px={{borderRadius: 6, border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`}}>{children}</Box>
                        </Box>
                    </Box>
                </Box>
            </BreadcrumbContext.Provider>
        </AppProvider>
    );
}

const DashboardLayoutRoute = ({ isAuth, component: Component, permissionName }) => {
    const navigate = useNavigate()
    const location = useLocation();
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
