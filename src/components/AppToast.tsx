import {Snackbar, Alert} from '@mui/material';

export function AppToast({severity, message, snackOpen, setSnackOpen}:{severity: 'success' | 'error' | 'warning' | 'info', message: string, snackOpen: boolean, setSnackOpen: (open: boolean) => void}) {
    return (
        <Snackbar 
            open={snackOpen} 
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
            autoHideDuration={null}
            onClose={() => setSnackOpen(false)}
            key={message}
        >
            <Alert 
                onClose={() => setSnackOpen(false)} 
                severity={severity} 
                sx={{ width: '100%', minWidth: '300px' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}