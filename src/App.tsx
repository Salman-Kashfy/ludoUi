import {useState} from 'react'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import './App.css'
import {UserContext} from './hooks/UserContext.ts';
import {CompanyContext} from './hooks/CompanyContext.ts';
import {ToastProvider} from './utils/toast.tsx';
import {constants, ROUTES, PERMISSIONS} from "./utils/constants.ts";
import {BookingProvider} from './hooks/BookingContext';

// App Layout
import AuthLayoutRoute from "./layouts/AuthLayout";
import DashboardLayoutRoute from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Signin from "./pages/auth/Signin";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Supporting Components
// import PermissionDenied from "./components/PermissionDenied";
import Category from './pages/category/Category.tsx';
import EditCategory from './pages/category/EditCategory';
import CreateCategory from './pages/category/CreateCategory';
import Table from './pages/table/Table';
import CreateTable from './pages/table/CreateTable';
import EditTable from './pages/table/EditTable';
import Tournament from './pages/tournament/Tournament';

function App() {
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
                                {/* <Route path={ROUTES.FORBIDDEN} element={<DashboardLayoutRoute isAuth={true} component={PermissionDenied} permissionName={false} />} /> */}
                                <Route path={ROUTES.AUTH.LOGIN} element={<AuthLayoutRoute isAuth={false} component={Signin} />} />
                                <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<AuthLayoutRoute isAuth={false} component={ForgotPassword} />} />
                            </Routes>
                        </Router>
                    </ToastProvider>
                </BookingProvider>
            </CompanyContext.Provider>
        </UserContext.Provider>
    )
}

export default App