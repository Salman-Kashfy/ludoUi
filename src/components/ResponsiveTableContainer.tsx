import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface ResponsiveTableContainerProps {
    minWidth?: number;
    children: ReactNode;
}

const ResponsiveTableContainer = ({ minWidth = 720, children }: ResponsiveTableContainerProps) => (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{ minWidth }}>
            {children}
        </Box>
    </Box>
);

export default ResponsiveTableContainer;

