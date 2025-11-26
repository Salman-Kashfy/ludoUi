import { useState } from "react";
import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import Grid from '@mui/material/Grid';
import { Plus, Users } from "lucide-react";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import PlayerRegistration from "../tournament/PlayerRegistration";
import TournamentPlayers from "../tournament/TournamentPlayers";

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
        playerCount: number;
        status?: string;
        category: {
            uuid: string;
            name: string;
        };
    };
}

export default function DashboardTournament({ tournament }: DashboardTournamentProps) {
    const theme = useTheme();
    const [tourRegModal, setTourRegModal] = useState(false);
    const [regPlayerModal, setRegPlayerModal] = useState(false);
    
    const handleOpenTourRegModal = () => {
        setTourRegModal(true);
    };
    
    const handleCloseTourRegModal = () => {
        setTourRegModal(false);
    };

    const handleOpenRegPlayerModal = () => {
        setRegPlayerModal(true);
    };

    const handleCloseRegPlayerModal = () => {
        setRegPlayerModal(false);
    };
    
    const formattedDate = dayjs(tournament.date).format('MMM DD, YYYY');
    
    const formatTime = (time: string) => {
        if (!time) return '-';
        const timeStr = time.includes(':') ? time.substring(0, 5) : time;
        const dateTime = dayjs(`${tournament.date} ${timeStr}`);
        return dateTime.isValid() ? dateTime.format('h:mm A') : timeStr;
    };
    
    const formattedTime = formatTime(tournament.startTime);
    const currency = tournament.currencyName || '';
    
    const cardStyle = {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
        marginBottom: 0,
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
    };

    return (
        <Card sx={cardStyle}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0 }}>{tournament.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{tournament.category.name}</Typography>
                        </Box>
                    </Box>
                    <Tooltip title="Participants" arrow placement="top">
                        <IconButton onClick={handleOpenRegPlayerModal} color="success" size="small">
                            <Users size={18} strokeWidth={1.5} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Register Player" arrow placement="top">
                        <IconButton onClick={handleOpenTourRegModal} color="primary" size="small">
                            <Plus size={18} strokeWidth={1.5} />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {formattedDate}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {formattedTime}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Prize Pool
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'success.main' }}>
                            {currency} {tournament.prizePool?.toLocaleString() || '0'}
                        </Typography>
                    </Grid>
                </Grid>

                {/* Footer */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {tournament.category && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Players: <strong>{tournament.playerCount}/{tournament.playerLimit}</strong>
                            </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Entry Fee: <strong>{currency} {tournament.entryFee?.toLocaleString() || '0'}</strong>
                        </Typography>
                    </Box>
                    {tournament.status && (
                        <Chip 
                            label={tournament.status} 
                            size="small" 
                            color="info"
                            variant="outlined"
                            sx={{ height: '22px', fontSize: '0.7rem' }}
                        />
                    )}
                </Box>
            </CardContent>

            <PlayerRegistration 
                open={tourRegModal} 
                onClose={handleCloseTourRegModal} 
                tournament={{
                    uuid: tournament.uuid || '',
                    name: tournament.name,
                    date: tournament.date,
                    startTime: tournament.startTime
                }}
            />
            <TournamentPlayers 
                open={regPlayerModal} 
                onClose={handleCloseRegPlayerModal} 
                tournamentUuid={tournament.uuid || ''}
            />
        </Card>
    );
}
