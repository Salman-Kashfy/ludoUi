import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { Play, Square } from 'lucide-react';
import { StartTableSession, StopTableSession } from '../services/category.service';
import { useToast } from '../utils/toast.tsx';
import { first } from 'lodash';

interface TableSession {
    uuid: string;
    startTime: string;
    endTime: string | null;
}

interface Table {
    uuid: string;
    name: string;
    status: string;
    tableSessions: TableSession[];
}

interface TableCardProps {
    table: Table;
    onUpdate: () => void;
}

export function TableCard({ table, onUpdate }: TableCardProps) {
    const { successToast, errorToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    const activeSession = table.tableSessions?.length > 0 ? first(table.tableSessions) : null;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (activeSession) {
            interval = setInterval(() => {
                const startTime = parseInt(activeSession.startTime);
                const elapsed = Date.now() - startTime;
                const hours = Math.floor(elapsed / 3600000);
                const minutes = Math.floor((elapsed % 3600000) / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }, 1000);
        } else {
            setElapsedTime('00:00:00');
        }

        return () => clearInterval(interval);
    }, [activeSession]);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            await StartTableSession({ tableId: table.uuid });
            successToast('Table session started');
            onUpdate();
        } catch (error) {
            errorToast('Failed to start table session');
        } finally {
            setIsLoading(false);
        }
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
                        label={table.status} 
                        color={table.status === 'available' ? 'muted' : 'warning'} 
                        size="small" 
                    />
                </Box>
                
                <Typography variant="body2" color={activeSession ? "primary" : "text.secondary"} sx={{ mb: 2, fontFamily: 'monospace', minHeight: '20px' }}>
                    {activeSession ? elapsedTime : '00:00:00'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {!activeSession ? (
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<Play size={16} />}
                            onClick={handleStart}
                            disabled={isLoading}
                            fullWidth
                        >
                            Start
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<Square size={16} />}
                            onClick={handleStop}
                            disabled={isLoading}
                            fullWidth
                        >
                            Stop
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
