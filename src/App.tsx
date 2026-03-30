import {useState, useEffect} from 'react'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import './App.css'
import {UserContext} from './hooks/UserContext';
import {CompanyContext} from './hooks/CompanyContext';
import {ToastProvider} from './utils/toast';
import {constants, ROUTES, PERMISSIONS} from "./utils/constants";
import {BookingProvider} from './hooks/BookingContext';
import { initializeFirebase, getFCMToken, listenForMessages } from './config/firebase.service';

// App Layout
import AuthLayoutRoute from "./layouts/AuthLayout";
import DashboardLayoutRoute from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Signin from "./pages/auth/Signin";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ThankYou from "./pages/auth/ThankYou";
import Landing from "./pages/Landing";

// Supporting Components
// import PermissionDenied from "./components/PermissionDenied";
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
import { ROLE } from './utils/constants';

function App() {
    /**
    * Firebase Initialization
    * */
    useEffect(() => {
        // Initialize Firebase
        initializeFirebase();

        // Register service worker for push notifications
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('Service Worker registered for FCM:', registration);
                })
                .catch((error) => {
                    console.warn('Service Worker registration failed:', error);
                });
        }

        // Get FCM token (and store to local storage for backend registration across auth flows)
        getFCMToken().then((token) => {
            if (token) {
                localStorage.setItem('LRCL_FCM_TOKEN', token);
                console.log('Saved FCM token locally');
            }
        }).catch((error) => {
            console.warn('Unable to get FCM token at app load:', error);
        });

        // Listen for foreground messages (when app/tab is active)
        listenForMessages((message) => {
            console.log('Foreground message received:', message);
            // Message already has notification via onMessage handler
        });
    }, []);

    /**
    * User Context
    * */
    const storageKey = constants.LOCAL_STORAGE_TOKEN;
    const storageUser = constants.LOCAL_STORAGE_USER;
    const storagePermission = constants.LOCAL_STORAGE_PERMISSIONS;
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(storageUser));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem(storageUser) || '{}') || {});
    const [permissions, setPermissions] = useState(JSON.parse(localStorage.getItem(storagePermission) || '[]') || []);
    const [token, setToken] = useState(localStorage.getItem(storageKey) ? localStorage.getItem(storageKey) : false);
    const userData = {loggedIn, user, permissions, token, setLoggedIn, setUser, setToken, setPermissions};

    /**
    * Company Context
    * */ 
    const storageCompany = constants.LOCAL_STORAGE_COMPANY;
    const [companyUuid, setCompanyUuid] = useState(localStorage.getItem(storageCompany) || '');
    const companyData = {companyUuid, setCompanyUuid};

    return (
        <UserContext.Provider value={userData}>
            <CompanyContext.Provider value={companyData}>
                <BookingProvider>
                    <ToastProvider>
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
                                
                                {
                                    userData.user?.role?.name === ROLE.ADMIN? 
                                    <> 
                                    <Route path={ROUTES.USER.LIST} element={<DashboardLayoutRoute isAuth={true} component={User} permissionName={PERMISSIONS.USER.LIST} />} />
                                    <Route path={ROUTES.PAYMENT.LIST} element={<DashboardLayoutRoute isAuth={true} component={TournamentPlayerPayments} permissionName={PERMISSIONS.USER.LIST} />} />
                                    <Route path={ROUTES.PAYMENT.CHART} element={<DashboardLayoutRoute isAuth={true} component={PaymentCharts} permissionName={PERMISSIONS.USER.LIST} />} />
</>
                                    : null
                                }

                                {/* <Route path={ROUTES.FORBIDDEN} element={<DashboardLayoutRoute isAuth={true} component={PermissionDenied} permissionName={false} />} /> */}
                                <Route path={ROUTES.LANDING} element={<Landing />} />
                                <Route path={ROUTES.AUTH.LOGIN} element={<AuthLayoutRoute isAuth={false} component={Signin} />} />
                                <Route path={ROUTES.AUTH.REGISTER} element={<AuthLayoutRoute isAuth={false} component={Register} />} />
                                <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<AuthLayoutRoute isAuth={false} component={ForgotPassword} />} />
                                <Route path={ROUTES.AUTH.THANK_YOU} element={<AuthLayoutRoute isAuth={false} component={ThankYou} />} />
                            </Routes>
                        </Router>
                    </ToastProvider>
                </BookingProvider>
            </CompanyContext.Provider>
        </UserContext.Provider>
    )
}

export default App