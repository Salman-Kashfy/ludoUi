import { Typography, Box, Grid } from '@mui/material';
import { TableCard } from './TableCard';
import { Category } from '../pages/dashboard/types';

interface CategorySectionProps {
    category: Category;
    onUpdate: () => void;
}

export function CategorySection({ category, onUpdate }: CategorySectionProps) {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb:2 }} gutterBottom>
                {category.name}
            </Typography>
            
            <Grid container spacing={1}>
                {category.tables.map((table) => (
                    <Grid size={3} key={table.uuid}>
                        <TableCard 
                            table={table} 
                            categoryPrices={category.categoryPrices || []}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
