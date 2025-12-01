import { Fragment, useState, useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import FormInput from './FormInput';
import { CompanyContext } from '../hooks/CompanyContext';
import { CreateCustomer as CreateCustomerService } from '../services/customer.service';
import { useToast } from '../utils/toast';
import { phoneCodeOnly, phoneNumberOnly } from '../utils/validations';
import { getPhoneNumberMaxLength, validatePhoneNumber } from '../utils/phoneValidation';

interface CreateCustomerProps {
    open: boolean;
    handleDialogClose: () => void;
    onCustomerCreated: (customer: any) => void;
}

const CreateCustomer = ({ open, handleDialogClose, onCustomerCreated }: CreateCustomerProps) => {
    const companyContext: any = useContext(CompanyContext);
    const { successToast, errorToast } = useToast();
    const [loading, setLoading] = useState(false);

    const defaultValues = {
        firstName: '',
        lastName: '',
        phoneCode: '',
        phoneNumber: '',
        companyUuid: companyContext.companyUuid,
    };

    const { control, handleSubmit, reset, watch, getValues, trigger } = useForm({
        mode: "onChange",
        defaultValues
    });

    const phoneCode = watch('phoneCode');
    const phoneNumber = watch('phoneNumber');

    // Trigger phone number validation when phone code changes
    useEffect(() => {
        if (phoneCode && phoneNumber) {
            trigger('phoneNumber');
        }
    }, [phoneCode, trigger]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            // Ensure companyUuid is always current
            data.companyUuid = companyContext.companyUuid;
            const response = await CreateCustomerService(data);
            if (response.status) {
                successToast('Customer created successfully');
                onCustomerCreated(response.data);
                reset(defaultValues);
                handleDialogClose();
            } else {
                errorToast(response.errorMessage || 'Failed to create customer');
            }
        } catch (error: any) {
            console.error(error);
            errorToast('Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    const _handleDialogClose = () => {
        if (loading) return;
        reset(defaultValues);
        handleDialogClose();
    };

    return (
        <Fragment>
            <Dialog open={open} onClose={_handleDialogClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Create Customer</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "First name is required"
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: "First name must not exceed 100 characters"
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
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Last name is required"
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: "Last name must not exceed 100 characters"
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
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="phoneCode"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Phone code is required"
                                        },
                                        maxLength: {
                                            value: 10,
                                            message: "Phone code must not exceed 10 characters"
                                        },
                                        validate: (value) => {
                                            if (value && !value.startsWith('+')) {
                                                return "Phone code must start with +";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label="Phone Code"
                                            placeholder="+1"
                                            onInput={(e: any) => phoneCodeOnly(e, 10)}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Phone number is required"
                                        },
                                        validate: (value) => {
                                            const currentPhoneCode = getValues('phoneCode') || phoneCode || '';
                                            if (!currentPhoneCode) {
                                                return "Please enter phone code first";
                                            }
                                            return validatePhoneNumber(value, currentPhoneCode);
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => {
                                        const maxLength = getPhoneNumberMaxLength(phoneCode || '');
                                        return (
                                            <FormInput
                                                fullWidth={true}
                                                error={error}
                                                field={field}
                                                value={field.value || ''}
                                                label="Phone Number"
                                                placeholder={phoneCode ? `Enter phone number (max ${maxLength} digits)` : "Enter phone code first"}
                                                type="tel"
                                                disabled={!phoneCode}
                                                onInput={(e: any) => phoneNumberOnly(e, maxLength)}
                                            />
                                        );
                                    }}
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
                            Create Customer
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    );
};

export default CreateCustomer;

