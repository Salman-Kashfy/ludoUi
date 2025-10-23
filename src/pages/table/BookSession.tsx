import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import { Fragment, useState, useEffect } from 'react';
import { CircularProgress, Button } from '@mui/material';
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
    const [bookSessionLoader, setBookSessionLoader] = useState(false);

    const [customers, setCustomers] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState<{label: string, value: string}>({label: '', value: ''});
    const [customerLoader, setCustomerLoader] = useState<boolean>(false);
    const [searchCustomer, setSearchCustomer] = useState<string>('');

    useEffect(() => {
        reset(defaultValues)
    }, [tableUuid])

    const handleCustomerChange = (event: any, value: { value: string, label: string } | null) => {
        setCustomerId({label: value?.label || '', value: value?.value || ''})
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
                                        value={watch('hours')}
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
                            <Controller name="customerUuid" control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Status is required"
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <Autocomplete
                                            id="customer-dd"
                                            options={customers}
                                            value={customerId}
                                            loading={customerLoader}
                                            onInput={(event:any) => setSearchCustomer(event.target.value)}
                                            getOptionLabel={(option) => option.label || ''}
                                            onChange={handleCustomerChange}
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
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{p: 2}}>
                        <Button onClick={handleDialogClose} color="error">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={bookSessionLoader}>Book Now</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    )
}

export default BookSession;