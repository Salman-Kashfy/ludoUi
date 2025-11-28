import { Fragment, useState, useEffect } from "react";
import { Card, CardContent, Box, Typography, Chip, Button, CircularProgress, Tabs, Tab, Radio, RadioGroup, FormControlLabel, Tooltip, Switch } from "@mui/material";
import Grid from '@mui/material/Grid';
import { Trophy } from "lucide-react";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { useToast } from "../../utils/toast";
import { GetTournament } from "../../services/tournament.service";
import { StartNextTournamentRound, CompleteTournamentRound, TournamentRound } from "../../services/tournament.round.service";
import { TournamentStatus } from "../dashboard/types";
import ProgressBar from "../../components/ProgressBar";

export default function TournamentRoundDetails() {
    const { successToast, errorToast } = useToast();
    const { uuid } = useParams();
    const [loading, setLoading] = useState(true);
    const [tournament, setTournament] = useState<any>(null);
    const [selectedRound, setSelectedRound] = useState<number>(1);
    const [roundsData, setRoundsData] = useState<Record<number, { entries: any[]; winners: any[]; record: any; loading: boolean; players: any[] }>>({});
    const [selectedWinners, setSelectedWinners] = useState<Record<number, Set<string>>>({});
    const [startNextRoundLoader, setStartNextRoundLoader] = useState(false);
    const [completeRoundLoader, setCompleteRoundLoader] = useState(false);
    const [showWinnerSelection, setShowWinnerSelection] = useState(false);

    useEffect(() => {
        if (uuid) {
            loadTournament();
        }
    }, [uuid]);

    useEffect(() => {
        if (tournament) {
            const initialRound = tournament.currentRound || 1;
            setSelectedRound(initialRound);
            // Always load current round data dynamically
            loadTournamentRounds(initialRound, true);
        }
    }, [tournament]);

    const loadTournament = async () => {
        setLoading(true);
        try {
            const response = await GetTournament(uuid!);
            setTournament(response);
        } catch (error: any) {
            errorToast('Failed to load tournament');
        } finally {
            setLoading(false);
        }
    };


    const loadTournamentRounds = async (round: number, forceRefresh: boolean = false) => {
        if (!uuid) return;
        
        if (!forceRefresh && roundsData[round]?.entries?.length > 0) return;
        
        setRoundsData(prev => ({ ...prev, [round]: { ...prev[round], loading: true } }));

        try {
            const response = await TournamentRound(uuid, round);
            if (!response?.status) throw new Error(response?.errorMessage || 'Failed to fetch round data');
            
            const { round: roundInfo, tables = [] } = response.data || {};
            const roundRecord = roundInfo ? { uuid: roundInfo.uuid, id: roundInfo.id, round: roundInfo.round } : null;

            const entries = tables.map((tableData: any) => ({
                table: tableData.table,
                customers: tableData.players.map((player: any) => ({
                    uuid: player.customerUuid || player.customer?.uuid,
                    customerId: player.customerId,
                    phone: player.customer?.phone,
                    fullName: player.customer?.fullName,
                    isWinner: player.isWinner
                }))
            }));

            const winners = tables.flatMap((tableData: any) =>
                tableData.players
                    .filter((p: any) => p.isWinner)
                    .map((player: any) => ({
                        customerId: player.customerId,
                        customer: player.customer,
                        table: tableData.table
                    }))
            );

            const existingWinners = new Set<string>(
                winners.map((w: any) => w.customer?.uuid || w.customerUuid).filter(Boolean)
            );

            setRoundsData(prev => ({
                ...prev,
                [round]: {
                    entries,
                    winners,
                    record: roundRecord,
                    loading: false,
                    players: tables.flatMap((t: any) => t.players)
                }
            }));

            setSelectedWinners(prev => ({ ...prev, [round]: existingWinners }));
        } catch (error: any) {
            errorToast('Failed to load rounds');
            setRoundsData(prev => ({ ...prev, [round]: { ...prev[round], loading: false } }));
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        const roundNumber = newValue + 1;
        setSelectedRound(roundNumber);
        setShowWinnerSelection(false);
        loadTournamentRounds(roundNumber, true);
    };

    const handleWinnerToggle = (tableIndex: number, customerUuid: string) => {
        const round = selectedRound;
        setSelectedWinners(prev => {
            const current = new Set(prev[round] || []);
            const tableEntry = roundsData[round]?.entries?.[tableIndex];

            // Remove all customers from this table
            tableEntry?.customers?.forEach((c: any) => {
                if (c.uuid) current.delete(c.uuid);
            });

            // Add selected customer
            if (customerUuid) current.add(customerUuid);

            return { ...prev, [round]: current };
        });
    };

    const handleCompleteRound = async () => {
        if (!uuid) return;
        const round = selectedRound;
        const winnerCustomerUuid = selectedWinners[round] || new Set<string>();
        
        if (winnerCustomerUuid.size === 0) {
            errorToast('Please select at least one winner');
            return;
        }

        setCompleteRoundLoader(true);
        try {
            const response = await CompleteTournamentRound({
                tournamentUuid: uuid,
                round,
                winnerCustomerUuid: Array.from(winnerCustomerUuid)
            });
            
            if (response.status) {
                successToast('Round completed successfully');
                if (response.tournament) {
                    setTournament((prev: any) => ({ ...prev, ...response.tournament }));
                }
                await loadTournamentRounds(round, true);
            } else {
                errorToast(response.errorMessage || 'Failed to complete round');
            }
        } catch (error: any) {
            errorToast('Failed to complete round');
        } finally {
            setCompleteRoundLoader(false);
        }
    };

    const handleStartNextRound = async () => {
        if (!uuid) return;
        setStartNextRoundLoader(true);
        try {
            const response = await StartNextTournamentRound({
                tournamentUuid: uuid
            });
            if (response.status) {
                successToast('Next round started');
                const tournamentData = response.data?.tournament || response.data;
                if (tournamentData) {
                    setTournament((prev: any) => ({
                        ...prev,
                        ...tournamentData
                    }));
                }
                const nextRound = tournamentData?.currentRound || ((tournament?.currentRound || 1) + 1);
                setSelectedRound(nextRound);
                // Force refresh to get new round data
                await loadTournamentRounds(nextRound, true);
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

    const currentRoundNumber = tournament?.currentRound || 1;
    const totalRounds = tournament?.totalRounds || 0;
    const remainingRounds = totalRounds - currentRoundNumber;
    const currentRoundData = roundsData[selectedRound] || { entries: [], winners: [], record: null, loading: false, players: [] };
    const isCurrentRound = selectedRound === currentRoundNumber;
    const isRoundActive = tournament?.status === TournamentStatus.ACTIVE && isCurrentRound;
    const hasWinners = (currentRoundData.winners || []).length > 0;
    const selectedWinnersForRound = selectedWinners[selectedRound] || new Set<string>();
    const getSelectedWinnerForTable = (tableIndex: number) => {
        const tableEntry = currentRoundData.entries?.[tableIndex];
        if (!tableEntry?.customers) return '';
        const selected = tableEntry.customers.find((c: any) => selectedWinnersForRound.has(c.uuid));
        if (selected) return selected.uuid;
        const existingWinner = tableEntry.customers.find((c: any) => c.isWinner);
        return existingWinner?.uuid || '';
    };

    const allTablesHaveWinners = (currentRoundData.entries || []).every((entry: any) =>
        entry?.customers?.some((c: any) => selectedWinnersForRound.has(c.uuid) || c.isWinner)
    );
    const canCompleteRound = isRoundActive && !hasWinners && selectedWinnersForRound.size > 0 && allTablesHaveWinners;
    const canStartNextRound = tournament?.status === TournamentStatus.ACTIVE
        && remainingRounds > 0
        && hasWinners;

    const formattedDate = tournament?.date ? dayjs(tournament.date).format('MMM DD, YYYY') : '';
    const formatTime = (time: string) => {
        if (!time) return '-';
        const timeStr = time.includes(':') ? time.substring(0, 5) : time;
        const dateTime = dayjs(`${tournament?.date} ${timeStr}`);
        return dateTime.isValid() ? dateTime.format('h:mm A') : timeStr;
    };
    const formattedTime = formatTime(tournament?.startTime || '');
    const currency = tournament?.currencyName || '';

    if (loading) {
        return (
            <Fragment>
                <PageTitle title="Tournament Round Details" titleIcon={<Trophy />} />
                <Card>
                    <ProgressBar formLoader={loading}>{null}</ProgressBar>
                </Card>
            </Fragment>
        );
    }

    if (!tournament) {
        return (
            <Fragment>
                <PageTitle title="Tournament Round Details" titleIcon={<Trophy />} />
                <Card>
                    <CardContent>
                        <Typography variant="body1" color="text.secondary">
                            Tournament not found
                        </Typography>
                    </CardContent>
                </Card>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <PageTitle 
                title="Tournament Round Details" 
                titleIcon={<Trophy />}
            />
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {tournament.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {tournament.category?.name}
                            </Typography>
                        </Box>
                        {tournament.status && (
                            <Chip 
                                label={tournament.status} 
                                size="small" 
                                color="info"
                                variant="outlined"
                            />
                        )}
                    </Box>
                    <Grid container spacing={2}>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Date
                            </Typography>
                            <Typography variant="body2">
                                {formattedDate}
                            </Typography>
                        </Grid>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Time
                            </Typography>
                            <Typography variant="body2">
                                {formattedTime}
                            </Typography>
                        </Grid>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Prize Pool
                            </Typography>
                            <Typography variant="body2">
                                {currency} {tournament.prizePool?.toLocaleString() || '0'}
                            </Typography>
                        </Grid>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Current Round
                            </Typography>
                            <Typography variant="body2">
                                Round {currentRoundNumber} of {tournament.totalRounds || 0}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    {totalRounds > 1 && (
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs 
                                value={selectedRound - 1} 
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                {Array.from({ length: totalRounds }, (_, i) => i + 1).map((roundNum) => (
                                    <Tab 
                                        key={roundNum} 
                                        label={`Round ${roundNum}`}
                                        value={roundNum - 1}
                                        disabled={roundNum > currentRoundNumber && tournament?.status !== TournamentStatus.COMPLETED}
                                    />
                                ))}
                            </Tabs>
                        </Box>
                    )}
                    <Box sx={{ p: 2.5 }}>
                        {currentRoundData.loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (currentRoundData.entries || []).length > 0 ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Round {selectedRound} - Tables & Players
                                    </Typography>
                                    {isRoundActive && !hasWinners && (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={showWinnerSelection}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setShowWinnerSelection(isChecked);
                                                        if (!isChecked) {
                                                            // Reset winners when toggle is turned off
                                                            setSelectedWinners(prev => ({
                                                                ...prev,
                                                                [selectedRound]: new Set<string>()
                                                            }));
                                                        }
                                                    }}
                                                    size="small"
                                                />
                                            }
                                            label="Select Winners"
                                        />
                                    )}
                                </Box>
                                <Grid container spacing={2}>
                                    {currentRoundData.entries.map((entry: any, index: number) => {
                                        const customers = entry?.customers || entry?.table?.customers || [];
                                        return (
                                            <Grid
                                                key={entry?.table?.uuid || index}
                                                size={{xs:12, sm:6, md:3}}
                                            >
                                                <Box
                                                    sx={{
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderRadius: 1,
                                                        p: 2,
                                                        height: '100%'
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                                                        {entry?.table?.name}
                                                    </Typography>
                                                    {customers.length === 0 ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            No players assigned.
                                                        </Typography>
                                                    ) : (
                                                        <Box>
                                                            {isRoundActive && !hasWinners && showWinnerSelection ? (
                                                                <RadioGroup
                                                                    value={getSelectedWinnerForTable(index)}
                                                                    onChange={(e) => handleWinnerToggle(index, e.target.value)}
                                                                >
                                                                    {customers.map((customer: any, idx: number) => {
                                                                        const customerName = customer.fullName || `Player ${idx + 1}`;
                                                                        const tooltipContent = (
                                                                            <Box>
                                                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                                                    {customerName}
                                                                                </Typography>
                                                                                <Typography variant="caption">
                                                                                    Phone: {customer.phone || 'N/A'}
                                                                                </Typography>
                                                                            </Box>
                                                                        );
                                                                        
                                                                        return (
                                                                            <FormControlLabel
                                                                                key={customer.uuid || idx}
                                                                                value={customer.uuid}
                                                                                control={<Radio size="small" />}
                                                                                label={
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                        <Tooltip title={tooltipContent} arrow>
                                                                                            <Typography variant="body2">{customerName}</Typography>
                                                                                        </Tooltip>
                                                                                        {customer.isWinner && (
                                                                                            <Chip label="Winner" color="success" size="small" sx={{ height: '20px', fontSize: '0.7rem' }} />
                                                                                        )}
                                                                                    </Box>
                                                                                }
                                                                                sx={{ margin: 0, mb: 0.5 }}
                                                                            />
                                                                        );
                                                                    })}
                                                                </RadioGroup>
                                                            ) : (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                    {customers.map((customer: any, idx: number) => {
                                                                        const customerName = customer.fullName || `Player ${idx + 1}`;
                                                                        const phone = customer.phone || 'N/A';
                                                                        const isWinner = customer.isWinner;
                                                                        const tooltipContent = (
                                                                            <Box>
                                                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                                                    {customerName}
                                                                                </Typography>
                                                                                <Typography variant="caption">
                                                                                    Phone: {phone}
                                                                                </Typography>
                                                                            </Box>
                                                                        );
                                                                        
                                                                        return (
                                                                            <Box
                                                                                key={customer.uuid || idx}
                                                                                sx={{ 
                                                                                    display: 'flex', 
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center',
                                                                                    py: 0.5
                                                                                }}
                                                                            >
                                                                                <Tooltip title={tooltipContent} arrow>
                                                                                    <Typography variant="body2">
                                                                                        {customerName}
                                                                                    </Typography>
                                                                                </Tooltip>
                                                                                {isWinner && (
                                                                                    <Chip 
                                                                                        label="Winner" 
                                                                                        color="success" 
                                                                                        size="small"
                                                                                        sx={{ height: '20px', fontSize: '0.7rem' }}
                                                                                    />
                                                                                )}
                                                                            </Box>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                            </Grid>
                            </>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No record found for Round {selectedRound}
                                </Typography>
                            </Box>
                        )}

                        {((currentRoundData.winners || []).length > 0 || selectedWinnersForRound.size > 0) && (
                            <>
                                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 3, pt: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        {((currentRoundData.winners || []).length || selectedWinnersForRound.size)} Winner{((currentRoundData.winners || []).length || selectedWinnersForRound.size) !== 1 ? 's' : ''} of Round {selectedRound}
                                    </Typography>
                                {(currentRoundData.winners || []).length > 0 ? (
                                    <Grid container spacing={2}>
                                        {currentRoundData.winners.map((winner: any, idx: number) => (
                                            <Grid key={winner.customer?.uuid || winner.customerId || idx} size={{ xs: 12, sm: 6, md: 3 }}>
                                                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, height: '100%' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {winner.customer?.fullName || winner.customer?.phone || `Winner ${idx + 1}`}
                                                    </Typography>
                                                    {winner.table.name && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                            Table: {winner.table.name}
                                                        </Typography>
                                                    )}
                                                    <Chip label="Winner" color="success" size="small" />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Grid container spacing={2}>
                                        {(currentRoundData.entries || []).map((entry: any, tableIdx: number) => {
                                            const tableWinner = entry?.customers?.find((c: any) => 
                                                selectedWinnersForRound.has(c.uuid)
                                            );
                                            if (!tableWinner) return null;
                                            
                                            return (
                                                <Grid key={tableWinner.uuid || tableIdx} size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, height: '100%' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {tableWinner.fullName || tableWinner.phone || `Winner ${tableIdx + 1}`}
                                                        </Typography>
                                                        {entry?.table?.name && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                                Table: {entry.table.name}
                                                            </Typography>
                                                        )}
                                                        <Chip label="Winner" color="success" size="small" />
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                )}
                                </Box>
                            </>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {(canCompleteRound || canStartNextRound) && (
                <Card>
                    <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            {canCompleteRound && (
                                <Button
                                    onClick={handleCompleteRound}
                                    disabled={completeRoundLoader}
                                    variant="contained"
                                    color="success"
                                >
                                    {completeRoundLoader ? <CircularProgress size={20} color="inherit" /> : 'Complete Round'}
                                </Button>
                            )}
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
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Fragment>
    );
}

