import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import { Fragment, useState, useEffect, useContext } from 'react';
import { CircularProgress, Button, Box, Typography, Select, InputLabel, MenuItem, FormHelperText } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import {CompanyContext} from '../../hooks/CompanyContext';
import { TableSessionBilling } from '../../services/payment.service';
import { PAYMENT_METHOD } from '../../utils/constants';
import { RechargeTableSession } from '../../services/table.session.service';
import { useToast } from '../../utils/toast.tsx';
import { useTableSession } from '../../hooks/TableSessionContext';

const RechargeSession = ({open, handleDialogClose, tableUuid, tableSessionUuid, categoryPrices}:{
    open: boolean, 
    handleDialogClose: () => void, 
    tableUuid: string,
    tableSessionUuid: string,
    categoryPrices: any[]
}) => {

    const defaultValues = {
        tableUuid,
        categoryPriceUuid: '',
        paymentMethod: '',
    }
    const {control, handleSubmit, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })
    const categoryPriceUuid = watch('categoryPriceUuid')
    const paymentMethod = watch('paymentMethod')
    const [rechargeSessionLoader, setRechargeSessionLoader] = useState(false);
    const companyContext:any = useContext(CompanyContext)
    const { rechargeTableSession } = useTableSession();
    const companyUuid = companyContext.companyUuid
    const [billingLoader, setBillingLoader] = useState(false);
    const [billingData, setBillingData] = useState<any>(null);

    const { successToast, errorToast } = useToast();

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
            fetchBillingData()
        }
    }, [open, tableUuid])

    useEffect(() => {
        if (categoryPriceUuid && open) {
            fetchBillingData()
        }
    }, [categoryPriceUuid])

    const onSubmit = () => {
        setRechargeSessionLoader(true)
        const input = {
            tableSessionUuid: tableSessionUuid,
            categoryPriceUuid: categoryPriceUuid,
            paymentMethod: { paymentScheme: paymentMethod },
            companyUuid
        }
        RechargeTableSession(input).then((res) => {
            if(res.status) {
                successToast('Session recharged successfully')
                rechargeTableSession(tableUuid, res.data)
                handleDialogClose()
            } else {
                errorToast(res.errorMessage || 'Failed to recharge table session')
            }
        }).catch((e) => {
            console.log(e.message)
            errorToast('Failed to recharge table session')
        }).finally(() => {
            setRechargeSessionLoader(false)
        })
    }

    const _handleDialogClose = () => {
        if(rechargeSessionLoader) return;
        reset(defaultValues)
        handleDialogClose()
        setBillingData(null)
    }

    return (
        <Fragment>
            <Dialog open={open} onClose={_handleDialogClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Recharge Session</DialogTitle>
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
                                            <FormLabel id="categoryPriceUuid">Additional Duration</FormLabel>
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
                        </Grid>
                        {billingData && categoryPriceUuid && (
                            <Fragment>
                                <Box sx={{mt: 2, mb: 2}}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                        Recharge Summary
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
                                            Additional Duration: {(() => {
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
                                            Additional Amount
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
                        <Button type="submit" variant="contained" loading={rechargeSessionLoader} disabled={rechargeSessionLoader || billingLoader}>
                            Recharge Now
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    )
}

export default RechargeSession;
