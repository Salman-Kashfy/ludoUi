import { Typography, Box } from '@mui/material';
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
            
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        md: 'repeat(3, minmax(0, 1fr))',
                        lg: 'repeat(4, minmax(0, 1fr))',
                    }
                }}
            >
                {category.tables.map((table) => (
                    <Box key={table.uuid}>
                        <TableCard 
                            table={table} 
                            categoryPrices={category.categoryPrices || []}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
