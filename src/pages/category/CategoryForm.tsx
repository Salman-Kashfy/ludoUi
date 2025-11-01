import { Fragment } from "react/jsx-runtime";
import { Button, Grid, Box, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import FormInput from "../../components/FormInput";
import { useEffect, useContext } from "react";
import { isEmpty } from "lodash";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { CompanyContext } from "../../hooks/CompanyContext"

function CategoryForm({record, formLoader, callback, loader}:{record:any, formLoader:boolean, callback: (data: any) => void, loader:boolean}) {
    const companyContext:any = useContext(CompanyContext)
    const defaultValues: {
        uuid: string;
        name: string;
        categoryPrices: Array<{
            uuid?: string;
            duration: number | string;
            unit: string;
            price: number | string;
            freeMins: number | string;
            currencyName?: string;
        }>;
    } = {
        uuid: '',
        name: '',
        categoryPrices: [{
            uuid: '',
            duration: '',
            unit: 'minutes',
            price: '',
            freeMins: 0,
            currencyName: record?.currencyName || ''
        }],
    }
    const {control, handleSubmit, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "categoryPrices"
    });

    const initializeForm = (data:any) => {
        const _data:any = {}
        for (const key of Object.keys(defaultValues)) {
            if (key === 'categoryPrices') {
                _data[key] = Array.isArray(data[key]) ? data[key] : []
            } else {
                _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
            }
        }
        reset(_data)
    }

    const getPriceSummary = (price: any) => {
        const duration = price.duration || '';
        const unit = price.unit ? price.unit.charAt(0) : '';
        const freeMins = price.freeMins ? ` + ${price.freeMins}m free` : '';
        const currency = price.currencyName || '';
        const priceValue = price.price || '';
        return `${duration}${unit}${freeMins} - ${currency} ${priceValue}`;
    }

    const addNewPrice = () => {
        append({
            uuid: '',
            duration: '',
            unit: 'minutes',
            price: '',
            freeMins: 0,
            currencyName: record?.currencyName || ''
        });
    }


    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
        }
    }, [record]);

    const onSubmit = (data: any) => {
        if(!data['uuid']) delete data.uuid
        data.companyUuid = companyContext.companyUuid
        data.categoryPrices = data.categoryPrices.map((price: any) => {
            delete price.uuid
            price.price = parseFloat(price.price)
            price.freeMins = parseInt(price.freeMins)
            price.duration = parseInt(price.duration)
            return price
        });
        callback(data);
    }
    return (
        <Fragment>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3} sx={{mb:3}}>
                    <Grid size={4}>
                        <Controller name="name" control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "Name is required"
                                },
                                maxLength: {
                                    value: 25,
                                    message: "Name must not exceed 25 characters"
                                },
                            }}
                            render={({ field, fieldState: { error } }: any) => (
                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Name'}/>
                            )}
                        />
                    </Grid>
                </Grid>

                {/* Category Prices Section */}
                <Box sx={{ mt: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1">Set Prices</Typography>
                        <IconButton 
                            sx={{
                                backgroundColor: 'primary.main',
                                boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
                                color: 'white',
                                "&:hover": {
                                    backgroundColor: 'primary.dark',
                                },
                            }}
                            onClick={addNewPrice}
                            disabled={formLoader}
                            aria-label="Add Price"
                        >
                            <Plus size={20} />
                        </IconButton>
                    </Box>

                    {fields.map((field, index) => {
                        const priceValue: any = watch(`categoryPrices.${index}` as any);
                        return (
                            <Accordion key={field.id} sx={{ mb: 2 }}>
                                <AccordionSummary
                                    expandIcon={<ChevronDown size={20} />}
                                    sx={{ 
                                        '& .MuiAccordionSummary-content': {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }
                                    }}
                                >
                                    <Typography variant="body2">
                                        {priceValue?.duration && priceValue?.unit && priceValue?.price 
                                            ? getPriceSummary(priceValue)
                                            : 'New Price (Click to edit)'
                                        }
                                    </Typography>
                                    {fields.length > 1 && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                remove(index);
                                            }}
                                            sx={{ ml: 2, mr: 1, }}
                                            color="error"
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    )}
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        <Grid size={3}>
                                            <Controller
                                                name={`categoryPrices.${index}.duration`}
                                                control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Duration is required"
                                                    },
                                                    min: {
                                                        value: 1,
                                                        message: "Duration must be at least 1"
                                                    }
                                                }}
                                                render={({ field, fieldState: { error } }: any) => (
                                                    <FormInput
                                                        fullWidth={true}
                                                        error={error}
                                                        field={field}
                                                        value={field.value || ''}
                                                        label="Duration"
                                                        type="number"
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid size={3}>
                                            <Controller
                                                name={`categoryPrices.${index}.unit`}
                                                control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Unit is required"
                                                    }
                                                }}
                                                render={({ field, fieldState: { error } }: any) => (
                                                    <FormControl fullWidth error={!!error} size="small">
                                                        <InputLabel>Unit</InputLabel>
                                                        <Select
                                                            {...field}
                                                            value={field.value || 'minutes'}
                                                            label="Unit"
                                                        >
                                                            <MenuItem value="minutes">Minutes</MenuItem>
                                                            <MenuItem value="hours">Hours</MenuItem>
                                                        </Select>
                                                        {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                                    </FormControl>
                                                )}
                                            />
                                        </Grid>
                                        <Grid size={3}>
                                            <Controller
                                                name={`categoryPrices.${index}.price`}
                                                control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Price is required"
                                                    },
                                                    min: {
                                                        value: 0,
                                                        message: "Price must be at least 0"
                                                    }
                                                }}
                                                render={({ field, fieldState: { error } }: any) => (
                                                    <FormInput
                                                        fullWidth={true}
                                                        error={error}
                                                        field={field}
                                                        value={field.value || ''}
                                                        label="Price"
                                                        type="number"
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid size={3}>
                                            <Controller
                                                name={`categoryPrices.${index}.freeMins`}
                                                control={control}
                                                rules={{
                                                    min: {
                                                        value: 0,
                                                        message: "Free minutes must be at least 0"
                                                    }
                                                }}
                                                render={({ field, fieldState: { error } }: any) => (
                                                    <FormInput
                                                        fullWidth={true}
                                                        error={error}
                                                        field={field}
                                                        value={field.value || ''}
                                                        label="Free Minutes (Optional)"
                                                        type="number"
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>

                <Box>
                    <Button type="submit" variant="contained" color="primary" disabled={formLoader || loader} loading={loader}>Save</Button>
                </Box>
            </form>
        </Fragment>
    )
}

export default CategoryForm;