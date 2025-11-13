import { useState } from "react";
import { Card, CardContent, Box, Typography, Grid, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip } from "@mui/material";
import { UserPlus } from "lucide-react";
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
        category?: {
            uuid: string;
            name: string;
        };
    };
}

export default function DashboardTournament({ tournament }: DashboardTournamentProps) {
    const theme = useTheme();
    const [openModal, setOpenModal] = useState(false);
    
    const handleOpenModal = () => {
        setOpenModal(true);
    };
    
    const handleCloseModal = () => {
        setOpenModal(false);
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
        marginBottom: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
    };

    return (
        <Card sx={cardStyle}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                                {tournament.name}
                            </Typography>
                        </Box>
                    </Box>
                    <Tooltip title="Register Player" arrow placement="top">
                        <IconButton
                            onClick={handleOpenModal}
                            size="small"
                            sx={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '100%',
                                backgroundColor: 'primary.main',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                }
                            }}
                        >
                            <UserPlus size={18} strokeWidth={2} />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {formattedDate}
                        </Typography>
                    </Grid>
                    <Grid size={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {formattedTime}
                        </Typography>
                    </Grid>
                    <Grid size={4}>
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
                                Category: <strong>{tournament.category.name}</strong>
                            </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Entry: <strong>{currency} {tournament.entryFee?.toLocaleString() || '0'}</strong>
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

            {/* Player Registration Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    pb: 2,
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}>
                    <Box
                        sx={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <UserPlus size={20} color="#fff" strokeWidth={2} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Player Registration</Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Tournament: <strong>{tournament.name}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Date: {formattedDate} at {formattedTime}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>Player registration form will be implemented here.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                    <Button onClick={handleCloseModal} variant="outlined" sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleCloseModal} variant="contained" sx={{ textTransform: 'none' }}>Register</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
