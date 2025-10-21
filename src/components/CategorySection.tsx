import { Typography, Box, Grid } from '@mui/material';
import { TableCard } from './TableCard';

interface TableSession {
    uuid: string;
    startTime: string;
    endTime: string | null;
}

interface Table {
    uuid: string;
    name: string;
    status: string;
    tableSessions: TableSession[];
}

interface Category {
    uuid: string;
    name: string;
    hourlyRate: number;
    currencyName: string;
    tables: Table[];
}

interface CategorySectionProps {
    category: Category;
    onUpdate: () => void;
}

export function CategorySection({ category, onUpdate }: CategorySectionProps) {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb:2 }} gutterBottom>
                {category.name} - {category.hourlyRate} {category.currencyName}/hr
            </Typography>
            
            <Grid container spacing={1}>
                {category.tables.map((table) => (
                    <Grid size={3} key={table.uuid}>
                        <TableCard table={table} onUpdate={onUpdate} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
