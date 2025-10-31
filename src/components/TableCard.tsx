import { useState, useEffect, useContext, Fragment } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, IconButton } from '@mui/material';
import { Play, Square, Zap } from 'lucide-react';
import { StartTableSession, StopTableSession } from '../services/table.session.service';
import { useToast } from '../utils/toast.tsx';
import { useBooking } from '../hooks/BookingContext';
import { first, isEmpty } from 'lodash';
import { TableSessionStatus } from '../pages/table/types.ts';
import { TableSession, Table, CategoryPrice } from '../pages/dashboard/types';
import { CompanyContext } from '../hooks/CompanyContext';
import { useTableSession } from '../hooks/TableSessionContext';

interface TableCardProps {
    table: Table;
    categoryPrices: CategoryPrice[];
    onUpdate: () => void;
}

export function TableCard({ table, categoryPrices, onUpdate }: TableCardProps) {
    const companyContext:any = useContext(CompanyContext)
    const companyUuid = companyContext.companyUuid
    const { successToast, errorToast } = useToast();
    const { openBookingDialog, openRechargeDialog } = useBooking();
    const { updateTableSession } = useTableSession();
    const [isLoading, setIsLoading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const activeSession: TableSession | null = table.tableSessions?.length > 0 ? first(table.tableSessions) || null : null;

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
      
        if (activeSession?.status === TableSessionStatus.ACTIVE && activeSession.startTime) {
          interval = setInterval(() => {
            // Convert both to UTC timestamps
            const startTimeUTC = new Date(activeSession.startTime).getTime();
            const currentTimeUTC = Date.now();
      
            // Calculate difference (future = positive, past = negative)
            const diff = startTimeUTC - currentTimeUTC;
      
            if (diff <= 0) {
              // Start time reached or passed → stop at 00:00:00
              setElapsedTime('00:00:00');
              if (interval) {
                clearInterval(interval);
                interval = null;
              }
            } else {
              // Convert diff (ms) → hours/mins/secs
              const hours = Math.floor(diff / 3600000);
              const minutes = Math.floor((diff % 3600000) / 60000);
              const seconds = Math.floor((diff % 60000) / 1000);
      
              setElapsedTime(
                `${hours.toString().padStart(2, '0')}:${minutes
                  .toString()
                  .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
              );
            }
          }, 1000);
        } else {
          setElapsedTime('00:00:00');
        }
      
        return () => {
          if (interval) {
            clearInterval(interval);
          }
        };
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
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color={activeSession ? "primary" : "text.secondary"} sx={{ fontFamily: 'monospace', minHeight: '20px' }}>
                        {activeSession ? elapsedTime : '00:00:00'}
                    </Typography>
                    {activeSession && activeSession.status === TableSessionStatus.ACTIVE ? (
                        <IconButton 
                            size="small" 
                            onClick={() => openRechargeDialog(table.uuid, activeSession.uuid, categoryPrices)}
                            disabled={!activeSession || isLoading || elapsedTime === '00:00:00'}
                            color="warning"
                            title="Recharge Session"
                        >
                            <Zap size={18} strokeWidth={1.25} />
                        </IconButton>
                    ) : <Fragment>
                            <Box sx={{height: 28, width: 28}}></Box>
                        </Fragment>}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {isEmpty(activeSession) ? (
                        <Button variant="contained" color="primary" size="small" onClick={() => openBookingDialog(table.uuid, categoryPrices)} disabled={isLoading} fullWidth>Book</Button>
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
