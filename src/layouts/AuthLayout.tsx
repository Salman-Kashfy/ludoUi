import {Navigate} from "react-router-dom";
import { AppProvider } from '@toolpad/core/AppProvider';
import { GetToken } from '../services/auth/auth.service.ts'
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '../utils/theme';import CssBaseline from '@mui/material/CssBaseline';import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import {Box, Typography} from "@mui/material";
import ludoLogo from "../assets/ludoroyalclub-horizontal.svg";
import ludoMonogram from "../assets/ludoroyalclub-monogram.svg";
import ludoBg from "../assets/ludo-background.svg";
import companyLogo from "../assets/company-logo.png";

function AuthLayout({children}: {children: React.ReactNode}) {
    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <AppProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', position: 'relative', background: 'linear-gradient(142deg, rgba(255,255,255,1) 0%, rgba(250,249,251,1) 72%)', overflow: 'hidden' }}>
                    {/* decorative background - non-interactive */}
                    <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${ludoBg})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover', opacity: { xs: 0.04, sm: 0.08 }, pointerEvents: 'none', filter: { xs: 'none', sm: 'blur(0.2px)' } }} />

                    <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '100vw' }}>
                        <Box sx={{backgroundColor: 'transparent', overflow: 'visible', borderRadius: 0, p: { xs: 1, sm: 1.5, md: 2 }, width: { xs: '100vw', sm: '100vw', md: '100vw' }, maxWidth: '100%', boxSizing: 'border-box', position: 'relative'}}>
                            <Box sx={{textAlign: 'center', mb: { xs: 2, sm: 2 }}}>
                                <Box component="img" src={ludoLogo} sx={{ width: { xs: '120px', sm: '120px', md: '160px' }, height: 'auto' }} />
                            </Box>
                            {children}
                        </Box>
                    </Box>
                </Box>
            </AppProvider>
        </ThemeProvider>
    )
}

const AuthLayoutRoute = ({
    isAuth,
    component: Component,
    allowWhenAuthenticated = false
}: {
    isAuth: boolean,
    component: React.ComponentType,
    allowWhenAuthenticated?: boolean
}) => {
    isAuth = Boolean(GetToken());

    if (isAuth && !allowWhenAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <AuthLayout>
            <Component />
        </AuthLayout>
    );
}

export default AuthLayoutRoute
