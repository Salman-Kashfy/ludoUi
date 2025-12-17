import ludoLogo from "../assets/ludoroyalclub-horizontal.svg";
import ludoIcon from "../assets/ludoroyalclub-monogram.svg";
import { styled, CSSObject, Theme, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { NavLink, useLocation } from "react-router-dom";
import { ROUTES, PERMISSIONS } from "../utils/constants";
import { hasPermission } from "../utils/permissions";
import { LayoutDashboard, Shapes, GalleryHorizontal, Trophy, Users, ShieldUser,DollarSign,ChartNoAxesCombined } from "lucide-react";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: `calc(${theme.spacing(7)} + 1px)`,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }: { theme: Theme; open?: boolean }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open ? { ...openedMixin(theme), "& .MuiDrawer-paper": openedMixin(theme) } : { ...closedMixin(theme), "& .MuiDrawer-paper": closedMixin(theme) }),
  })
);

interface SidebarProps {
  open: boolean;
  drawerWidth: number;
  isMobile: boolean;
  onClose?: () => void;
}

function SideBar({ open, drawerWidth, isMobile, onClose }: SidebarProps) {
  const theme = useTheme();
  const location = useLocation();

  const drawerPaperProps = {
    sx: {
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
      border: "none",
    },
  };

  const iconStyles = { color: theme.palette.mode === "dark" ? "#00f5ff" : "#444", fontSize: "1.2rem" };
  const labelTypography = { fontSize: "0.875rem" };
  const listBtnStyles = { height: 36, px: 2.5 };

  const matchesRoute = (matcher: string) =>
    location.pathname === matcher || location.pathname.startsWith(`${matcher}/`);

  const handleNavClick = () => {
    if (isMobile && onClose) onClose();
  };

  const drawerContent = (
    <>
      <DrawerHeader sx={{ justifyContent: "center" }}>
        <img
          src={open ? ludoLogo : ludoIcon}
          style={{ height: "25px", filter: theme.palette.mode === "dark" ? "invert(1)" : "" }}
        />
      </DrawerHeader>

      <List>
        <SidebarItem
          label="Dashboard"
          to={ROUTES.DASHBOARD}
          icon={<LayoutDashboard strokeWidth={1.5} size={20} color={theme.palette.mode === "dark" ? "#999" : "#111"} />}
          open={open}
          matchesRoute={matchesRoute}
          handleNavClick={handleNavClick}
        />

        {hasPermission(PERMISSIONS.CATEGORY.LIST) && (
          <SidebarItem
            label="Category"
            to={ROUTES.CATEGORY.LIST}
            icon={<Shapes strokeWidth={1.5} size={20} color={theme.palette.mode === "dark" ? "#999" : "#111"} />}
            open={open}
            matchesRoute={matchesRoute}
            handleNavClick={handleNavClick}
          />
        )}

        {hasPermission(PERMISSIONS.TABLE.LIST) && (
          <SidebarItem
            label="Table"
            to={ROUTES.TABLE.LIST}
            icon={<GalleryHorizontal strokeWidth={1.5} size={20} color={theme.palette.mode === "dark" ? "#999" : "#111"} />}
            open={open}
            matchesRoute={matchesRoute}
            handleNavClick={handleNavClick}
          />
        )}

        {hasPermission(PERMISSIONS.TOURNAMENT.LIST) && (
          <SidebarItem
            label="Tournament"
            to={ROUTES.TOURNAMENT.LIST}
            icon={<Trophy strokeWidth={1.5} size={20} color={theme.palette.mode === "dark" ? "#999" : "#111"} />}
            open={open}
            matchesRoute={matchesRoute}
            handleNavClick={handleNavClick}
          />
        )}

        {hasPermission(PERMISSIONS.CUSTOMER.LIST) && (
          <SidebarItem
            label="Customer"
            to={ROUTES.CUSTOMER.LIST}
            icon={<Users strokeWidth={1.5} size={20} color={theme.palette.mode === "dark" ? "#999" : "#111"} />}
            open={open}
            matchesRoute={matchesRoute}
            handleNavClick={handleNavClick}
          />
        )}

        {hasPermission(PERMISSIONS.USER.LIST) && (
          <>
            <SidebarItem
              label="Users"
              to={ROUTES.USER.LIST}
              icon={<ShieldUser strokeWidth={1.5} size={20} color={theme.palette.mode === "dark" ? "#999" : "#111"} />}
              open={open}
              matchesRoute={matchesRoute}
              handleNavClick={handleNavClick}
            />
            <SidebarItem
              label="Payments"
              to={ROUTES.PAYMENT.LIST}
              icon={<DollarSign strokeWidth={1.5} size={20} color={theme.palette.mode === "dark" ? "#999" : "#111"} />}
              open={open}
              matchesRoute={matchesRoute}
              handleNavClick={handleNavClick}
            />

            <SidebarItem
              label="Sales Analytics"
              to={ROUTES.PAYMENT.CHART}
              icon={<ChartNoAxesCombined strokeWidth={1.5} size={20} color={theme.palette.mode === "dark" ? "#999" : "#111"} />}
              open={open}
              matchesRoute={matchesRoute}
              handleNavClick={handleNavClick}
            />
          </>
        )}

          
      </List>
    </>
  );

  if (isMobile) {
    return (
      <MuiDrawer
        variant="temporary"
        open={open}
        onClose={onClose || (() => {})}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }}
        PaperProps={drawerPaperProps}
      >
        {drawerContent}
      </MuiDrawer>
    );
  }

  return (
    <Drawer variant="permanent" open={open} PaperProps={drawerPaperProps} sx={{ display: { xs: "none", md: "block" } }}>
      {drawerContent}
    </Drawer>
  );
}

interface SidebarItemProps {
  label: string;
  to: string;
  icon: React.ReactNode;
  open: boolean;
  matchesRoute: (matcher: string) => boolean;
  handleNavClick: () => void;
}

function SidebarItem({ label, to, icon, open, matchesRoute, handleNavClick }: SidebarItemProps) {
  return (
    <ListItem key={label} disablePadding sx={{ display: "block" }}>
      <Tooltip title={label} placement="right" disableHoverListener={open} disableFocusListener={open}>
        <ListItemButton
          component={NavLink}
          to={to}
          selected={matchesRoute(to)}
          onClick={handleNavClick}
          sx={[{ height: 36, px: 2.5 }, open ? { justifyContent: "initial" } : { justifyContent: "center" }]}
        >
          <ListItemIcon sx={[{ minWidth: 0, justifyContent: "center" }, open ? { mr: 2 } : { mr: "auto" }]}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={label}
            sx={open ? { opacity: 1 } : { opacity: 0 }}
            primaryTypographyProps={{ fontSize: "0.875rem" }}
          />
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}

export default SideBar;
