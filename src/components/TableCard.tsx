import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { Play, Square } from 'lucide-react';
import { StartTableSession, StopTableSession } from '../services/table.session.service';
import { useToast } from '../utils/toast.tsx';
import { useBooking } from '../hooks/BookingContext';
import { first, isEmpty } from 'lodash';
import { TableSessionStatus } from '../pages/table/types.ts';
import { TableSession, Table } from '../pages/dashboard/types';
import { CompanyContext } from '../hooks/CompanyContext';
import { useTableSession } from '../hooks/TableSessionContext';

interface TableCardProps {
    table: Table;
    onUpdate: () => void;
}

export function TableCard({ table, onUpdate }: TableCardProps) {
    const companyContext:any = useContext(CompanyContext)
    const companyUuid = companyContext.companyUuid
    const { successToast, errorToast } = useToast();
    const { openBookingDialog } = useBooking();
    const { updateTableSession } = useTableSession();
    const [isLoading, setIsLoading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const activeSession: TableSession | null = table.tableSessions?.length > 0 ? first(table.tableSessions) || null : null;

    // Function to format duration based on unit and duration
    const formatInitialDuration = (duration: number, unit: string): string => {
        let totalSeconds: number;
        
        if (unit === 'hours') {
            totalSeconds = duration * 3600; // Convert hours to seconds
        } else if (unit === 'minutes') {
            totalSeconds = duration * 60; // Convert minutes to seconds
        } else {
            totalSeconds = duration; // Assume seconds if unit is not specified
        }
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }


    useEffect(() => {
        let interval: number;
        
        if (activeSession?.status === TableSessionStatus.ACTIVE) {
            interval = setInterval(() => {
                // Parse startTime as UTC timestamp
                const startTime = new Date(activeSession.startTime).getTime();
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                
                let initialDurationMs: number;
                if (activeSession.unit === 'hours') {
                    initialDurationMs = activeSession.duration * 3600000; // Convert hours to milliseconds
                } else if (activeSession.unit === 'minutes') {
                    initialDurationMs = activeSession.duration * 60000; // Convert minutes to milliseconds
                } else {
                    initialDurationMs = activeSession.duration * 1000; // Assume seconds
                }
                
                const remaining = initialDurationMs - elapsed;
                
                if (remaining <= 0) {
                    setElapsedTime('00:00:00');
                } else {
                    const hours = Math.floor(remaining / 3600000);
                    const minutes = Math.floor((remaining % 3600000) / 60000);
                    const seconds = Math.floor((remaining % 60000) / 1000);
                    setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                }
            }, 1000);
        } else if (activeSession?.status === TableSessionStatus.BOOKED) {
            // Show initial duration for booked sessions
            setElapsedTime(formatInitialDuration(activeSession.duration, activeSession.unit));
        } else {
            setElapsedTime('00:00:00');
        }

        return () => clearInterval(interval);
    }, [activeSession]);

    const startSession = async (tableSessionUuid: string) => {
        setIsLoading(true);
        StartTableSession({ companyUuid, tableSessionUuid }).then((res:any) => {
            if(res.status) {
                successToast('Table session started');
                updateTableSession(table.uuid, res.data);
            } else {
                errorToast(res.errorMessage || 'Failed to start table session');
            }
        }).catch((error:any) => {
            console.log(error)
            errorToast('Failed to start table session');
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const handleStop = async () => {
        if (!activeSession) return;
        setIsLoading(true);
        try {
            await StopTableSession({ tableSessionId: activeSession.uuid });
            successToast('Table session stopped');
            onUpdate();
        } catch (error) {
            errorToast('Failed to stop table session');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card sx={{ minWidth: 200 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">{table.name}</Typography>
                    <Chip 
                        label={!activeSession ? 'available' : activeSession!.status} 
                        color={!activeSession ? 'default' : activeSession!.status === TableSessionStatus.BOOKED ? 'success' : 'error'} 
                        size="small" 
                    />
                </Box>
                
                <Typography variant="body2" color={activeSession ? "primary" : "text.secondary"} sx={{ mb: 2, fontFamily: 'monospace', minHeight: '20px' }}>
                    {activeSession ? elapsedTime : '00:00:00'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {isEmpty(activeSession) ? (
                        <Button variant="contained" color="primary" size="small" onClick={() => openBookingDialog(table.uuid)} disabled={isLoading} fullWidth>Book</Button>
                    ) : activeSession.status === TableSessionStatus.BOOKED ? (
                        <Button variant="contained" color="success" size="small" startIcon={<Play size={16} />} onClick={() => startSession(activeSession.uuid)} disabled={isLoading} fullWidth>Start</Button>
                    ) : activeSession ? (
                        <Button variant="contained" color="error" size="small" startIcon={<Square size={16} />} onClick={handleStop} disabled={isLoading} fullWidth>Stop</Button>
                    ) : null}
                </Box>
            </CardContent>
        </Card>
    );
}
