import { Shapes } from "lucide-react"
import { Fragment, useState, useEffect, useContext } from "react"
import PageTitle from "../../components/PageTitle"
import { Box, Chip, IconButton, Stack, Card, CardContent } from "@mui/material";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetCategories } from "../../services/category.service"
import { useToast } from "../../utils/toast"
import { DataGrid } from '@mui/x-data-grid';
import {Pencil} from 'lucide-react';
import { NavLink } from "react-router-dom"
import { ROUTES } from "../../utils/constants"

function Category() {
    const companyContext:any = useContext(CompanyContext)
    const { errorToast } = useToast()
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const columns = [
        { field: 'name', headerName: 'Name', width: 100 },
        { field: 'tableCount', headerName: 'Tables Count', width: 130 },
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
    
    return (
        <Fragment>
            <PageTitle title="Category" titleIcon={<Shapes />} />
            <Card>
                <CardContent>   
                    <Box sx={{p:2}}>
                        <DataGrid
                            rows={categories}
                            columns={columns}
                            loading={loading}
                            sx={{ border: 0 }}
                            hideFooter
                        />
                    </Box>
                </CardContent>
            </Card>
        </Fragment>
    )
}

export default Category