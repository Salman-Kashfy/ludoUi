import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

interface PlayerRegistrationProps {
    open: boolean;
    onClose: () => void;
    tournament: {
        name: string;
        date: string;
        startTime: string;
    };
}

export default function PlayerRegistration({ open, onClose, tournament }: PlayerRegistrationProps) {
    const theme = useTheme();
    
    const formattedDate = dayjs(tournament.date).format('MMM DD, YYYY');
    
    const formatTime = (time: string) => {
        if (!time) return '-';
        const timeStr = time.includes(':') ? time.substring(0, 5) : time;
        const dateTime = dayjs(`${tournament.date} ${timeStr}`);
        return dateTime.isValid() ? dateTime.format('h:mm A') : timeStr;
    };
    
    const formattedTime = formatTime(tournament.startTime);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Player Registration</Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Tournament: <strong>{tournament.name}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Date: {formattedDate} at {formattedTime}
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                    Player registration form will be implemented here.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>Cancel</Button>
                <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none' }}>Register</Button>
            </DialogActions>
        </Dialog>
    );
}

