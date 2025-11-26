import {Box, Typography, useTheme} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import SkeletonLoader from "../../components/SkeletonLoader";

function DashboardStat({title, value, icon, iconBg, loading}:{title: string, value: number, icon: React.ReactNode, iconBg: string, loading: boolean}) {
    const theme = useTheme()
    const iconDimension = {width: { xs: 32, md: 42 }, height: { xs: 32, md: 42 }, borderRadius: '8px'}
    const iconStyle = {
        ...iconDimension,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: iconBg,
        flexShrink: 0
    }
    const cardStyle = {backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff'}
    const skeletonStyles = {
        statValue: {width: '18px', height: '29px'},
        statTitle: {width: '125px', height: '10px', borderRadius: '2px'}
    }
    return (
        <Card sx={cardStyle}>
            <CardContent sx={{ padding: { xs: 1.25, md: 1.5 }, paddingBottom: '12px !important' }}>
                <Box display="flex" justifyContent="flex-start" gap={{ xs: 1.25, md: 2 }} alignItems="center">
                    {
                        loading ? <SkeletonLoader params={iconDimension}/> : <Box sx={iconStyle}>{icon}</Box>
                    }
                    <Box sx={{ minWidth: 0 }}>
                        { loading ?
                            <>
                                <SkeletonLoader params={skeletonStyles.statValue} sx={{mb:1}}/>
                                <SkeletonLoader params={skeletonStyles.statTitle} />
                            </> :
                            <>
                                <Typography variant="h6" component="div" sx={{mb:0,mt:'-5px'}}>{value}</Typography>
                                <Typography variant="body2" color="text.secondary">{title}</Typography>
                            </>
                        }
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}

export default DashboardStat