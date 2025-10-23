import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import { Fragment, useState, useEffect, useCallback, useContext } from 'react';
import { CircularProgress, Button, IconButton, Box, Typography, Paper } from '@mui/material';
import { Plus } from 'lucide-react';
import { Autocomplete } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import {debounce} from "@mui/material/utils";
import { GetCustomers } from '../../services/customer.service';
import {CompanyContext} from '../../hooks/CompanyContext';
import { TableSessionBilling } from '../../services/payment.service';

const BookSession = ({open, handleDialogClose, tableUuid, onSuccess}:{open:boolean, handleDialogClose:() => void, tableUuid:string, onSuccess:() => void}) => {

    const defaultValues = {
        tableUuid,
        hours: 1,
        customerUuid: '',
    }
    const {control, handleSubmit, watch, setValue, reset} = useForm({
        mode: "onChange",
        defaultValues
    })
    const hours = watch('hours')
    const customerUuid = watch('customerUuid')
    const [bookSessionLoader, setBookSessionLoader] = useState(false);
    const companyContext:any = useContext(CompanyContext)
    const companyUuid = companyContext.companyUuid
    const [billingLoader, setBillingLoader] = useState(false);
    const [billingData, setBillingData] = useState<any>(null);

    const [customers, setCustomers] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState<{label: string, value: string}>({label: '', value: ''});
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");

    const fetchCustomers = ({searchCustomer, companyUuid}:{searchCustomer:string, companyUuid:string}) => {
        setCustomerLoader(true)
        GetCustomers({}, {companyUuid, searchText: searchCustomer}).then((response:any) => {
            const { list } = response
            const rows = list.map((e:any) => {
                return {
                    value: e.uuid,
                    label: e.fullName+' ('+e.phone+')',
                    phoneCode: e.fullName+' ('+e.phoneCode+')',
                }
            })
            setCustomers(() => rows)
        }).catch((e) => {
            console.log(e.message)
        }).finally(() => {
            setCustomerLoader(false)
        })
    }

    const debouncedFetchCustomer = useCallback(
        debounce((searchCustomer, companyUuid) => fetchCustomers({searchCustomer, companyUuid}), 800),
        []
    );

    useEffect(() => {
        if (searchCustomer){
            debouncedFetchCustomer(searchCustomer, companyUuid)
        }
    }, [searchCustomer, debouncedFetchCustomer]);

    useEffect(() => {
        reset(defaultValues)
    }, [tableUuid])

    useEffect(() => { 
        if(hours){
            setBillingLoader(true)
            TableSessionBilling({companyUuid, tableUuid, hours}).then((data) => {
                setBillingData(data)
            }).catch((e) => {
                console.log(e.message)
            }).finally(() => {
                setBillingLoader(false)
            })
        }
    }, [hours])

    const handleCustomerChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('customerUuid', value?.value || '')
        setCustomerId({label: value?.label || '', value: value?.value || ''})
    }   

    const handleAddCustomer = () => {
        // TODO: Implement add customer functionality
        console.log('Add customer clicked');
    }

    const onSubmit = () => {
        setBookSessionLoader(true)
        onSuccess()
    }

    return (
        <Fragment>
            <Dialog open={open} onClose={handleDialogClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Book Session</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <FormControl>
                                    <FormLabel id="hours">Session Duration</FormLabel>
                                    <RadioGroup
                                        row
                                        aria-labelledby="hours"
                                        name="hours"
                                        value={hours}
                                        onChange={(e:any) => setValue('hours', e.target.value)}
                                    >
                                        <FormControlLabel value="1" control={<Radio />} label="1 hr" />
                                        <FormControlLabel value="2" control={<Radio />} label="2 hr" />
                                        <FormControlLabel value="3" control={<Radio />} label="3 hr" />
                                        <FormControlLabel value="4" control={<Radio />} label="4 hr" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid size={12}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Controller name="customerUuid" control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Customer is required"
                                                    },
                                                }}
                                                render={() => (
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
                                                        renderInput={(params) => <FormInput fullWidth={true} label={'Customer'} placeholder={'Search by name or phone number'} params={params}
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
                                            mt: 2.5,
                                            color: 'primary.main',
                                        }}
                                        title="Add new customer"
                                    >
                                        <Plus size={20} />
                                    </IconButton>
                                </Box>
                            </Grid>
                            
                            {/* Billing Information */}
                            {billingData && (
                                <Grid size={12}>
                                    <Paper sx={{ p: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                            Billing Summary
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Table: {billingData.table.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Category: {billingData.table.category.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Duration: {billingData.billing.hours} hour{billingData.billing.hours !== '1' ? 's' : ''}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Rate: {billingData.billing.hourlyRate} {billingData.billing.currencyName}/hr
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'grey.300' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                Total Amount
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                {billingData.billing.totalAmount} {billingData.billing.currencyName}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                            
                            {billingLoader && (
                                <Grid size={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            Calculating billing...
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{p: 2}}>
                        <Button onClick={handleDialogClose} color="error">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={bookSessionLoader || billingLoader}>Book Now</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    )
}

export default BookSession;