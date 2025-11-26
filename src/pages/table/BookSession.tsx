import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import { Fragment, useState, useEffect, useCallback, useContext } from 'react';
import { CircularProgress, Button, IconButton, Box, Typography, Select, InputLabel, MenuItem, FormHelperText } from '@mui/material';
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
import { PAYMENT_METHOD } from '../../utils/constants';
import { BookTableSession } from '../../services/table.session.service';
import { useToast } from '../../utils/toast.tsx';
import { useTableSession } from '../../hooks/TableSessionContext';

const BookSession = ({open, handleDialogClose, tableUuid, categoryPrices, onBookingSuccess}:{open:boolean, handleDialogClose:() => void, tableUuid:string, categoryPrices: any[], onBookingSuccess?: () => void }) => {

    const defaultValues = {
        tableUuid,
        categoryPriceUuid: '',
        customerUuid: '',
        paymentMethod: '',
    }
    const {control, handleSubmit, watch, setValue, reset} = useForm({
        mode: "onChange",
        defaultValues
    })
    const categoryPriceUuid = watch('categoryPriceUuid')
    const paymentMethod = watch('paymentMethod')
    const [bookSessionLoader, setBookSessionLoader] = useState(false);
    const companyContext:any = useContext(CompanyContext)
    const { addTableSession } = useTableSession();
    const companyUuid = companyContext.companyUuid
    const [billingLoader, setBillingLoader] = useState(false);
    const [billingData, setBillingData] = useState<any>(null);

    const [customers, setCustomers] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState<{label: string, value: string}>({label: '', value: ''});
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");

    const { successToast, errorToast } = useToast();

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

    const fetchBillingData = () => {
        setBillingLoader(true)
        TableSessionBilling({companyUuid, tableUuid, categoryPriceUuid}).then((data) => {
            setBillingData(data)
        }).catch((e) => {
            console.log(e.message)
        }).finally(() => {
            setBillingLoader(false)
        })
    }

    useEffect(() => {
        if (open) {
            reset(defaultValues)
            setCustomerId({label: '', value: ''})
            setCustomers([])
            setSearchCustomer('')
            fetchBillingData()
        }
    }, [open, tableUuid])

    useEffect(() => {
        if (categoryPriceUuid && open) {
            fetchBillingData()
        }
    }, [categoryPriceUuid])

    const handleCustomerChange = (_event: any, value: { value: string, label: string } | null) => {
        setValue('customerUuid', value?.value || '')
        setCustomerId({label: value?.label || '', value: value?.value || ''})
    }   

    const handleAddCustomer = () => {
        console.log('Add customer clicked');
    }

    const onSubmit = () => {
        setBookSessionLoader(true)
        const input = {
            tableUuid, categoryPriceUuid, companyUuid,
            customerUuid: customerId.value,
            paymentMethod:{ paymentScheme: paymentMethod },
        }
        BookTableSession(input).then((res) => {
            console.log('BookTableSession response', res.data)
            if(res.status) {
                successToast('Session booked successfully')
                addTableSession(tableUuid, res.data)
                if (onBookingSuccess) {
                    onBookingSuccess();
                }
                handleDialogClose()
            } else {
                errorToast('Something went wrong!')
            }
        }).catch((e) => {
            console.log(e.message)
            errorToast('Failed to book table session')
        }).finally(() => {
            setBookSessionLoader(false)
        })
    }

    const _handleDialogClose = () => {
        if(bookSessionLoader) return;
        reset(defaultValues)
        handleDialogClose()
        setBillingData(null)
    }

    return (
        <Fragment>
            <Dialog open={open} onClose={_handleDialogClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Book Session</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name="categoryPriceUuid"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Duration is required"
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error} required>
                                            <FormLabel id="categoryPriceUuid">Session Duration</FormLabel>
                                            <RadioGroup
                                                row
                                                aria-labelledby="categoryPriceUuid"
                                                name="categoryPriceUuid"
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                            >
                                                {categoryPrices.map((price) => (
                                                    <FormControlLabel 
                                                        key={price.uuid}
                                                        value={price.uuid} 
                                                        control={<Radio />} 
                                                        label={`${price.duration} ${price.unit === 'hours' ? 'hour' : 'mins'}${price.freeMins ? ` + ${price.freeMins}mins free` : ''}`} 
                                                    />
                                                ))}
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml: 0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Controller name="customerUuid" control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Customer is required"
                                                    },
                                                }}
                                                render={({fieldState: {error}}) => (
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
                                                        renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Customer'} placeholder={'Search by name or phone number'} params={params}
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
                            </Grid>
                        </Grid>
                        {billingData && categoryPriceUuid && (
                            <Fragment>
                                <Box sx={{mt: 2, mb: 2}}>
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
                                            Duration: {(() => {
                                                const selectedPrice = categoryPrices.find(price => price.uuid === categoryPriceUuid);
                                                return selectedPrice ? `${selectedPrice.duration} ${selectedPrice.unit === 'hours' ? 'hour' : 'mins'}${selectedPrice.freeMins ? ` + ${selectedPrice.freeMins}mins free` : ''}` : '';
                                            })()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Rate: {(() => {
                                                const selectedPrice = categoryPrices.find(price => price.uuid === categoryPriceUuid);
                                                return selectedPrice ? `${selectedPrice.price} ${selectedPrice.currencyName}` : '';
                                            })()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'grey.300' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            Total Amount
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            {(() => {
                                                const selectedPrice = categoryPrices.find(price => price.uuid === categoryPriceUuid);
                                                return selectedPrice ? `${selectedPrice.price} ${selectedPrice.currencyName}` : '';
                                            })()}
                                        </Typography>
                                    </Box>
                                </Box>
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
                            </Fragment>
                            )}
                            
                            {billingLoader && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress size={30} />
                                    </Box>
                                </Grid>
                            )}
                    </DialogContent>
                    <DialogActions sx={{p: 2}}>
                        <Button onClick={handleDialogClose} color="error">Cancel</Button>
                        <Button type="submit" variant="contained" loading={bookSessionLoader} disabled={bookSessionLoader || billingLoader}>Book Now</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    )
}

export default BookSession;