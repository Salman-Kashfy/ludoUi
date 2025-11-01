import {useEffect} from 'react'
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
import { NavLink } from 'react-router-dom';
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
import { LayoutDashboard , Shapes, GalleryHorizontal} from 'lucide-react'; 

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

function SideBar({open, drawerWidth}) {
    const theme = useTheme()
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

    useEffect(() => {

    },[open, drawerWidth])

    return (
        <Drawer variant="permanent" open={open} PaperProps={drawerPaperProps}>
            <DrawerHeader sx={{justifyContent: 'center'}}>
                <img src={open ? crmLogo : crmIcon} style={{ height: '25px', filter: theme.palette.mode === 'dark' ? 'invert(1)' : '' }}/>
            </DrawerHeader>

            <List>
                {/*<Typography variant="subtitle2" sx={{color:grey[500], pl:1.5, fontSize: '12px'}}>MAIN</Typography>*/}
                <ListItem key="dashboard" disablePadding sx={{ display: 'block', }}>
                    <Tooltip title="Dashboard" placement={'right'} disableHoverListener={open} disableFocusListener={open}>
                        <ListItemButton component={NavLink} to={ROUTES.DASHBOARD} sx={[listBtnStyles, open ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                            <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, open ? {mr: 2} : {mr: 'auto'}]}>
                                {/* <GridViewOutlinedIcon sx={iconStyles}/> */}
                                <LayoutDashboard strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" sx={[open ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
                { 
                hasPermission(PERMISSIONS.CATEGORY.LIST) ?
                    <ListItem key="category" disablePadding sx={{ display: 'block', }}>
                        <Tooltip title="Category" placement={'right'} disableHoverListener={open} disableFocusListener={open}>
                            <ListItemButton component={NavLink} to={ROUTES.CATEGORY.LIST} sx={[listBtnStyles, open ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                                <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, open ? {mr: 2} : {mr: 'auto'}]}>
                                    {/* <GridViewOutlinedIcon sx={iconStyles}/> */}
                                    <Shapes strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                                </ListItemIcon>
                                <ListItemText primary="Category" sx={[open ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                    : <></>
                }
                { 
                hasPermission(PERMISSIONS.TABLE.LIST) ?
                    <ListItem key="table" disablePadding sx={{ display: 'block', }}>
                        <Tooltip title="Table" placement={'right'} disableHoverListener={open} disableFocusListener={open}>
                            <ListItemButton component={NavLink} to={ROUTES.TABLE.LIST} sx={[listBtnStyles, open ? {justifyContent: 'initial' }: {justifyContent: 'center'}]}>
                                <ListItemIcon sx={[{minWidth: 0, justifyContent: 'center',}, open ? {mr: 2} : {mr: 'auto'}]}>
                                    <GalleryHorizontal strokeWidth={1.5} size={20} color={theme.palette.mode === 'dark' ? '#999' : '#111'}/>
                                </ListItemIcon>
                                <ListItemText primary="Table" sx={[open ? {opacity: 1} : {opacity: 0}]} primaryTypographyProps={labelTypography}/>
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                    : <></>
                }
            </List>
        </Drawer>
    )
}

export default SideBar
