import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, Box, Typography, Card } from '@mui/material';
import { CheckCircle } from 'lucide-react';
import { SaveCustomerDevice } from '../../services/customer.service';
import { getFCMToken } from '../../config/firebase.service';

interface ThankYouProps {
    customerName?: string;
    customerUuid?: string;
    isBookingWaiting?: boolean;
    phone?: string;
    phoneCode?: string;
    phoneNumber?: string;
}

const getDeviceToken = () => {
    if (typeof window === 'undefined') return '';
    const storageKey = 'LRCL_DEVICE_TOKEN';
    let token: string = localStorage.getItem(storageKey) || '';
    if (!token) {
        token =
            (crypto as any)?.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function ThankYou({
    customerName = '',
    customerUuid = '',
    isBookingWaiting = false,
    phone = '',
    phoneCode = '',
    phoneNumber = ''
}: ThankYouProps) {
    const location = useLocation();
    const state = (location.state as {
        customerName?: string;
        customerUuid?: string;
        isBookingWaiting?: boolean;
        phone?: string;
        phoneCode?: string;
        phoneNumber?: string;
    } | undefined) || {};

    const displayName = customerName || state.customerName || 'Valued Customer';
    const displayCustomerUuid = customerUuid || state.customerUuid || '';
    const displayBookingWaiting = isBookingWaiting || state.isBookingWaiting || false;
    const displayPhone =
        phone ||
        state.phone ||
        (phoneCode && phoneNumber ? `${phoneCode} ${phoneNumber}` : 'Not available');
    const [notificationSetupMessage, setNotificationSetupMessage] = useState('');

    useEffect(() => {
        const setupNotifications = async () => {
            if (!displayCustomerUuid || typeof window === 'undefined' || !('Notification' in window)) {
                return;
            }

            if (Notification.permission !== 'granted') {
                setNotificationSetupMessage('Enable browser notifications to receive booking updates instantly.');
                return;
            }

            try {
                const deviceToken = getDeviceToken();
                const deviceType = getDeviceType();

                let fcmToken: string | undefined;
                try {
                    fcmToken = (await getFCMToken()) || undefined;
                } catch (fcmError) {
                    console.warn('Failed to get FCM token on thank-you screen:', fcmError);
                }

                await SaveCustomerDevice({
                    customerUuid: displayCustomerUuid,
                    deviceToken,
                    deviceType,
                    fcmToken
                });

                setNotificationSetupMessage('Notifications are enabled for this device.');
            } catch (error) {
                console.warn('Failed to save customer device on thank-you screen:', error);
                setNotificationSetupMessage('Notification setup is pending. Please keep browser notifications enabled.');
            }
        };

        void setupNotifications();
    }, [displayCustomerUuid]);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 1, sm: 2, md: 3 },
                background:
                    'linear-gradient(142deg, rgba(255,255,255,1) 0%, rgba(250,249,251,1) 72%)',
                zIndex: 10,
                overflow: 'hidden'
            }}
        >
            <Card
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    textAlign: 'center',
                    boxShadow: 8,
                    borderRadius: 4,
                    width: '100%',
                    maxWidth: { xs: 360, sm: 500, md: 640 },
                    maxHeight: 'calc(100vh - 32px)',
                    overflowY: 'auto',
                    mx: 'auto'
                }}
            >
                {/* Success Icon */}
                <Box sx={{ mb: 3 }}>
                    <CheckCircle size={80} style={{ color: '#4caf50', margin: '0 auto' }} />
                </Box>

                {/* Title */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        mb: 1.5,
                        color: '#333',
                        fontSize: { xs: '1.5rem', sm: '1.9rem' }
                    }}
                >
                    {displayBookingWaiting
                        ? 'Booking Request Submitted!'
                        : 'Registration Successful!'}
                </Typography>

                {/* Message */}
                <Typography
                    variant="body2"
                    sx={{
                        mb: 1.5,
                        color: '#666',
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        lineHeight: 1.5
                    }}
                >
                    {displayBookingWaiting ? (
                        <>
                            <strong>Thank you, {displayName}!</strong>
                            <br />
                            Your booking request has been submitted. You'll receive a notification once your table is confirmed.
                            <br />
                            <br />
                            <em>Please enable notifications to stay updated.</em>
                        </>
                    ) : (
                        <>
                            <strong>Welcome, {displayName}!</strong>
                            <br />
                            Your account has been created successfully. You can now log in with your phone number.
                            <br />
                            <br />
                            <em>You'll receive notifications about your bookings.</em>
                        </>
                    )}
                </Typography>

                {notificationSetupMessage ? (
                    <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                        {notificationSetupMessage}
                    </Alert>
                ) : null}

                {/* Phone Info */}
                <Box
                    sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: '#e8f4e5',
                        borderRadius: 2,
                        textAlign: 'center'
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 0.7, fontSize: { xs: '0.78rem', sm: '0.86rem' } }}
                    >
                        Registration Number (Customer Phone)
                    </Typography>

                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                            color: '#1b5e20',
                            mb: 0.7,
                            fontSize: { xs: '0.95rem', sm: '1.1rem' }
                        }}
                    >
                        {displayPhone}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            px: { xs: 0.5, sm: 1 },
                            fontSize: { xs: '0.72rem', sm: '0.84rem' }
                        }}
                    >
                        Show this to the admin; they can use it to quickly find your profile and book your table.
                    </Typography>
                </Box>

                {/* Footer Note */}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Registration complete — no login action is needed on this screen.
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
}

export default ThankYou;
