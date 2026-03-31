import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, FormControl, Card, CardContent } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { MuiTelInput } from 'mui-tel-input';
import dayjs from 'dayjs';
import FormInput from '../../components/FormInput';
import { RegisterCustomer, SaveCustomerDevice } from '../../services/customer.service';
import { constants, ROUTES } from '../../utils/constants';
import { useToast } from '../../utils/toast';
import { getFCMToken } from '../../config/firebase.service';
import { getDeviceToken, getDeviceType } from '../../utils/deviceUtils';

interface RegistrationFormValues {
    firstName: string;
    lastName: string;
    phone: string;
    dob: string;
}

const promptNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

function Register() {
    const navigate = useNavigate();
    const { successToast, errorToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { control, handleSubmit, reset } = useForm<RegistrationFormValues>({
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            dob: ''
        }
    });

    const onSubmit = async (data: RegistrationFormValues) => {
        setLoading(true);
        setErrorMessage('');

        const companyUuid = constants.DEFAULT_COMPANY_UUID || localStorage.getItem(constants.LOCAL_STORAGE_COMPANY) || '';

        const params = {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneCode: '',
            phoneNumber: '',
            dob: data.dob || null,
            companyUuid,
            deviceToken: '',
            deviceType: getDeviceType(),
            fcmToken: null
        } as any;

        // Parse phone using libphonenumber-js if possible (same logic as SaveCustomer)
        if (data.phone) {
            try {
                const { parsePhoneNumber } = await import('libphonenumber-js');
                const phoneNumber = parsePhoneNumber(data.phone);
                params.phoneCode = phoneNumber.countryCallingCode ? `+${phoneNumber.countryCallingCode}` : '';
                params.phoneNumber = phoneNumber.nationalNumber || '';
            } catch (e) {
                const match = data.phone.match(/^\+(\d{1,4})(.+)$/);
                if (match) {
                    params.phoneCode = `+${match[1]}`;
                    params.phoneNumber = match[2];
                } else {
                    params.phoneCode = '';
                    params.phoneNumber = data.phone.replace(/[^0-9]/g, '');
                }
            }
        }

        try {
            const permissionGranted = await promptNotificationPermission();
            console.log("Permission:", Notification.permission);

            params.deviceToken = getDeviceToken();

            if (permissionGranted) {
                params.fcmToken = await getFCMToken(true);
                console.log("FCM TOKEN:", params.fcmToken);
            } else {
                console.log("Permission not granted");
            }

            const response = (await RegisterCustomer(params)) || { status: false, data: null, errorMessage: 'Failed to register customer' };
            if (!response.status || !response.data) {
                const message = response.errorMessage || 'Failed to register customer';

                // Check if customer already exists
                if (message === 'CUSTOMER_ALREADY_EXISTS') {
                    setErrorMessage('This phone number is already registered. Please login instead.');
                    errorToast('This phone number is already registered. Please login instead.');
                    // Redirect to login after 2 seconds
                    setTimeout(() => navigate(ROUTES.AUTH.LOGIN), 2000);
                } else {
                    setErrorMessage(message);
                    errorToast(message);
                }
                setLoading(false);
                return;
            }

            const customerUuid = response.data.uuid;
            const fullName = `${data.firstName} ${data.lastName}`;

            try {
                await SaveCustomerDevice({
                    customerUuid,
                    deviceToken: params.deviceToken,
                    deviceType: params.deviceType,
                    fcmToken: params.fcmToken || undefined
                });
            } catch (deviceSaveError) {
                console.warn('Failed to save customer device during registration:', deviceSaveError);
            }

            successToast('Registration successful!');
            localStorage.setItem('LRCL_CUSTOMER_UUID', customerUuid);
            reset();
            navigate(ROUTES.AUTH.THANK_YOU, {
                state: {
                    customerName: fullName,
                    customerUuid,
                    phone: data.phone,
                    phoneCode: params.phoneCode,
                    phoneNumber: params.phoneNumber
                }
            });
        } catch (err: any) {
            const message = err?.message || 'Failed to register customer';
            setErrorMessage(message);
            errorToast(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 }
        }}>
            <Card 
                sx={{ 
                    maxWidth: 450, 
                    width: '100%', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    overflow: 'hidden'
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Typography 
                        variant="h5" 
                        sx={{ 
                            mb: 2, 
                            fontWeight: 600, 
                            color: 'text.primary',
                            textAlign: 'center',
                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                        }}
                    >
                        Create Account
                    </Typography>

                    <Typography 
                        variant="body2" 
                        sx={{ 
                            mb: 4, 
                            color: 'text.secondary',
                            textAlign: 'center',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        Join us and start playing today
                    </Typography>

                    <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: { value: true, message: 'First name is required' } }}
                    render={({ field, fieldState: { error } }) => (
                        <FormInput
                            field={field}
                            error={error}
                            label="First Name"
                            placeholder="Enter first name"
                            fullWidth
                            sx={{ mb: 3 }}
                        />
                    )}
                />

                <Controller
                    name="lastName"
                    control={control}
                    rules={{ required: { value: true, message: 'Last name is required' } }}
                    render={({ field, fieldState: { error } }) => (
                        <FormInput
                            field={field}
                            error={error}
                            label="Last Name"
                            placeholder="Enter last name"
                            fullWidth
                            sx={{ mb: 3 }}
                        />
                    )}
                />

                <Controller
                    name="phone"
                    control={control}
                    rules={{
                        required: { value: true, message: 'Phone number is required' },
                        validate: (value) => {
                            if (!value) return 'Phone number is required';
                            if (value && value.length < 8) return 'Please enter a valid phone number';
                            return true;
                        }
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth error={!!error} sx={{ mb: 3 }}>
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

                <Controller
                    name="dob"
                    control={control}
                    rules={{
                        validate: (value) => {
                            if (!value) return true;
                            return dayjs(value).isValid() || 'Please enter a valid date';
                        }
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FormInput
                            fullWidth
                            error={error}
                            field={field}
                            value={field.value || ''}
                            label="Date of Birth"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 3 }}
                        />
                    )}
                />

                <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2, py: 1.2 }}
                    onClick={async () => {
                        const allowed = await promptNotificationPermission();
                        if (allowed) {
                            window.alert('Notifications enabled. Please complete registration.');
                        } else {
                            window.alert('Please enable notification permission from browser settings.');
                        }
                    }}
                >
                    Enable Notifications
                </Button>

                <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.5 }}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Register'}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                        Already registered?{' '}
                        <Button component={NavLink} to={ROUTES.AUTH.LOGIN} size="small">
                            Sign in
                        </Button>
                    </Typography>
                </Box>
            </form>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Register;
