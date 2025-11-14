import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Typography, CircularProgress, Box, IconButton } from "@mui/material";
import { X } from "lucide-react";
import { GetTournamentPlayers } from "../../services/tournament.service";
import { useToast } from "../../utils/toast";

interface TournamentPlayersProps {
    open: boolean;
    onClose: () => void;
    tournamentUuid: string;
}

export default function TournamentPlayers({ open, onClose, tournamentUuid }: TournamentPlayersProps) {
    const { errorToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [players, setPlayers] = useState<any[]>([]);

    useEffect(() => {
        if (open && tournamentUuid) {
            loadPlayers();
        }
    }, [open, tournamentUuid]);

    const loadPlayers = () => {
        setLoading(true);
        GetTournamentPlayers(tournamentUuid).then((res: any) => {
            setPlayers(res.list || []);
        }).catch(() => {
            errorToast('Failed to load players');
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Participants</Typography>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        ml: 2,
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: 'action.hover'
                        }
                    }}
                >
                    <X size={18} />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : players.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No participants registered yet.
                    </Typography>
                ) : (
                    <List>
                        {players.map((player: any, index: number) => (
                            <ListItem 
                                key={index} 
                                divider
                                sx={{ 
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={player.customer?.fullName || '-'}
                                    secondary={player.table?.name ? `Table: ${player.table.name}` : ''}
                                    secondaryTypographyProps={{
                                        sx: { color: 'text.secondary', fontSize: '0.75rem' }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
}

