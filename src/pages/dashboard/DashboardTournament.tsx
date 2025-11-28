import { Fragment, useState } from "react";
import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from "@mui/material";
import Grid from '@mui/material/Grid';
import { Plus, Users, Play, CirclePlay, X } from "lucide-react";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import PlayerRegistration from "../tournament/PlayerRegistration";
import TournamentPlayers from "../tournament/TournamentPlayers";
import { TournamentStatus } from "./types";
import { useToast } from "../../utils/toast";
import { ROUTES } from "../../utils/constants";
import { StartTournament, TournamentRounds, StartNextTournamentRound } from "../../services/tournament.round.service";
import { TournamentRoundPlayers } from "../../services/tournament.round.player.service";

interface DashboardTournamentProps {
    tournament: {
        id?: string;
        uuid?: string;
        name: string;
        date: string;
        startTime: string;
        entryFee: number;
        prizePool: number;
        totalRounds: number;
        currencyName?: string;
        playerLimit: number;
        playerCount: number;
        status?: string;
        currentRound?: number;
        category: {
            uuid: string;
            name: string;
        };
    };
    onPlayerRegistered?: (tournamentUuid: string, playerCount: number) => void;
    onTournamentUpdated?: (tournamentUuid: string, updates: Record<string, any>) => void;
}

export default function DashboardTournament({ tournament, onPlayerRegistered, onTournamentUpdated }: DashboardTournamentProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { successToast, errorToast } = useToast();
    const [tourRegModal, setTourRegModal] = useState(false);
    const [regPlayerModal, setRegPlayerModal] = useState(false);
    const [startTournamentModal, setStartTournamentModal] = useState(false);
    const [startTournamentLoader, setStartTournamentLoader] = useState(false);
    const [roundsModalOpen, setRoundsModalOpen] = useState(false);
    const [roundsLoading, setRoundsLoading] = useState(false);
    const [roundEntries, setRoundEntries] = useState<any[]>([]);
    const [roundWinners, setRoundWinners] = useState<any[]>([]);
    const [roundWinnersLoading, setRoundWinnersLoading] = useState(false);
    const [activeRoundNumber, setActiveRoundNumber] = useState<number | null>(null);
    const [startNextRoundLoader, setStartNextRoundLoader] = useState(false);
    
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

    const handleOpenStartTournamentModal = () => {
        setStartTournamentModal(true);
    };

    const handleCloseStartTournamentModal = () => {
        setStartTournamentModal(false);
    };

    const transformLegacyRounds = (list: any[]) => {
        if (!Array.isArray(list) || !list.length) return [];
        const firstEntry = list[0];
        if (Array.isArray(firstEntry)) {
            return firstEntry;
        }
        if (firstEntry?.table) {
            return list.map((entry: any) => ({
                tableId: entry.tableId || entry.table?.uuid,
                table: entry.table,
                customers: entry.table?.customers || entry.customers || []
            }));
        }
        if (firstEntry && typeof firstEntry === 'object' && !firstEntry.uuid) {
            return Object.keys(firstEntry).map((key) => firstEntry[key]);
        }
        return [];
    };

    const groupPlayersByTable = (players: any[]) => {
        const grouped: Record<string, { tableId: any; table: any; customers: any[] }> = {};
        players.forEach((player: any, index: number) => {
            const tableKey = player.table?.uuid || `unassigned-${index}`;
            if (!grouped[tableKey]) {
                grouped[tableKey] = {
                    tableId: player.table?.id || tableKey,
                    table: player.table || { name: 'Unassigned' },
                    customers: []
                };
            }
            grouped[tableKey].customers.push({
                uuid: player.customer?.uuid,
                phone: player.customer?.phone,
                fullName: player.customer?.fullName,
                isWinner: player.isWinner
            });
        });
        return Object.values(grouped);
    };

    const loadTournamentRounds = async (round?: number) => {
        if (!tournament.uuid) return;
        const targetRound = round || tournament.currentRound || 1;
        setActiveRoundNumber(targetRound);
        setRoundsModalOpen(true);
        setRoundsLoading(true);
        setRoundWinnersLoading(true);
        try {
            const response = await TournamentRounds({
                tournamentUuid: tournament.uuid,
                round: targetRound
            });
            const list = response?.list || [];

            let normalizedEntries: any[] = [];
            let winnersList: any[] = [];

            let roundRecord: any = Array.isArray(list)
                ? list.find((entry: any) => entry?.round === targetRound && entry?.uuid)
                : null;
            if (!roundRecord && Array.isArray(list) && list[0]?.uuid) {
                roundRecord = list[0];
            }

            if (roundRecord?.uuid) {
                const [playersResponse, winnersResponse] = await Promise.all([
                    TournamentRoundPlayers({ tournamentRoundUuid: roundRecord.uuid }),
                    TournamentRoundPlayers({ tournamentRoundUuid: roundRecord.uuid, winnersOnly: true })
                ]);
                const playersList = playersResponse?.list || [];
                normalizedEntries = groupPlayersByTable(playersList);
                winnersList = winnersResponse?.list || [];
            } else {
                normalizedEntries = transformLegacyRounds(list);
                winnersList = [];
            }

            setRoundEntries(normalizedEntries || []);
            setRoundWinners(winnersList);
        } catch (error: any) {
            console.log(error?.message);
            errorToast('Failed to load rounds');
            setRoundsModalOpen(false);
        } finally {
            setRoundsLoading(false);
            setRoundWinnersLoading(false);
        }
    };

    const handleStartTournament = async () => {
        if (!tournament.uuid) return;
        if (tournament.playerCount < tournament.playerLimit) {
            const remaining = tournament.playerLimit - tournament.playerCount;
            errorToast(`Register ${remaining} more participant${remaining === 1 ? '' : 's'} before starting the tournament.`);
            return;
        }
        setStartTournamentLoader(true);
        try {
            const response = await StartTournament({
                tournamentUuid: tournament.uuid,
                randomize: true
            });
            if (response.status) {
                successToast('Tournament started successfully');
                const tournamentData = response.data?.tournament || response.data;
                const updates: Record<string, any> = {};
                if (tournamentData?.status) updates.status = tournamentData.status;
                if (tournamentData?.currentRound !== undefined) updates.currentRound = tournamentData.currentRound;
                if (tournamentData?.startedAt) updates.startedAt = tournamentData.startedAt;
                if (onTournamentUpdated) {
                    onTournamentUpdated(tournament.uuid, updates);
                }
                handleCloseStartTournamentModal();
                if (tournament.uuid) {
                    navigate(ROUTES.TOURNAMENT.ROUND_DETAILS(tournament.uuid as any));
                }
            } else {
                errorToast(response.errorMessage || 'Failed to start tournament');
            }
        } catch (error: any) {
            console.log(error?.message);
            errorToast('Failed to start tournament');
        } finally {
            setStartTournamentLoader(false);
        }
    };

    const currentRoundNumber = activeRoundNumber || tournament.currentRound || 1;
    const remainingRounds = (tournament.totalRounds || 0) - currentRoundNumber;
    const canStartNextRound = tournament.status === TournamentStatus.ACTIVE
        && remainingRounds > 0
        && roundWinners.length > 0;

    const handleStartNextRound = async () => {
        if (!tournament.uuid) return;
        setStartNextRoundLoader(true);
        try {
            const response = await StartNextTournamentRound({
                tournamentUuid: tournament.uuid
            });
            if (response.status) {
                successToast('Next round started');
                if (response.data && onTournamentUpdated) {
                    const updates: Record<string, any> = {};
                    if (response.data.status) updates.status = response.data.status;
                    if (response.data.currentRound !== undefined) updates.currentRound = response.data.currentRound;
                    if (response.data.startedAt) updates.startedAt = response.data.startedAt;
                    if (response.data.completedAt) updates.completedAt = response.data.completedAt;
                    onTournamentUpdated(tournament.uuid, updates);
                }
                const nextRound = response.data?.currentRound || ((activeRoundNumber || 1) + 1);
                await loadTournamentRounds(nextRound);
            } else {
                errorToast(response.errorMessage || 'Failed to start next round');
            }
        } catch (error: any) {
            console.log(error?.message);
            errorToast('Failed to start next round');
        } finally {
            setStartNextRoundLoader(false);
        }
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
                    {tournament.playerCount !== tournament.playerLimit ?
                        <Tooltip title="Register Player" arrow placement="top">
                            <IconButton onClick={handleOpenTourRegModal} color="primary" size="small">
                                <Plus size={18} strokeWidth={1.5} />
                            </IconButton>
                        </Tooltip>    
                    : 
                        <Fragment>
                            { tournament.status === TournamentStatus.UPCOMING ?
                            <Tooltip title="Start Tournament" arrow placement="top">
                                <IconButton onClick={handleOpenStartTournamentModal} color="primary" size="small">
                                    <Play size={18} strokeWidth={1.5} />
                                </IconButton>
                            </Tooltip>    
                            : 
                            <Tooltip title="View Round Details" arrow placement="top">
                                <IconButton onClick={() => tournament.uuid && navigate(ROUTES.TOURNAMENT.ROUND_DETAILS(tournament.uuid as any))} color="primary" size="small">
                                    <CirclePlay size={18} strokeWidth={1.5} />
                                </IconButton>
                            </Tooltip>
                            }
                        </Fragment>
                    }
                </Box>
                <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:3}}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {formattedDate}
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:3}}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {formattedTime}
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:3}}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Prize Pool
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'success.main' }}>
                            {currency} {tournament.prizePool?.toLocaleString() || '0'}
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:3}}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Total Rounds
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'success.main' }}>
                            {tournament.totalRounds || '0'}
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
                onSuccess={(playerCount: number) => {
                    if (onPlayerRegistered && tournament.uuid) {
                        onPlayerRegistered(tournament.uuid, playerCount);
                    }
                }}
            />
            <TournamentPlayers 
                open={regPlayerModal} 
                onClose={handleCloseRegPlayerModal} 
                tournamentUuid={tournament.uuid || ''}
            />
            <Dialog open={startTournamentModal} onClose={handleCloseStartTournamentModal} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Start Tournament</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Lets the game begin ?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseStartTournamentModal} color="error">
                        Cancel
                    </Button>
                    <Button onClick={handleStartTournament} variant="contained" color="primary" disabled={startTournamentLoader}>
                        {startTournamentLoader ? <CircularProgress size={20} color="inherit" /> : 'Start'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={roundsModalOpen} onClose={() => setRoundsModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {`Round ${activeRoundNumber || ''} Assignments`}
                    </Typography>
                    <IconButton onClick={() => setRoundsModalOpen(false)} size="small">
                        <X size={18} />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {roundsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : roundEntries.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            No round data available.
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {roundEntries.map((entry: any, index: number) => {
                                const customers = entry?.customers || entry?.table?.customers || [];
                                return (
                                    <Box
                                        key={entry.tableId || entry?.table?.uuid || index}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            p: 2
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            {entry?.table?.name || `Table ${entry.tableId || index + 1}`}
                                        </Typography>
                                        {customers.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                No players assigned.
                                            </Typography>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                {customers.map((customer: any, idx: number) => {
                                                    const label = customer.fullName || customer.phone || customer.uuid || `Player ${idx + 1}`;
                                                    const extra = customer.fullName && customer.phone ? ` (${customer.phone})` : '';
                                                    return (
                                                        <Typography
                                                            key={customer.uuid || idx}
                                                            variant="body2"
                                                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                                                        >
                                                            <span>{label}{extra}</span>
                                                            {customer.isWinner && (
                                                                <Typography component="span" variant="caption" color="success.main">
                                                                    Winner
                                                                </Typography>
                                                            )}
                                                        </Typography>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}

                            <Box sx={{ borderTop: '1px dashed', borderColor: 'divider', pt: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Winners
                                </Typography>
                                {roundWinnersLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                        <CircularProgress size={20} />
                                    </Box>
                                ) : roundWinners.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No winners declared yet.
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        {roundWinners.map((winner: any, idx: number) => (
                                            <Box
                                                key={winner.customer?.uuid || idx}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    py: 0.5
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {winner.customer?.fullName || winner.customer?.phone || `Winner ${idx + 1}`}
                                                    </Typography>
                                                    {winner.table?.name && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Table: {winner.table.name}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Chip label="Winner" color="success" size="small" />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {canStartNextRound && (
                        <Button
                            onClick={handleStartNextRound}
                            disabled={startNextRoundLoader}
                            variant="contained"
                            color="primary"
                        >
                            {startNextRoundLoader ? <CircularProgress size={20} color="inherit" /> : 'Start Next Round'}
                        </Button>
                    )}
                    <Button onClick={() => setRoundsModalOpen(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
