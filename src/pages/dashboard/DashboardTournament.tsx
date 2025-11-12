import { Card, CardContent, Box, Typography, Grid, Chip } from "@mui/material";
import { Trophy, Calendar, Clock, DollarSign, Users, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";

interface DashboardTournamentProps {
    tournament: {
        id?: string;
        uuid?: string;
        name: string;
        date: string;
        startTime: string;
        entryFee: number;
        prizePool: number;
        currencyName?: string;
        playerLimit: number;
        status?: string;
    };
}

export default function DashboardTournament({ tournament }: DashboardTournamentProps) {
    const theme = useTheme();
    
    // Format date
    const formattedDate = dayjs(tournament.date).format('MMM DD, YYYY');
    
    // Format time in 12-hour format
    const formatTime = (time: string) => {
        if (!time) return '-';
        // If time is in HH:mm:ss format, extract HH:mm
        const timeStr = time.includes(':') ? time.substring(0, 5) : time;
        // Combine with date to create proper datetime for dayjs
        const dateTime = dayjs(`${tournament.date} ${timeStr}`);
        return dateTime.isValid() ? dateTime.format('h:mm A') : timeStr;
    };
    
    const formattedTime = formatTime(tournament.startTime);
    const currency = tournament.currencyName || '';
    
    const cardStyle = {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
        marginBottom: 2,
        borderRadius: 3,
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
        overflow: 'hidden',
        position: 'relative',
        // '&::before': {
        //     content: '""',
        //     position: 'absolute',
        //     top: 0,
        //     left: 0,
        //     right: 0,
        //     height: '4px',
        //     background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%)',
        // },
    };

    return (
        <Card sx={cardStyle}>
            <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 } }}>
                {/* Tournament Name Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, gap: 2 }}>
                    <Box
                        sx={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0px 4px 12px rgba(102, 126, 234, 0.4)',
                            flexShrink: 0,
                        }}
                    >
                        <Trophy size={28} color="#fff" strokeWidth={1.2} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                fontWeight: 500, 
                                mb: 1,
                                fontSize: '1.1rem',
                                lineHeight: 1.3,
                                background: theme.palette.mode === 'dark' 
                                    ? 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)'
                                    : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {tournament.name}
                        </Typography>
                        {tournament.status && (
                            <Chip 
                                icon={<Sparkles size={12} />}
                                label={tournament.status} 
                                size="small" 
                                color="info"
                                variant="outlined"
                                sx={{ 
                                    height: '24px', 
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    '& .MuiChip-icon': {
                                        marginLeft: '6px',
                                    }
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* 3-Column Grid */}
                <Grid container spacing={2.5}>
                    {/* Column 1: Date */}
                    <Grid size={4}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 2,
                                borderRadius: 2.5,
                                background: theme.palette.mode === 'dark' 
                                    ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(63, 81, 181, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(63, 81, 181, 0.08) 100%)',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.15)'}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0px 4px 12px rgba(33, 150, 243, 0.2)',
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #2196f3 0%, #3f51b5 100%)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mb: 1.5,
                                    boxShadow: '0px 4px 8px rgba(33, 150, 243, 0.3)',
                                }}
                            >
                                <Calendar size={22} color="#fff" strokeWidth={2} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'primary.main' }}>
                                {formattedDate}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Column 2: Time */}
                    <Grid size={4}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 2,
                                borderRadius: 2.5,
                                background: theme.palette.mode === 'dark' 
                                    ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(233, 30, 99, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(233, 30, 99, 0.08) 100%)',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.15)'}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0px 4px 12px rgba(156, 39, 176, 0.2)',
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mb: 1.5,
                                    boxShadow: '0px 4px 8px rgba(156, 39, 176, 0.3)',
                                }}
                            >
                                <Clock size={22} color="#fff" strokeWidth={2} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Start Time
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'secondary.main' }}>
                                {formattedTime}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Column 3: Prize Pool */}
                    <Grid size={4}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 2,
                                borderRadius: 2.5,
                                background: theme.palette.mode === 'dark' 
                                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.15)'}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0px 4px 12px rgba(76, 175, 80, 0.2)',
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mb: 1.5,
                                    boxShadow: '0px 4px 8px rgba(76, 175, 80, 0.3)',
                                }}
                            >
                                <DollarSign size={22} color="#fff" strokeWidth={2} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Prize Pool
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'success.main' }}>
                                {currency} {tournament.prizePool?.toLocaleString() || '0'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Player Limit & Entry Fee Footer */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 2,
                        mt: 3, 
                        pt: 2.5, 
                        borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                        background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)'
                            : 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.02) 50%, transparent 100%)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            background: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(0, 0, 0, 0.03)',
                        }}
                    >
                        <Box
                            sx={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0px 2px 8px rgba(255, 152, 0, 0.3)',
                            }}
                        >
                            <Users size={16} color="#fff" strokeWidth={2.5} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            Player Limit: <strong style={{ color: theme.palette.mode === 'dark' ? '#fff' : '#000', fontWeight: 700 }}>{tournament.playerLimit || 0}</strong>
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            background: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(0, 0, 0, 0.03)',
                        }}
                    >
                        <Box
                            sx={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0px 2px 8px rgba(76, 175, 80, 0.3)',
                            }}
                        >
                            <DollarSign size={16} color="#fff" strokeWidth={2.5} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            Entry Fee: <strong style={{ color: theme.palette.mode === 'dark' ? '#fff' : '#000', fontWeight: 700 }}>{currency} {tournament.entryFee?.toLocaleString() || '0'}</strong>
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
