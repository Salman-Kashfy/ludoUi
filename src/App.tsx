import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import { UserContext } from './hooks/UserContext';
import { CompanyContext } from './hooks/CompanyContext';
import { ToastProvider } from './utils/toast';
import { constants, ROUTES, PERMISSIONS, ROLE } from './utils/constants';
import { BookingProvider } from './hooks/BookingContext';
import { initializeFirebase, getFCMToken, listenForMessages } from './config/firebase.service';
import NotificationCenter, { triggerNotification } from './components/NotificationCenter';

// Layouts
import AuthLayoutRoute from "./layouts/AuthLayout";
import DashboardLayoutRoute from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Signin from "./pages/auth/Signin";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ThankYou from "./pages/auth/ThankYou";
import Landing from "./pages/Landing";
import Category from './pages/category/Category';
import EditCategory from './pages/category/EditCategory';
import CreateCategory from './pages/category/CreateCategory';
import Table from './pages/table/Table';
import CreateTable from './pages/table/CreateTable';
import EditTable from './pages/table/EditTable';
import Tournament from './pages/tournament/Tournament';
import CreateTournament from './pages/tournament/CreateTournament';
import EditTournament from './pages/tournament/EditTournament';
import TournamentRoundDetails from './pages/tournament/TournamentRoundDetails';
import Customer from './pages/customer/Customer';
import User from './pages/user/User';
import TournamentPlayerPayments from './pages/payment/TournamentPlayerPayments';
import PaymentCharts from './pages/payment/PaymentCharts';

function App() {
    /**
     * Firebase + FCM setup
     */
    useEffect(() => {
        const setupFCM = async () => {
            try {
                // 1️⃣ Initialize Firebase messaging (with SW registration inside)
                await initializeFirebase();

                // 2️⃣ Request token (with permission)
                const token = await getFCMToken(true);
                if (token) {
                    localStorage.setItem('LRCL_FCM_TOKEN', token);
                    console.log('FCM token saved locally:', token);
                }

                // 3️⃣ Listen for foreground messages with UI notifications
                listenForMessages((message) => {
                    console.log('Foreground message received:', message);
                    
                    // Show notification in notification center
                    if (message.notification) {
                        triggerNotification({
                            title: message.notification.title || 'New Notification',
                            body: message.notification.body || '',
                            icon: message.notification.icon,
                            data: message.data,
                            type: message.data?.type === 'error' ? 'error' : 
                                   message.data?.type === 'warning' ? 'warning' :
                                   message.data?.type === 'success' ? 'success' : 'info',
                            duration: 5000
                        });
                    }
                });

            } catch (error) {
                console.warn('FCM setup failed:', error);
            }
        };

        setupFCM();
    }, []);

    /**
     * User Context
     */
    const storageKey = constants.LOCAL_STORAGE_TOKEN;
    const storageUser = constants.LOCAL_STORAGE_USER;
    const storagePermission = constants.LOCAL_STORAGE_PERMISSIONS;
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(storageUser));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem(storageUser) || '{}') || {});
    const [permissions, setPermissions] = useState(JSON.parse(localStorage.getItem(storagePermission) || '[]') || []);
    const [token, setToken] = useState(localStorage.getItem(storageKey) || false);
    const userData = useMemo(() => ({ 
        loggedIn, user, permissions, token, setLoggedIn, setUser, setToken, setPermissions 
    }), [loggedIn, user, permissions, token]);

    /**
     * Company Context
     */
    const storageCompany = constants.LOCAL_STORAGE_COMPANY;
    const [companyUuid, setCompanyUuid] = useState(localStorage.getItem(storageCompany) || '');
    const companyData = useMemo(() => ({ 
        companyUuid, setCompanyUuid 
    }), [companyUuid]);

    return (
        <UserContext.Provider value={userData}>
            <CompanyContext.Provider value={companyData}>
                <BookingProvider>
                    <ToastProvider>
                        <NotificationCenter />
                        <Router>
                            <Routes>
                                <Route path={ROUTES.DASHBOARD} element={<DashboardLayoutRoute isAuth={true} component={Dashboard} permissionName={false} />} />
                                <Route path={ROUTES.CATEGORY.LIST} element={<DashboardLayoutRoute isAuth={true} component={Category} permissionName={PERMISSIONS.CATEGORY.LIST} />} />
                                <Route path={ROUTES.CATEGORY.EDIT()} element={<DashboardLayoutRoute isAuth={true} component={EditCategory} permissionName={PERMISSIONS.CATEGORY.UPSERT} />} />
                                <Route path={ROUTES.CATEGORY.CREATE} element={<DashboardLayoutRoute isAuth={true} component={CreateCategory} permissionName={PERMISSIONS.CATEGORY.UPSERT} />} />
                                <Route path={ROUTES.TABLE.LIST} element={<DashboardLayoutRoute isAuth={true} component={Table} permissionName={PERMISSIONS.TABLE.LIST} />} />
                                <Route path={ROUTES.TABLE.CREATE} element={<DashboardLayoutRoute isAuth={true} component={CreateTable} permissionName={PERMISSIONS.TABLE.UPSERT} />} />
                                <Route path={ROUTES.TABLE.EDIT()} element={<DashboardLayoutRoute isAuth={true} component={EditTable} permissionName={PERMISSIONS.TABLE.UPSERT} />} />
                                <Route path={ROUTES.TOURNAMENT.LIST} element={<DashboardLayoutRoute isAuth={true} component={Tournament} permissionName={PERMISSIONS.TOURNAMENT.LIST} />} />
                                <Route path={ROUTES.TOURNAMENT.CREATE} element={<DashboardLayoutRoute isAuth={true} component={CreateTournament} permissionName={PERMISSIONS.TOURNAMENT.UPSERT} />} />
                                <Route path={ROUTES.TOURNAMENT.EDIT()} element={<DashboardLayoutRoute isAuth={true} component={EditTournament} permissionName={PERMISSIONS.TOURNAMENT.UPSERT} />} />
                                <Route path={ROUTES.TOURNAMENT.ROUND_DETAILS()} element={<DashboardLayoutRoute isAuth={true} component={TournamentRoundDetails} permissionName={PERMISSIONS.TOURNAMENT.LIST} />} />
                                <Route path={ROUTES.CUSTOMER.LIST} element={<DashboardLayoutRoute isAuth={true} component={Customer} permissionName={PERMISSIONS.CUSTOMER.LIST} />} />
                                {userData.user?.role?.name === ROLE.ADMIN && <>
                                    <Route path={ROUTES.USER.LIST} element={<DashboardLayoutRoute isAuth={true} component={User} permissionName={PERMISSIONS.USER.LIST} />} />
                                    <Route path={ROUTES.PAYMENT.LIST} element={<DashboardLayoutRoute isAuth={true} component={TournamentPlayerPayments} permissionName={PERMISSIONS.USER.LIST} />} />
                                    <Route path={ROUTES.PAYMENT.CHART} element={<DashboardLayoutRoute isAuth={true} component={PaymentCharts} permissionName={PERMISSIONS.USER.LIST} />} />
                                </>}
                                <Route path={ROUTES.LANDING} element={<Landing />} />
                                <Route path={ROUTES.AUTH.LOGIN} element={<AuthLayoutRoute isAuth={false} component={Signin} />} />
                                <Route path={ROUTES.AUTH.REGISTER} element={<AuthLayoutRoute isAuth={false} component={Register} />} />
                                <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<AuthLayoutRoute isAuth={false} component={ForgotPassword} />} />
                                <Route path={ROUTES.AUTH.THANK_YOU} element={<AuthLayoutRoute isAuth={false} component={ThankYou} allowWhenAuthenticated={true} />} />
                            </Routes>
                        </Router>
                    </ToastProvider>
                </BookingProvider>
            </CompanyContext.Provider>
        </UserContext.Provider>
    )
}

export default App;