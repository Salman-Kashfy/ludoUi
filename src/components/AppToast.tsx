import {Snackbar, Alert} from '@mui/material';

export function AppToast({severity, message, snackOpen, setSnackOpen}:{severity: 'success' | 'error', message: string, snackOpen: boolean, setSnackOpen: (open: boolean) => void}) {
    return (
        <Snackbar open={snackOpen} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} autoHideDuration={2000} onClose={() => setSnackOpen(false)}>
            <Alert onClose={() => setSnackOpen(false)} severity={severity} sx={{ width: '100%' }}>{message}</Alert>
        </Snackbar>
    );
}