import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import { Fragment, useState, useEffect, useContext, useMemo } from 'react';
import {
    CircularProgress,
    Button,
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
import { CompanyContext } from '../../hooks/CompanyContext';
import { TableSessionBilling } from '../../services/payment.service';
import { PAYMENT_METHOD } from '../../utils/constants';
import { RechargeTableSession } from '../../services/table.session.service';
import { useToast } from '../../utils/toast.tsx';
import { useTableSession } from '../../hooks/TableSessionContext';

interface RechargeSessionProps {
    open: boolean;
    handleDialogClose: () => void;
    tableUuid: string;
    tableSessionUuid: string;
    categoryPrices: any[];
    onRechargeSuccess?: () => void; // <-- new prop
}

const RechargeSession = ({
    open,
    handleDialogClose,
    tableUuid,
    tableSessionUuid,
    categoryPrices,
    onRechargeSuccess
}: RechargeSessionProps) => {

    const defaultValues = { tableUuid, categoryPriceUuid: '', paymentMethod: '' };
    const { control, handleSubmit, watch, reset } = useForm({ mode: 'onChange', defaultValues });
    const categoryPriceUuid = watch('categoryPriceUuid');
    const paymentMethod = watch('paymentMethod');

    const [rechargeSessionLoader, setRechargeSessionLoader] = useState(false);
    const [billingLoader, setBillingLoader] = useState(false);
    const [billingData, setBillingData] = useState<any>(null);

    const companyContext: any = useContext(CompanyContext);
    const { rechargeTableSession } = useTableSession();
    const companyUuid = companyContext.companyUuid;
    const { successToast, errorToast } = useToast();

    const getTaxRate = (method: string) => method === 'CARD' ? 8 : (method === 'CASH' || method === 'BANK_TRANSFER') ? 15 : 0;

    const { subtotal, taxRate, taxAmount, grandTotal } = useMemo(() => {
        const selectedPrice = categoryPrices.find(p => p.uuid === categoryPriceUuid);
        const price = selectedPrice ? selectedPrice.price : 0;
        const rate = getTaxRate(paymentMethod);
        const tax = price * (rate / 100);
        return { subtotal: price, taxRate: rate, taxAmount: tax, grandTotal: price + tax };
    }, [categoryPriceUuid, paymentMethod, categoryPrices]);

    const fetchBillingData = () => {
        setBillingLoader(true);
        TableSessionBilling({ companyUuid, tableUuid, categoryPriceUuid })
            .then(data => setBillingData(data))
            .catch(e => console.log(e.message))
            .finally(() => setBillingLoader(false));
    };

    useEffect(() => {
        if (open) { reset(defaultValues); setBillingData(null); fetchBillingData(); }
    }, [open, tableUuid]);

    useEffect(() => { if (categoryPriceUuid && open) fetchBillingData(); }, [categoryPriceUuid]);

    const onSubmit = () => {
        setRechargeSessionLoader(true);
        const input = { tableSessionUuid, categoryPriceUuid, paymentMethod: { paymentScheme: paymentMethod }, companyUuid, taxRate, taxAmount, totalAmount: grandTotal };

        RechargeTableSession(input)
            .then(res => {
                if(res?.status) {
                    successToast('Session recharged successfully');
                    rechargeTableSession(tableUuid, res.data);

                    // Refresh dashboard stats after recharge
                    if (onRechargeSuccess) onRechargeSuccess();

                    handleDialogClose();
                } else {
                    errorToast(res?.errorMessage || 'Failed to recharge table session');
                }
            })
            .catch(e => { console.log(e.message); errorToast('Failed to recharge table session'); })
            .finally(() => setRechargeSessionLoader(false));
    };

    const _handleDialogClose = () => {
        if (rechargeSessionLoader) return;
        reset(defaultValues);
        handleDialogClose();
        setBillingData(null);
    };

    return (
        <Fragment>
            <Dialog open={open} onClose={_handleDialogClose} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Recharge Session</DialogTitle>
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
                                            <FormLabel id="categoryPriceUuid">Additional Duration</FormLabel>
                                            <RadioGroup row {...field}>
                                                {categoryPrices.map(price => (
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

                            {/* Billing Summary */}
                            {billingData && categoryPriceUuid && (
                                <Box sx={{ mt: 2, mb: 2, width: '100%' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Recharge Summary</Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Table: {billingData.table.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">Category: {billingData.table.category.name}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Additional Duration: {categoryPrices.find(p => p.uuid === categoryPriceUuid)?.duration} 
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Rate: {categoryPrices.find(p => p.uuid === categoryPriceUuid)?.price}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                        <Typography variant="body2" color="text.secondary">{subtotal.toFixed(2)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Tax ({taxRate}%)</Typography>
                                        <Typography variant="body2" color="text.secondary">{taxAmount.toFixed(2)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'grey.300' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>Total Amount</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>{grandTotal.toFixed(2)}</Typography>
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
                                                    <Select {...field} value={field.value || ''}>
                                                        {Object.keys(PAYMENT_METHOD).map(key => (
                                                            <MenuItem key={key} value={key}>{PAYMENT_METHOD[key as keyof typeof PAYMENT_METHOD]}</MenuItem>
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
                        <Button onClick={_handleDialogClose} color="error">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={rechargeSessionLoader || billingLoader}>
                            {rechargeSessionLoader ? <CircularProgress size={20} /> : 'Recharge Now'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    );
};

export default RechargeSession;
