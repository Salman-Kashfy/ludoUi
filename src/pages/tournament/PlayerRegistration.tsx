import { useState, useEffect, useCallback, useContext, Fragment } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton, Autocomplete } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Plus } from "lucide-react";
import { PlayerRegistrationBill } from "../../services/tournament.service";
import { GetCustomers } from "../../services/customer.service";
import { useToast } from "../../utils/toast";
import { CompanyContext } from "../../hooks/CompanyContext";
import FormInput from "../../components/FormInput";
import { debounce } from "@mui/material/utils";

interface PlayerRegistrationProps {
    open: boolean;
    onClose: () => void;
    tournament: {
        uuid: string;
        name: string;
        date: string;
        startTime: string;
    };
}

export default function PlayerRegistration({ open, onClose, tournament }: PlayerRegistrationProps) {
    const theme = useTheme();
    const { errorToast } = useToast();
    const companyContext: any = useContext(CompanyContext);
    const companyUuid = companyContext.companyUuid;
    
    const [loading, setLoading] = useState(false);
    const [billingData, setBillingData] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState<{label: string, value: string}>({label: '', value: ''});
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");

    const fetchCustomers = useCallback(({searchCustomer, companyUuid}:{searchCustomer:string, companyUuid:string}) => {
        setCustomerLoader(true);
        GetCustomers({}, {companyUuid, searchText: searchCustomer}).then((response:any) => {
            const { list } = response;
            const rows = list.map((e:any) => {
                return {
                    value: e.uuid,
                    label: e.fullName+' ('+e.phone+')',
                    phoneCode: e.fullName+' ('+e.phoneCode+')',
                };
            });
            setCustomers(() => rows);
        }).catch((e) => {
            console.log(e.message);
        }).finally(() => {
            setCustomerLoader(false);
        });
    }, []);

    const debouncedFetchCustomer = useCallback(
        debounce((searchCustomer, companyUuid) => fetchCustomers({searchCustomer, companyUuid}), 800),
        [fetchCustomers]
    );

    useEffect(() => {
        if (searchCustomer && companyUuid){
            debouncedFetchCustomer(searchCustomer, companyUuid);
        }
    }, [searchCustomer, debouncedFetchCustomer, companyUuid]);

    const loadBillingData = useCallback(async () => {
        if (!open || !tournament.uuid || !customerId.value) return;
        
        setLoading(true);
        setBillingData(null);
        setErrorMessage('');
        
        try {
            const response = await PlayerRegistrationBill({
                tournamentUuid: tournament.uuid,
                customerUuid: customerId.value
            });
            
            if (response.status) {
                setBillingData(response.data);
            } else {
                setErrorMessage(response.errorMessage || 'Failed to get billing information');
            }
        } catch (error: any) {
            errorToast('Failed to load billing information');
            setErrorMessage('Failed to load billing information');
        } finally {
            setLoading(false);
        }
    }, [open, tournament.uuid, customerId.value, errorToast]);

    useEffect(() => {
        if (open && tournament.uuid && customerId.value) {
            loadBillingData();
        } else {
            setBillingData(null);
            setErrorMessage('');
        }
    }, [open, tournament.uuid, customerId.value, loadBillingData]);

    useEffect(() => {
        if (open) {
            setCustomerId({label: '', value: ''});
            setCustomers([]);
            setSearchCustomer('');
            setBillingData(null);
            setErrorMessage('');
        }
    }, [open]);

    const handleCustomerChange = (_event: any, value: { value: string, label: string } | null) => {
        setCustomerId({label: value?.label || '', value: value?.value || ''});
    };

    const handleAddCustomer = () => {
        console.log('Add customer clicked');
    };

    const handleRegister = async () => {
        // Registration logic can be added here later
        // For now, just close the modal or show success message
    };

    const handleClose = () => {
        setBillingData(null);
        setErrorMessage('');
        setCustomerId({label: '', value: ''});
        setCustomers([]);
        setSearchCustomer('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Player Registration</Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {errorMessage && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)', borderRadius: 1 }}>
                        <Typography variant="body1" color="error">
                            {errorMessage}
                        </Typography>
                    </Box>
                )}
                
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                            <Autocomplete
                                id="customer-dd"
                                options={customers}
                                value={customerId}
                                loading={customerLoader}
                                onInput={(event:any) => setSearchCustomer(event.target.value)}
                                getOptionLabel={(option) => option.label || ''}
                                onChange={handleCustomerChange}
                                filterOptions={(options, state) => {
                                    const input = state.inputValue.trim();
                                    return options.filter(
                                        (option) =>
                                            option.label.toLowerCase().includes(input.toLowerCase()) ||
                                            option.label.includes(input.replace(/^0/, option.phoneCode)) ||
                                            option.label.includes(input.replace(/^0/, ''))
                                    );
                                }}
                                renderInput={(params) => <FormInput 
                                    fullWidth={true} 
                                    label={'Customer'} 
                                    placeholder={'Search by name or phone number'} 
                                    params={params}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Fragment>
                                                    {customerLoader ? <CircularProgress color="primary" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </Fragment>
                                            ),
                                        },
                                    }}
                                />}
                            />
                        </Box>
                        <IconButton 
                            onClick={handleAddCustomer}
                            sx={{ 
                                color: 'primary.main',
                            }}
                            title="Add new customer"
                        >
                            <Plus size={20} />
                        </IconButton>
                    </Box>
                </Box>
                
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : billingData ? (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Billing Information</Typography>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Tournament:</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>{billingData.name}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Entry Fee:</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {billingData.currencyName} {billingData.entryFee?.toLocaleString() || '0'}
                            </Typography>
                        </Box>
                    </Box>
                ) : customerId.value && !errorMessage ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : null}
            </DialogContent>
            <DialogActions sx={{p: 2}}>
                <Button onClick={handleClose} color="error">Cancel</Button>
                <Button onClick={handleRegister} variant="contained"  disabled={loading || !customerId.value || errorMessage} loading={loading}>Register</Button>
            </DialogActions>
        </Dialog>
    );
}

