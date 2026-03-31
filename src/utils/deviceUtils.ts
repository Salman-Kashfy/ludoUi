/**
 * Device Management Utilities
 * Handles device token generation and persistence
 */

const DEVICE_TOKEN_KEY = 'LRCL_DEVICE_TOKEN';

/**
 * Generate a unique device token using UUID or fallback method
 * @returns UUID string
 */
const generateUniqueToken = (): string => {
    try {
        // Use crypto.randomUUID() if available (modern browsers)
        if (typeof crypto !== 'undefined' && (crypto as any)?.randomUUID) {
            return (crypto as any).randomUUID();
        }
    } catch (e) {
        console.warn('UUID generation failed, using fallback');
    }

    // Fallback: timestamp + random string
    return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Get persistent device token from localStorage
 * Creates and saves a new one if doesn't exist
 * @returns Device token string (stored in localStorage)
 */
export const getDeviceToken = (): string => {
    if (typeof window === 'undefined' || !localStorage) {
        return generateUniqueToken();
    }

    try {
        let token = localStorage.getItem(DEVICE_TOKEN_KEY);
        
        if (!token) {
            // Generate new token for first time
            token = generateUniqueToken();
            localStorage.setItem(DEVICE_TOKEN_KEY, token);
            console.log(`📱 New device token generated: ${token.substring(0, 8)}...`);
        } else {
            console.log(`📱 Existing device token retrieved: ${token.substring(0, 8)}...`);
        }

        return token;
    } catch (error) {
        console.error('Error accessing localStorage for device token:', error);
        // If localStorage fails (e.g., private mode), return a new token
        return generateUniqueToken();
    }
};

/**
 * Reset device token (for logout or re-registration on new device)
 */
export const resetDeviceToken = (): void => {
    try {
        if (typeof window !== 'undefined' && localStorage) {
            localStorage.removeItem(DEVICE_TOKEN_KEY);
            console.log('📱 Device token reset');
        }
    } catch (error) {
        console.error('Error resetting device token:', error);
    }
};

/**
 * Detect device type based on user agent
 */
export const getDeviceType = (): 'android' | 'ios' | 'web' => {
    if (typeof navigator === 'undefined') return 'web';
    
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/i.test(ua)) return 'ios';
    return 'web';
};

/**
 * Get device fingerprint (browser/device identification)
 */
export const getDeviceFingerprint = (): string => {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const parts = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen?.width,
        screen?.height,
        navigator?.hardwareConcurrency,
    ];

    return parts.join('|');
};
