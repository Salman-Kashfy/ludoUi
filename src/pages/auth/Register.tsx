import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, FormControl } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { MuiTelInput } from 'mui-tel-input';
import dayjs from 'dayjs';
import FormInput from '../../components/FormInput';
import { RegisterCustomer, SaveCustomerDevice } from '../../services/customer.service';
import { constants, ROUTES } from '../../utils/constants';
import { useToast } from '../../utils/toast';
import { getFCMToken } from '../../config/firebase.service';

interface RegistrationFormValues {
    firstName: string;
    lastName: string;
    phone: string;
    dob: string;
}

const getDeviceToken = () => {
    if (typeof window === 'undefined') return '';
    const storageKey = 'LRCL_DEVICE_TOKEN';
    let token: string = localStorage.getItem(storageKey) || '';
    if (!token) {
        token = (crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(storageKey, token);
    }
    return token;
};

const getDeviceType = () => {
    if (typeof navigator === 'undefined') return 'web';
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/i.test(ua)) return 'ios';
    return 'web';
};

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

const requestNotificationPermission = async () => {
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

            const permissionGranted = await promptNotificationPermission();
            if (permissionGranted) {
                const token = getDeviceToken();
                const deviceType = getDeviceType();
                
                // Try to get FCM token from Firebase
                let fcmToken = null;
                try {
                    fcmToken = await getFCMToken();
                } catch (fcmError) {
                    console.warn('Failed to get FCM token:', fcmError);
                }

                await SaveCustomerDevice({
                    customerUuid,
                    deviceToken: token,
                    deviceType,
                    fcmToken: fcmToken || undefined
                });
            }

            successToast('Registration successful!');
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
        <Box>
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
                    {errorMessage}
                </Alert>
            )}

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: 'rgba(0,0,0,0.87)', fontSize: { xs: '1.25rem', sm: '1.25rem' } }}>
                Register as a customer
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
                </Box>
    );
}

export default Register;
