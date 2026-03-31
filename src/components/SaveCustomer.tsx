import { Fragment, useState, useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import { MuiTelInput } from 'mui-tel-input';
import dayjs from 'dayjs';
import FormInput from './FormInput';
import { CompanyContext } from '../hooks/CompanyContext';
import { SaveCustomer as SaveCustomerService } from '../services/customer.service';
import { useToast } from '../utils/toast';

interface SaveCustomerProps {
    open: boolean;
    handleDialogClose: () => void;
    onCustomerCreated: (customer: any) => void;
    customer?: any;
}

const SaveCustomer = ({ open, handleDialogClose, onCustomerCreated, customer }: SaveCustomerProps) => {
    const companyContext: any = useContext(CompanyContext);
    const { successToast, errorToast } = useToast();
    const [loading, setLoading] = useState(false);

    const isEditMode = !!customer;

    const getDefaultValues = () => {
        if (customer) {
            const phone = customer.phoneCode && customer.phoneNumber
                ? `${customer.phoneCode}${customer.phoneNumber}`
                : customer.phone || '';

            return {
                firstName: customer.firstName || '',
                lastName: customer.lastName || '',
                phone,
                dob: customer.dob ? dayjs(customer.dob).format('YYYY-MM-DD') : '',
                companyUuid: companyContext.companyUuid,
            };
        }

        return {
            firstName: '',
            lastName: '',
            phone: '',
            dob: '',
            companyUuid: companyContext.companyUuid,
        };
    };

    const { control, handleSubmit, reset } = useForm({
        mode: 'onChange',
        defaultValues: getDefaultValues()
    });

    useEffect(() => {
        if (open) {
            reset(getDefaultValues());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, customer]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            data.companyUuid = companyContext.companyUuid;

            if (isEditMode && customer?.id) {
                data.uuid = customer.id;
            }

            if (data.dob) {
                const parsedDob = dayjs(data.dob);
                data.dob = parsedDob.isValid() ? parsedDob.format('YYYY-MM-DD') : null;
            } else {
                data.dob = null;
            }

            if (data.phone) {
                const phoneValue = data.phone;
                const { parsePhoneNumber } = await import('libphonenumber-js');

                try {
                    const phoneNumber = parsePhoneNumber(phoneValue);
                    data.phoneCode = phoneNumber.countryCallingCode ? `+${phoneNumber.countryCallingCode}` : '';
                    data.phoneNumber = phoneNumber.nationalNumber || '';
                } catch (e) {
                    const match = phoneValue.match(/^\+(\d{1,4})(.+)$/);
                    if (match) {
                        data.phoneCode = `+${match[1]}`;
                        data.phoneNumber = match[2];
                    } else {
                        data.phoneCode = '';
                        data.phoneNumber = phoneValue.replace(/[^0-9]/g, '');
                    }
                }
            }

            delete data.phone;

            const response = await SaveCustomerService(data);
            if (response.status) {
                successToast(isEditMode ? 'Customer updated successfully' : 'Customer created successfully');
                onCustomerCreated(response.data);
                reset(getDefaultValues());
                handleDialogClose();
            } else {
                errorToast(response.errorMessage || (isEditMode ? 'Failed to update customer' : 'Failed to create customer'));
            }
        } catch (error: any) {
            console.error(error);
            errorToast(isEditMode ? 'Failed to update customer' : 'Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    const _handleDialogClose = () => {
        if (loading) return;
        reset(getDefaultValues());
        handleDialogClose();
    };

    return (
        <Fragment>
            <Dialog open={open} onClose={_handleDialogClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>{isEditMode ? 'Edit Customer' : 'Create Customer'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'First name is required'
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: 'First name must not exceed 100 characters'
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label="First Name"
                                            placeholder="Enter first name"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'Last name is required'
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: 'Last name must not exceed 100 characters'
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label="Last Name"
                                            placeholder="Enter last name"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="dob"
                                    control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (!value) return true;
                                            return dayjs(value).isValid() || 'Please enter a valid date';
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label="Date of Birth"
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'Phone number is required'
                                        },
                                        validate: (value) => {
                                            if (!value) {
                                                return 'Phone number is required';
                                            }
                                            if (value && value.length < 8) {
                                                return 'Please enter a valid phone number';
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormControl fullWidth error={!!error}>
                                            <MuiTelInput
                                                {...field}
                                                label="Phone Number"
                                                placeholder="Enter phone number"
                                                defaultCountry="PK"
                                                preferredCountries={['PK', 'US', 'GB', 'IN']}
                                                size="small"
                                                fullWidth
                                                error={!!error}
                                                helperText={error?.message}
                                            />
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={_handleDialogClose} color="error" disabled={loading}>
                            Cancel
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            loading={loading}
                            disabled={loading}
                        >
                            {isEditMode ? 'Update Customer' : 'Create Customer'}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    );
};

export default SaveCustomer;