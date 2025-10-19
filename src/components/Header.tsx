import {useNavigate} from "react-router";
import {Logout, EmptyLocalStorage, GetAuthCompany, SetAuthCompany} from '../services/auth/auth.service'
import {UserContext} from '../hooks/UserContext';
import {CompanyContext} from '../hooks/CompanyContext';
import MuiAppBar from '@mui/material/AppBar';
import {Paper, Divider, Toolbar, IconButton, ListItemIcon, Typography, Box, Menu, Tooltip, Avatar, MenuItem, Button, useTheme, Autocomplete, TextField} from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { NavLink } from 'react-router-dom';
import {useContext, useEffect, useState} from "react";
import MenuIcon from "@mui/icons-material/Menu";
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import {styled} from "@mui/material/styles";
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import {PERMISSIONS, ROLE, ROUTES} from "../utils/constants";
import {hasPermission} from "../utils/permissions";
import { EllipsisVertical, Sun, MoonStar } from "lucide-react";
import { GetCompanies } from "../services/company.service";

const drawerWidth = 240

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));


function Header({open, drawerWidth, handleDrawerOpen, isDarkMode, handleThemeChange}:any) {
    const userContext:any = useContext(UserContext)
    const companyContext:any = useContext(CompanyContext)
    const navigate = useNavigate()
    const menus: any[] = [
        //{name: 'Dashboard', route: ROUTES.DASHBOARD, permission: PERMISSIONS.TABLE.LIST},
        
    ];

    
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [companyDD, setCompanyDD] = useState(false);
    const [companies, setCompanies] = useState([]);
    const companySelection = [ROLE.ADMIN].includes(userContext.user.role.name);
    const [defaultCompanyId, setDefaultCompanyId] = useState({});

    const [toast, setToast] = useState(false);
    const [toastSeverity, setToastSeverity] = useState('info');
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if(companySelection){
            GetCompanies({limit:0}).then((data) => {
                const { list } = data;
                const companyId = GetAuthCompany();
                const rows = list.map((e:any) => {
                    return { value: e.uuid, label: e.name, selected: e.uuid === companyId }
                })
                setCompanies(rows)
                if(!companyId){
                   SetAuthCompany(rows[0].value) 
                   setDefaultCompanyId(rows[0])
                } else {
                    setDefaultCompanyId(rows.find((e:any) => e.selected) || {})
                }
            }).catch((error) => {
                setToastSeverity('error')
                setToastMessage(error.response.data.message)
                setToast(true)
            })
        } 
    }, [])

    const handleCompanyChange = (event: any, value: any) => {
        SetAuthCompany(value.value)
        companyContext.setCompanyId(value.value)
        setDefaultCompanyId(value)
        setCompanyDD(false);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    async function handleLogout() {
        await Logout().then(async (data) => {
            if (data.status) {
                await EmptyLocalStorage();
                navigate('/')
            } else {
                setToastSeverity('error')
                setToastMessage(data.message)
                setToast(true)
            }
            setAnchorElNav(null);
        }).catch((error) => {
            setAnchorElNav(null);
            setToastSeverity('error')
            setToastMessage(error.response.data.message)
            setToast(true)
        })
    }

    return userContext?.user ? (
        <AppBar position="fixed" open={open} elevation={0} sx={{ width: `calc(100% - ${ open ? drawerWidth : 65}px)`, ml: `${ open ? drawerWidth : 65}px`}}>
            <Toolbar>
                <IconButton
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start">
                    { open ? <MenuIcon /> : <MenuOpenIcon /> }
                </IconButton>
                <Box sx={{ flexGrow: 1, justifyContent:'center', display: { xs: 'none', md: 'flex' } }}>
                    {menus.map((menu) => (
                        <Button key={menu.name} size="small" sx={{ mx: 0.5, display: menu.permission ? (hasPermission(menu.permission) ? 'inline-flex' : 'none') : 'inline-flex' }} component={NavLink} to={menu.route}>{menu.name}</Button>
                    ))}
                </Box>
                <Box sx={{ flexGrow: 0, ml: 'auto' }}>
                    <Tooltip title="Visibility">
                        <IconButton onClick={handleThemeChange} aria-label="change-mode">
                            { isDarkMode ? <Sun strokeWidth={1.5} size={20} color={'#ed6c02'} /> : <MoonStar strokeWidth={1.5} size={20} color={'#1976d2'} /> }
                        </IconButton>
                    </Tooltip>
                    {
                        userContext.user.role.name === ROLE.ADMIN ?
                            <>
                                <Tooltip title="Switch company">
                                    <IconButton onClick={() => setCompanyDD(true)} aria-label="change-company">
                                        <EllipsisVertical strokeWidth={1.5} size={20} />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px'}}
                                    id="switch-company-dropdown"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={companyDD}
                                    onClose={() => setCompanyDD(false)}
                                >
                                    <Paper sx={{ minWidth: '230px', py: 1, px:2}} elevation={0}>
                                         <Autocomplete
                                            id="brands-dd"
                                            options={companies}
                                            getOptionLabel={(option) => option.label || ''}
                                            onChange={handleCompanyChange}
                                            value={defaultCompanyId}
                                            disableClearable
                                            renderInput={(params) => <TextField disabled={!companies.length} variant="outlined" {...params} size="small" label="Switch Company" />}
                                        />
                                    </Paper>
                                </Menu>
                            </>
                        : <></>
                    }
                    <Tooltip title="Your profile and settings">
                        <IconButton onClick={handleOpenUserMenu}>
                            <Avatar sx={{ bgcolor: isDarkMode ? 'grey' : 'black', width: 35, height: 35, fontSize: 15 }}>{userContext.user.firstName.charAt(0)}</Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{ mt: '45px'}}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}>
                        <Paper sx={{ minWidth: '230px'}} elevation={0}>
                            <Box sx={{ py: 1, px:2 }}>
                                <Typography variant="subtitle2" gutterBottom>Account</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: isDarkMode ? 'grey' : 'black', width: 45, height: 45, fontSize: 20 }}>{userContext.user.firstName.charAt(0)}</Avatar>
                                    <Box sx={{ ml: 1, textAlign: 'left', pr:1 }}>
                                        <Typography variant="body1">{userContext.user.firstName}</Typography>
                                        <Typography variant="body2" textTransform="capitalize">{userContext.user.role.name}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Divider sx={{mb:1}}/>
                            <Typography sx={{ px:2 }} variant="subtitle2" gutterBottom>Manage account</Typography>
                            {/*<MenuItem key="profile" component={NavLink} to={'/dashboard'} onClick={handleCloseUserMenu}>*/}
                            {/*    <ListItemIcon>*/}
                            {/*        <AccountCircleOutlinedIcon fontSize="small" />*/}
                            {/*    </ListItemIcon>*/}
                            {/*    <Typography sx={{ textAlign: 'center' }}>Profile</Typography>*/}
                            {/*</MenuItem>*/}
                            
                            <MenuItem key="logout" component={NavLink} onClick={handleLogout}>
                                <ListItemIcon>
                                    <PowerSettingsNewOutlinedIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                            </MenuItem>
                        </Paper>
                    </Menu>
                </Box>
            </Toolbar>

        </AppBar>
    ) : <></>
}

export default Header
