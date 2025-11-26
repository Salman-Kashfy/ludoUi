import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { LayoutDashboard, Shapes, GalleryHorizontal, Trophy } from 'lucide-react';
import { ROUTES, PERMISSIONS } from '../utils/constants';
import { hasPermission } from '../utils/permissions';

const navItems = [
    {
        label: 'Dashboard',
        value: ROUTES.DASHBOARD,
        icon: <LayoutDashboard size={18} strokeWidth={1.6} />,
        matchers: [ROUTES.DASHBOARD],
    },
    {
        label: 'Category',
        value: ROUTES.CATEGORY.LIST,
        permission: PERMISSIONS.CATEGORY.LIST,
        icon: <Shapes size={18} strokeWidth={1.6} />,
        matchers: [ROUTES.CATEGORY.LIST, '/category'],
    },
    {
        label: 'Tables',
        value: ROUTES.TABLE.LIST,
        permission: PERMISSIONS.TABLE.LIST,
        icon: <GalleryHorizontal size={18} strokeWidth={1.6} />,
        matchers: [ROUTES.TABLE.LIST, '/table'],
    },
    {
        label: 'Tournaments',
        value: ROUTES.TOURNAMENT.LIST,
        permission: PERMISSIONS.TOURNAMENT.LIST,
        icon: <Trophy size={18} strokeWidth={1.6} />,
        matchers: [ROUTES.TOURNAMENT.LIST, '/tournament'],
    },
];

interface BottomNavProps {
    visible?: boolean;
}

function BottomNav({ visible = true }: BottomNavProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const items = useMemo(() => {
        return navItems.filter((item) => {
            if (!item.permission) return true;
            return hasPermission(item.permission);
        });
    }, []);

    const matchesRoute = (matcher: string) => {
        return location.pathname === matcher || location.pathname.startsWith(`${matcher}/`);
    };

    const activeItem = items.find((item) =>
        (item.matchers || [item.value]).some(matchesRoute)
    );

    if (!visible || !items.length) {
        return null;
    }

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: visible ? 'block' : 'none',
                zIndex: (theme) => theme.zIndex.appBar + 1,
            }}
        >
            <BottomNavigation
                showLabels
                value={activeItem?.value || items[0].value}
                onChange={(_event, newValue) => {
                    navigate(newValue);
                }}
            >
                {items.map((item) => (
                    <BottomNavigationAction
                        key={item.value}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
}

export default BottomNav;

