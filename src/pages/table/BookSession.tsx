    import Grid from '@mui/material/Grid';
    import { Controller, useForm } from 'react-hook-form';
    import FormInput from '../../components/FormInput';
    import { Fragment, useState, useEffect, useCallback, useContext, useMemo } from 'react';
    import {
        CircularProgress,
        Button,
        IconButton,
        Box,
        Typography,
        Select,
        InputLabel,
        MenuItem,
        FormHelperText,
        FormControl,
        FormLabel,
        RadioGroup,
        FormControlLabel,
        Radio,
        Dialog,
        DialogContent,
        DialogActions,
        DialogTitle
    } from '@mui/material';
    import { Plus } from 'lucide-react';
    import { Autocomplete } from '@mui/material';
    import { debounce } from '@mui/material/utils';
    import { GetCustomers } from '../../services/customer.service';
    import { CompanyContext } from '../../hooks/CompanyContext';
    import { TableSessionBilling } from '../../services/payment.service';
    import { PAYMENT_METHOD } from '../../utils/constants';
    import { BookTableSession } from '../../services/table.session.service';
    import { useToast } from '../../utils/toast.tsx';
    import { useTableSession } from '../../hooks/TableSessionContext';
    import SaveCustomer from '../../components/SaveCustomer';

    const BookSession = ({
        open,
        handleDialogClose,
        tableUuid,
        categoryPrices,
        onBookingSuccess
    }: {
        open: boolean;
        handleDialogClose: () => void;
        tableUuid: string;
        categoryPrices: any[];
        onBookingSuccess?: () => void;
    }) => {
        const defaultValues = {
            tableUuid,
            categoryPriceUuid: '',
            customerUuid: '',
            paymentMethod: ''
        };

        const { control, handleSubmit, watch, setValue, reset } = useForm({
            mode: 'onChange',
            defaultValues
        });

        const categoryPriceUuid = watch('categoryPriceUuid');
        const paymentMethod = watch('paymentMethod');

        const [bookSessionLoader, setBookSessionLoader] = useState(false);
        const companyContext: any = useContext(CompanyContext);
        const { addTableSession } = useTableSession();
        const companyUuid = companyContext.companyUuid;
        const [billingLoader, setBillingLoader] = useState(false);
        const [billingData, setBillingData] = useState<any>(null);

        const [customers, setCustomers] = useState<any[]>([]);
        const [customerId, setCustomerId] = useState<{ label: string; value: string }>({ label: '', value: '' });
        const [customerLoader, setCustomerLoader] = useState(false);
        const [searchCustomer, setSearchCustomer] = useState('');
        const [saveCustomerDialogOpen, setSaveCustomerDialogOpen] = useState(false);

        const { successToast, errorToast } = useToast();

        // -------------------- Fetch Customers --------------------
        const fetchCustomers = ({ searchCustomer, companyUuid }: { searchCustomer: string; companyUuid: string }) => {
            setCustomerLoader(true);
            GetCustomers({}, { companyUuid, searchText: searchCustomer })
                .then((response: any) => {
                    const { list } = response;
                    const rows = list.map((e: any) => ({
                        value: e.uuid,
                        label: `${e.fullName} (${e.phone || ''})`,
                        phoneCode: e.phoneCode || ''
                    }));
                    setCustomers(rows);
                })
                .catch((e) => console.error(e.message))
                .finally(() => setCustomerLoader(false));
        };

        const debouncedFetchCustomer = useCallback(
            debounce((searchCustomer, companyUuid) => fetchCustomers({ searchCustomer, companyUuid }), 800),
            []
        );

        useEffect(() => {
            if (searchCustomer) {
                debouncedFetchCustomer(searchCustomer, companyUuid);
            }
        }, [searchCustomer, debouncedFetchCustomer, companyUuid]);

        // -------------------- Fetch Billing --------------------
        const fetchBillingData = () => {
            setBillingLoader(true);
            TableSessionBilling({ companyUuid, tableUuid, categoryPriceUuid })
                .then((data) => setBillingData(data))
                .catch((e) => console.error(e.message))
                .finally(() => setBillingLoader(false));
        };

        useEffect(() => {
            if (open) {
                reset(defaultValues);
                setCustomerId({ label: '', value: '' });
                setCustomers([]);
                setSearchCustomer('');
                fetchBillingData();
            }
        }, [open, tableUuid]);

        useEffect(() => {
            if (categoryPriceUuid && open) {
                fetchBillingData();
            }
        }, [categoryPriceUuid]);

        // -------------------- Customer Handling --------------------
        const handleAddCustomer = () => setSaveCustomerDialogOpen(true);

        const handleCustomerCreated = (newCustomer: any) => {
            const customerOption = {
                value: newCustomer.uuid,
                label: `${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.phone || `${newCustomer.phoneCode}${newCustomer.phoneNumber}`})`,
                phoneCode: newCustomer.phoneCode || ''
            };
            setCustomers((prev) => [customerOption, ...prev]);
            setCustomerId(customerOption);
            setValue('customerUuid', newCustomer.uuid);
            setSaveCustomerDialogOpen(false);
        };

        const handleSaveCustomerDialogClose = () => setSaveCustomerDialogOpen(false);

        // -------------------- Tax Calculation --------------------
        const getTaxRate = (method: string) => {
            switch (method) {
                case 'CARD':
                    return 8;
                case 'CASH':
                case 'BANK_TRANSFER':
                    return 15;
                default:
                    return 0;
            }
        };

        const { subtotal, taxRate, taxAmount, grandTotal } = useMemo(() => {
            const selectedPrice = categoryPrices.find((p) => p.uuid === categoryPriceUuid);
            const price = selectedPrice ? selectedPrice.price : 0;
            const rate = getTaxRate(paymentMethod);
            const tax = price * (rate / 100);
            return { subtotal: price, taxRate: rate, taxAmount: tax, grandTotal: price + tax };
        }, [categoryPriceUuid, paymentMethod, categoryPrices]);

        // -------------------- Submit --------------------
        const onSubmit = () => {
            setBookSessionLoader(true);
            const input = {
                tableUuid,
                categoryPriceUuid,
                companyUuid,
                customerUuid: customerId.value,
                paymentMethod: { paymentScheme: paymentMethod },
                taxRate,
                taxAmount,
                totalAmount: grandTotal
            };
            BookTableSession(input)
                .then((res) => {
                    if (res.status) {
                        successToast('Session booked successfully');
                        addTableSession(tableUuid, res.data);
                        if (onBookingSuccess) onBookingSuccess();
                        handleDialogClose();
                    } else {
                        errorToast(res.errorMessage || 'Something went wrong!');
                    }
                })
                .catch(() => errorToast('Failed to book table session'))
                .finally(() => setBookSessionLoader(false));
        };

        const _handleDialogClose = () => {
            if (bookSessionLoader) return;
            reset(defaultValues);
            handleDialogClose();
            setBillingData(null);
        };

        // -------------------- Render --------------------
        return (
            <Fragment>
                <SaveCustomer
                    open={saveCustomerDialogOpen}
                    handleDialogClose={handleSaveCustomerDialogClose}
                    onCustomerCreated={handleCustomerCreated}
                />
                <Dialog open={open} onClose={_handleDialogClose} fullWidth maxWidth="sm">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogTitle>Book Session</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                {/* Session Duration */}
                                <Grid item xs={12}>
                                    <Controller
                                        name="categoryPriceUuid"
                                        control={control}
                                        rules={{ required: { value: true, message: 'Duration is required' } }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error} required fullWidth>
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
                                                {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>

                                {/* Customer Autocomplete */}
                                <Grid item xs={12} >
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                        <Controller
                                            name="customerUuid"
                                            control={control}
                                            rules={{ required: { value: true, message: 'Customer is required' } }}
                                            render={({ fieldState: { error } }) => (
                                                <Autocomplete
                                                    id="customer-dd"
                                                    options={customers}
                                                    value={customerId}
                                                    loading={customerLoader}
                                                    onInput={(e: any) => setSearchCustomer(e.target.value)}
                                                    getOptionLabel={(option) => option.label || ''}
                                                    onChange={(_event, value: any) => {
                                                        setCustomerId({ label: value?.label || '', value: value?.value || '' });
                                                        setValue('customerUuid', value?.value || '');
                                                    }}
                                                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                                                    filterOptions={(options, state) => {
                                                        const input = state.inputValue.trim();
                                                        return options.filter((option) =>
                                                            option.label.toLowerCase().includes(input.toLowerCase()) ||
                                                            option.label.includes(input.replace(/^0/, option.phoneCode)) ||
                                                            option.label.includes(input.replace(/^0/, ''))
                                                        );
                                                    }}
                                                    renderInput={(params) => (
                                                        <FormInput
                                                            fullWidth
                                                            error={error}
                                                            label="Customer"
                                                            placeholder="Search by name or phone number"
                                                            params={params}
                                                            slotProps={{
                                                                input: {
                                                                    ...params.InputProps,
                                                                    endAdornment: (
                                                                        <>
                                                                            {customerLoader && <CircularProgress color="primary" size={20} />}
                                                                            {params.InputProps.endAdornment}
                                                                        </>
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    sx={{ flex: 1 }}
                                                />
                                            )}
                                        />
                                        <IconButton
                                            type="button"
                                            onClick={handleAddCustomer}
                                            sx={{ color: 'primary.main', mt: '4px' }}
                                            title="Add new customer"
                                        >
                                            <Plus size={20} />
                                        </IconButton>
                                    </Box>
                                </Grid>

                                {/* Billing Summary */}
                                {billingData && categoryPriceUuid && (
                                    <Box sx={{ mt: 3, mb: 2, width: '100%' }}>
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
                                                Duration:{' '}
                                                {(() => {
                                                    const selectedPrice = categoryPrices.find((p) => p.uuid === categoryPriceUuid);
                                                    return selectedPrice
                                                        ? `${selectedPrice.duration} ${selectedPrice.unit === 'hours' ? 'hour' : 'mins'}${selectedPrice.freeMins ? ` + ${selectedPrice.freeMins}mins free` : ''}`
                                                        : '';
                                                })()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Rate:{' '}
                                                {(() => {
                                                    const selectedPrice = categoryPrices.find((p) => p.uuid === categoryPriceUuid);
                                                    return selectedPrice ? `${selectedPrice.price} ${selectedPrice.currencyName}` : '';
                                                })()}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Subtotal
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {subtotal.toFixed(2)}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Tax ({taxRate}%)
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {taxAmount.toFixed(2)}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'grey.300' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                Total Amount
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                {grandTotal.toFixed(2)}
                                            </Typography>
                                        </Box>

                                        {/* Payment Method */}
                                        <Box sx={{ mt: 2 }}>
                                            <Controller
                                                name="paymentMethod"
                                                control={control}
                                                rules={{ required: { value: true, message: 'Payment method is required' } }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <FormControl variant="standard" fullWidth error={!!error}>
                                                        <InputLabel>Payment method</InputLabel>
                                                        <Select {...field} value={field.value || ''} error={!!error}>
                                                            {Object.keys(PAYMENT_METHOD).map((key) => (
                                                                <MenuItem key={key} value={key}>
                                                                    {PAYMENT_METHOD[key as keyof typeof PAYMENT_METHOD]}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                                    </FormControl>
                                                )}
                                            />
                                        </Box>
                                    </Box>
                                )}

                                {billingLoader && (
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <CircularProgress size={30} />
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={handleDialogClose} color="error">
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={bookSessionLoader || billingLoader}>
                                {bookSessionLoader ? <CircularProgress size={20} /> : 'Book Now'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Fragment>
        );
    };

    export default BookSession;
