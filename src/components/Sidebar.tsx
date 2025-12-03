import crmLogo from "../assets/cloudfitnest.png";
import crmIcon from "../assets/cloudfitnest-icon.png";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {CSSObject, styled, Theme} from "@mui/material/styles";
import {AppBarProps as MuiAppBarProps} from "@mui/material/AppBar/AppBar";
import MuiDrawer from "@mui/material/Drawer";
import { NavLink, useLocation } from 'react-router-dom';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import Tooltip from '@mui/material/Tooltip';
import {ROUTES,PERMISSIONS} from "../utils/constants";
import { hasPermission } from '../utils/permissions'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SportsGymnasticsOutlinedIcon from '@mui/icons-material/SportsGymnasticsOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsightsIcon from '@mui/icons-material/Insights';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import {useTheme} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import AltRouteIcon from "@mui/icons-material/AltRoute";
import { LayoutDashboard , Shapes, GalleryHorizontal, Trophy, Users,ShieldUser} from 'lucide-react'; 

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const drawerWidth = 240
const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

interface SidebarProps {
    open: boolean;
    drawerWidth: number;
    isMobile: boolean;
    onClose?: () => void;
}

function SideBar({open, drawerWidth, isMobile, onClose}: SidebarProps) {
    const theme = useTheme()
    const location = useLocation();
    const drawerPaperProps = {
        sx: {
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            border: 'none'
        }
    }
    const iconStyles = {color: theme.palette.mode === 'dark' ? '#00f5ff' : '#444', fontSize: '1.2rem'}
    const labelTypography = {fontSize: '0.875rem'}
    const listBtnStyles = {height: 36, px: 2.5}
    const effectiveOpen = open;
    const matchesRoute = (matcher: string) => location.pathname === matcher || location.pathname.startsWith(`${matcher}/`);

    const handleNavClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    const drawerContent = (
        <>
            <DrawerHeader sx={{justifyContent: 'center'}}>
                <img src={effectiveOpen ? crmLogo : crmIcon} style={{ height: '25px', filter: theme.palette.mode === 'dark' ? 'invert(1)' : '' }}/>
            </DrawerHeader>

            <List>
                {/*<Typography variant="subtitle2" sx={{color:grey[500], pl:1.5, fontSize: '12px'}}>MAIN</Typography>*/}
                <ListItem key="dashboard" disablePadding sx={{ display: 'block', }}>
                    <Tooltip title="Dashboard" placement={'right'} disableHoverListener={effectiveOpen} disableFocusListener={effectiveOpen}>
                        <ListItemButton
                            component={NavLink}
                            to={ROUTES.DASHBOARD}
                            selected={matchesRoute(ROUTES.DASHBOARD)}
                            onClick={handleNavClick}
                            sx={[listBtnStyles, effectiveOpen ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                            <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, effectiveOpen ? {mr: 2} : {mr: 'auto'}]}>
                                {/* <GridViewOutlinedIcon sx={iconStyles}/> */}
                                <LayoutDashboard strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" sx={[effectiveOpen ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
                { 
                hasPermission(PERMISSIONS.CATEGORY.LIST) ?
                    <ListItem key="category" disablePadding sx={{ display: 'block', }}>
                        <Tooltip title="Category" placement={'right'} disableHoverListener={effectiveOpen} disableFocusListener={effectiveOpen}>
                            <ListItemButton
                                component={NavLink}
                                to={ROUTES.CATEGORY.LIST}
                                selected={matchesRoute(ROUTES.CATEGORY.LIST) || matchesRoute('/category')}
                                onClick={handleNavClick}
                                sx={[listBtnStyles, effectiveOpen ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                                <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, effectiveOpen ? {mr: 2} : {mr: 'auto'}]}>
                                    {/* <GridViewOutlinedIcon sx={iconStyles}/> */}
                                    <Shapes strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                                </ListItemIcon>
                                <ListItemText primary="Category" sx={[effectiveOpen ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                    : <></>
                }
                { 
                hasPermission(PERMISSIONS.TABLE.LIST) ?
                    <ListItem key="table" disablePadding sx={{ display: 'block', }}>
                        <Tooltip title="Table" placement={'right'} disableHoverListener={effectiveOpen} disableFocusListener={effectiveOpen}>
                            <ListItemButton
                                component={NavLink}
                                to={ROUTES.TABLE.LIST}
                                selected={matchesRoute(ROUTES.TABLE.LIST) || matchesRoute('/table')}
                                onClick={handleNavClick}
                                sx={[listBtnStyles, effectiveOpen ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                                <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, effectiveOpen ? {mr: 2} : {mr: 'auto'}]}>
                                    <GalleryHorizontal strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                                </ListItemIcon>
                                <ListItemText primary="Table" sx={[effectiveOpen ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                    : <></>
                }
                { 
                hasPermission(PERMISSIONS.TOURNAMENT.LIST) ?
                    <ListItem key="tournament" disablePadding sx={{ display: 'block', }}>
                        <Tooltip title="Tournament" placement={'right'} disableHoverListener={effectiveOpen} disableFocusListener={effectiveOpen}>
                            <ListItemButton
                                component={NavLink}
                                to={ROUTES.TOURNAMENT.LIST}
                                selected={matchesRoute(ROUTES.TOURNAMENT.LIST) || matchesRoute('/tournament')}
                                onClick={handleNavClick}
                                sx={[listBtnStyles, effectiveOpen ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                                <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, effectiveOpen ? {mr: 2} : {mr: 'auto'}]}>
                                    <Trophy strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                                </ListItemIcon>
                                <ListItemText primary="Tournament" sx={[effectiveOpen ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                    : <></>
                }
                { 
                hasPermission(PERMISSIONS.CUSTOMER.LIST) ?
                    <ListItem key="customer" disablePadding sx={{ display: 'block', }}>
                        <Tooltip title="Customer" placement={'right'} disableHoverListener={effectiveOpen} disableFocusListener={effectiveOpen}>
                            <ListItemButton
                                component={NavLink}
                                to={ROUTES.CUSTOMER.LIST}
                                selected={matchesRoute(ROUTES.CUSTOMER.LIST) || matchesRoute('/customer')}
                                onClick={handleNavClick}
                                sx={[listBtnStyles, effectiveOpen ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                                <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, effectiveOpen ? {mr: 2} : {mr: 'auto'}]}>
                                    <Users strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                                </ListItemIcon>
                                <ListItemText primary="Customer" sx={[effectiveOpen ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                    : <></>
                }
                { 
                hasPermission(PERMISSIONS.USER.LIST) ?
                    <ListItem key="users" disablePadding sx={{ display: 'block', }}>
                        <Tooltip title="Users" placement={'right'} disableHoverListener={effectiveOpen} disableFocusListener={effectiveOpen}>
                            <ListItemButton
                                component={NavLink}
                                to={ROUTES.USER.LIST}
                                selected={matchesRoute(ROUTES.USER.LIST) || matchesRoute('/users')}
                                onClick={handleNavClick}
                                sx={[listBtnStyles, effectiveOpen ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                                <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, effectiveOpen ? {mr: 2} : {mr: 'auto'}]}>
                                    <ShieldUser strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                                </ListItemIcon>
                                <ListItemText primary="Users" sx={[effectiveOpen ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                    : <></>
                }
            </List>
        </>
    );

    // Mobile drawer
    if (isMobile) {
        return (
            <MuiDrawer
                variant="temporary"
                open={open}
                onClose={onClose || (() => {})}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                    },
                }}
                PaperProps={drawerPaperProps}
            >
                {drawerContent}
            </MuiDrawer>
        );
    }

    // Desktop drawer
    return (
        <Drawer variant="permanent" open={open} PaperProps={drawerPaperProps} sx={{ display: { xs: 'none', md: 'block' } }}>
            {drawerContent}
        </Drawer>
    )
}

export default SideBar
