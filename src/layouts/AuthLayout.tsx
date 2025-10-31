import {Navigate} from "react-router-dom";
import { AppProvider } from '@toolpad/core/AppProvider';
import { GetToken } from '../services/auth/auth.service.ts'
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import {Box, Typography} from "@mui/material";
import crmLogo from "../assets/cloudfitnest.png";
import companyLogo from "../assets/company-logo.png";

function AuthLayout({children}: {children: React.ReactNode}) {
    return (
        <AppProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(142deg, rgba(243,242,247,1) 0%, rgba(214,232,246,1) 72%)' }}>
                <Box>
                    <Box sx={{backgroundColor: '#fff', padding: 4, width: '440px', position: 'relative', boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 6px'}}>
                        <Box sx={{textAlign: 'center', mb:2}}>
                            <img src={crmLogo} width={160}/>
                        </Box>
                        {children}
                    </Box>
                </Box>
            </Box>
        </AppProvider>
    )
}

const AuthLayoutRoute = ({isAuth, component: Component}: {isAuth: boolean, component: React.ComponentType}) => {
    isAuth = Boolean(GetToken());
    return(
        <>
            { isAuth ?
                <Navigate to="/dashboard" /> :
                <AuthLayout>
                    <Component />
                </AuthLayout>
            }
        </>
    )
}

export default AuthLayoutRoute
