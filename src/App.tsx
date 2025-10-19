import {useState} from 'react'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import './App.css'
import {UserContext} from './hooks/UserContext.ts';
import {CompanyContext} from './hooks/CompanyContext.ts';
import {ToastProvider} from './utils/toast.tsx';
import {constants, ROUTES, PERMISSIONS} from "./utils/constants.ts";

// App Layout
import AuthLayoutRoute from "./layouts/AuthLayout";
import DashboardLayoutRoute from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Signin from "./pages/auth/Signin";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Supporting Components
import PermissionDenied from "./components/PermissionDenied";

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
    const [companyId, setCompanyId] = useState(localStorage.getItem(storageCompany) || '');
    const companyData = {companyId, setCompanyId};

    return (
        <UserContext.Provider value={userData}>
            <CompanyContext.Provider value={companyData}>
                <ToastProvider>
                    <Router>
                        <Routes>
                            <Route path={ROUTES.DASHBOARD} element={<DashboardLayoutRoute isAuth={true} component={Dashboard} permissionName={false} />} />
                            {/* <Route path={ROUTES.FORBIDDEN} element={<DashboardLayoutRoute isAuth={true} component={PermissionDenied} permissionName={false} />} /> */}
                            <Route path={ROUTES.AUTH.LOGIN} element={<AuthLayoutRoute isAuth={false} component={Signin} />} />
                            <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<AuthLayoutRoute isAuth={false} component={ForgotPassword} />} />
                        </Routes>
                    </Router>
                </ToastProvider>
            </CompanyContext.Provider>
        </UserContext.Provider>
    )
}

export default App