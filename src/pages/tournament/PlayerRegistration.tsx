import { useState, useEffect, useCallback, useContext, Fragment } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton, Autocomplete, Table, TableBody, TableRow, TableCell, Select, InputLabel, MenuItem, FormHelperText, FormControl } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { PlayerRegistrationBill, PlayerRegistration as PlayerRegistrationMutation } from "../../services/tournament.service";
import { GetCustomers } from "../../services/customer.service";
import { useToast } from "../../utils/toast";
import { CompanyContext } from "../../hooks/CompanyContext";
import FormInput from "../../components/FormInput";
import CreateCustomer from "../../components/CreateCustomer";
import { debounce } from "@mui/material/utils";
import { PAYMENT_METHOD } from "../../utils/constants";

interface PlayerRegistrationProps {
    open: boolean;
    onClose: () => void;
    tournament: {
        uuid: string;
        name: string;
        date: string;
        startTime: string;
    };
    onSuccess?: (playerCount: number) => void;
}

export default function PlayerRegistration({ open, onClose, tournament, onSuccess }: PlayerRegistrationProps) {
    const theme = useTheme();
    const { successToast, errorToast } = useToast();
    const companyContext: any = useContext(CompanyContext);
    const companyUuid = companyContext.companyUuid;
    
    const defaultValues = {
        customerUuid: '',
        paymentMethod: '',
    };
    
    const { control, handleSubmit, watch, setValue, reset } = useForm({
        mode: "onChange",
        defaultValues
    });
    
    const customerUuid = watch('customerUuid');
    const paymentMethod = watch('paymentMethod');
    
    const [loading, setLoading] = useState(false);
    const [registrationLoader, setRegistrationLoader] = useState(false);
    const [billingData, setBillingData] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState<{label: string, value: string}>({label: '', value: ''});
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [createCustomerDialogOpen, setCreateCustomerDialogOpen] = useState(false);

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
        if (!open || !tournament.uuid || !customerUuid) return;
        
        setLoading(true);
        setBillingData(null);
        setErrorMessage('');
        
        try {
            const response = await PlayerRegistrationBill({
                tournamentUuid: tournament.uuid,
                customerUuid: customerUuid
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
    }, [open, tournament.uuid, customerUuid, errorToast]);

    useEffect(() => {
        if (open && tournament.uuid && customerUuid) {
            loadBillingData();
        } else {
            setBillingData(null);
            setErrorMessage('');
        }
    }, [open, tournament.uuid, customerUuid, loadBillingData]);

    useEffect(() => {
        if (open) {
            reset(defaultValues);
            setCustomerId({label: '', value: ''});
            setCustomers([]);
            setSearchCustomer('');
            setBillingData(null);
            setErrorMessage('');
        }
    }, [open, reset]);

    const handleCustomerChange = (_event: any, value: { value: string, label: string } | null) => {
        setValue('customerUuid', value?.value || '');
        setCustomerId({label: value?.label || '', value: value?.value || ''});
    };

    const handleAddCustomer = () => {
        setCreateCustomerDialogOpen(true);
    };

    const handleCustomerCreated = (newCustomer: any) => {
        // Add the new customer to the list
        const customerOption = {
            value: newCustomer.uuid,
            label: `${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.phone || `${newCustomer.phoneCode}${newCustomer.phoneNumber}`})`,
            phoneCode: newCustomer.phoneCode || '',
        };
        setCustomers((prev) => [customerOption, ...prev]);
        // Select the newly created customer
        setCustomerId(customerOption);
        setValue('customerUuid', newCustomer.uuid);
        setCreateCustomerDialogOpen(false);
    };

    const handleCreateCustomerDialogClose = () => {
        setCreateCustomerDialogOpen(false);
    };

    const onSubmit = async () => {
        setRegistrationLoader(true);
        const input = {
            customerUuid: customerId.value,
            tournamentUuid: tournament.uuid,
            paymentMethod: {
                name: null,
                paymentScheme: paymentMethod,
            },
        };
        
        try {
            const response = await PlayerRegistrationMutation(input);
            if (response.status) {
                successToast('Player registered successfully');
                if (onSuccess && response.data?.playerCount !== undefined) {
                    onSuccess(response.data.playerCount);
                }
                handleClose();
            } else {
                errorToast(response.errorMessage || 'Failed to register player');
            }
        } catch (error: any) {
            console.log(error.message);
            errorToast('Failed to register player');
        } finally {
            setRegistrationLoader(false);
        }
    };

    const handleClose = () => {
        setBillingData(null);
        setErrorMessage('');
        setCustomerId({label: '', value: ''});
        setCustomers([]);
        setSearchCustomer('');
        reset(defaultValues);
        onClose();
    };

    return (
        <Fragment>
            <CreateCustomer
                open={createCustomerDialogOpen}
                handleDialogClose={handleCreateCustomerDialogClose}
                onCustomerCreated={handleCustomerCreated}
            />
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
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
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt:2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Controller
                                    name="customerUuid"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Customer is required"
                                        },
                                    }}
                                    render={({ fieldState: { error } }) => (
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
                                                error={error}
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
                                    )}
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : billingData ? (
                        <Box sx={{ mt: 1.5, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}` }}>
                            <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 1 } }}>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ width: '40%', color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500 }}>
                                            Tournament
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.875rem' }}>
                                            {billingData.name}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ width: '40%', color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500 }}>
                                            Entry Fee
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.875rem' }}>
                                            {billingData.currencyName} {billingData.entryFee?.toLocaleString() || '0'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                            Total
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '1rem', fontWeight: 600, color: 'primary.main' }}>
                                            {billingData.currencyName} {billingData.entryFee?.toLocaleString() || '0'}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    ) : customerUuid && !errorMessage ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : null}
                    
                    {billingData && customerUuid && (
                        <Box sx={{mt: 2}}>
                            <Controller name="paymentMethod" control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message: "Payment method is required"
                                    },
                                }}
                                render={({field, fieldState: {error}}) => (
                                    <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                        <InputLabel>Payment method</InputLabel>
                                        <Select label="Payment method" {...field} value={field.value || ''} error={!!error}>
                                            {Object.keys(PAYMENT_METHOD).map((key:string) => {
                                                return (<MenuItem value={key} key={key}>{PAYMENT_METHOD[key as keyof typeof PAYMENT_METHOD]}</MenuItem>)
                                            })}
                                        </Select>
                                        {error && <FormHelperText sx={{ml: 0}}>{error.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button onClick={handleClose} color="error" disabled={registrationLoader}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading || registrationLoader || !customerUuid || !!errorMessage || !paymentMethod}>
                        Register
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
        </Fragment>
    );
}

