import { Shapes } from "lucide-react"
import { Fragment, useState, useEffect, useContext } from "react"
import PageTitle from "../../components/PageTitle"
import { Box, Chip, IconButton, Stack, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetCategories } from "../../services/category.service"
import { useToast } from "../../utils/toast"
import { DataGrid } from '@mui/x-data-grid';
import {Pencil} from 'lucide-react';
import { NavLink } from "react-router-dom"
import { PERMISSIONS, ROUTES } from "../../utils/constants"
import { hasPermission } from "../../utils/permissions";
import ResponsiveTableContainer from "../../components/ResponsiveTableContainer";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function Category() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast } = useToast()
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const btn = {
        to: ROUTES.CATEGORY.CREATE,
        label: 'Add Category',
        color: 'primary',
        show: hasPermission(PERMISSIONS.CATEGORY.UPSERT),
    }

    const columns = [
        { field: 'name', headerName: 'Name', width: 100 },
        { field: 'tableCount', headerName: 'Tables', width: 130 },
        { 
            field: 'categoryPrices', 
            headerName: 'Pricing',
            width: 600,
            renderCell: (params: any) => {
                const prices = params.value || [];
                return (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, py: 1 }}>
                        {prices.map((price: any, index: number) => {
                            const label = `${price.duration}${price.unit.charAt(0)}${price.freeMins ? ` + ${price.freeMins}m free` : ''} - ${price.currencyName} ${price.price}`;
                            return (
                                <Chip 
                                    key={index} 
                                    label={label} 
                                    size="small" 
                                    variant="outlined"
                                />
                            );
                        })}
                    </Stack>
                );
            }
        },
        { 
            field: 'action', 
            headerName: 'Action',
            width: 100,
            renderCell: (params: any) => {
                return (
                    <IconButton color="info" size="small" component={NavLink} to={ROUTES.CATEGORY.EDIT(params.row.id)}>
                        <Pencil size={20} strokeWidth={1.5} />
                    </IconButton>
                );
            }
        }

    ];

    const loadCategories = () => {
        setLoading(true);
        GetCategories({companyUuid: companyContext.companyUuid}).then((res:any) => {
            setCategories(res.list.map((e:any) => {
                const categoryPrices = e.categoryPrices.map((price: any) => {
                    return {
                        unit: price.unit,
                        duration: price.duration,
                        freeMins: price.freeMins,
                        price: price.price,
                        currencyName: price.currencyName
                    };
                });
                return {
                    id: e.uuid,
                    name: e.name,
                    tableCount: e.tables.length,
                    categoryPrices,
                    action: null // Placeholder, actual rendering happens in renderCell
                }
            }));
        }).catch(() => {
            errorToast('Failed to load categories');
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        loadCategories();
    }, [companyContext.companyUuid]);
    
    const renderMobileList = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!categories.length) {
            return (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
                    No categories found.
                </Typography>
            );
        }

        return (
            <Stack spacing={2} sx={{ p: 2 }}>
                {categories.map((category) => (
                    <Card key={category.id} variant="outlined">
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>{category.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {category.tableCount} table{category.tableCount === 1 ? '' : 's'}
                                    </Typography>
                                </Box>
                                <IconButton
                                    color="info"
                                    size="small"
                                    component={NavLink}
                                    to={ROUTES.CATEGORY.EDIT(category.id)}
                                >
                                    <Pencil size={20} strokeWidth={1.5} />
                                </IconButton>
                            </Box>
                            <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                {(category.categoryPrices || []).map((price: any, idx: number) => {
                                    const label = `${price.duration}${price.unit.charAt(0)}${price.freeMins ? ` + ${price.freeMins}m free` : ''} • ${price.currencyName} ${price.price}`;
                                    return (
                                        <Chip
                                            key={`${category.id}-${idx}`}
                                            label={label}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    );
                                })}
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    };

    return (
        <Fragment>
            <PageTitle title="Category" titleIcon={<Shapes />} btn={btn} />
            {isMobile ? (
                renderMobileList()
            ) : (
                <Card>
                    <CardContent>
                        <ResponsiveTableContainer>
                            <Box sx={{ p: 2 }}>
                                <DataGrid
                                    rows={categories}
                                    columns={columns}
                                    loading={loading}
                                    sx={{ border: 0 }}
                                    hideFooter
                                    autoHeight
                                />
                            </Box>
                        </ResponsiveTableContainer>
                    </CardContent>
                </Card>
            )}
        </Fragment>
    )
}

export default Category