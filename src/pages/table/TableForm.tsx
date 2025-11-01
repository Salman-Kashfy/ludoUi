import { Fragment } from "react/jsx-runtime";
import { useEffect, useContext, useState } from "react";
import { Button, Grid, Box, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import FormInput from "../../components/FormInput";
import { isEmpty } from "lodash";
import { CompanyContext } from "../../hooks/CompanyContext"
import { GetCategories } from "../../services/category.service";

function TableForm({record, formLoader, callback, loader}:{record:any, formLoader:boolean, callback: (data: any) => void, loader:boolean}) {
    const companyContext:any = useContext(CompanyContext)
    const [categories, setCategories] = useState<any[]>([]);
    
    const defaultValues: {
        uuid: string;
        name: string;
        categoryUuid: string;
        sortNo: number | string;
    } = {
        uuid: '',
        name: '',
        categoryUuid: '',
        sortNo: '',
    }

    const {control, handleSubmit, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    useEffect(() => {
        GetCategories({companyUuid: companyContext.companyUuid}).then((res:any) => {
            setCategories(res.list || []);
        }).catch(() => {
            // Handle error silently
        });
    }, [companyContext.companyUuid]);

    const initializeForm = (data:any) => {
        const _data:any = {}
        for (const key of Object.keys(defaultValues)) {
            if (key === 'categoryUuid' && data.category) {
                _data[key] = data.category.uuid || ''
            } else if (key === 'sortNo') {
                _data[key] = data[key] !== undefined && data[key] !== null ? data[key] : defaultValues[key]
            } else {
                _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || defaultValues[key as keyof typeof defaultValues]) : data[key]
            }
        }
        reset(_data)
    }

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
        }
    }, [record]);

    const onSubmit = (data: any) => {
        if(!data['uuid']) delete data.uuid
        data.companyUuid = companyContext.companyUuid
        data.sortNo = parseInt(data.sortNo)
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
                    <Grid size={4}>
                        <Controller
                            name="categoryUuid"
                            control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "Category is required"
                                }
                            }}
                            render={({ field, fieldState: { error } }: any) => (
                                <FormControl fullWidth error={!!error} size="small">
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        {...field}
                                        value={field.value || ''}
                                        label="Category"
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.uuid} value={category.uuid}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid size={4}>
                        <Controller name="sortNo" control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "Sort No is required"
                                },
                                min: {
                                    value: 0,
                                    message: "Sort No must be at least 0"
                                },
                                pattern: {
                                    value: /^\d+$/,
                                    message: "Sort No must be a whole number"
                                }
                            }}
                            render={({ field, fieldState: { error } }: any) => (
                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Sort No'} type="number"/>
                            )}
                        />
                    </Grid>
                </Grid>

                <Box>
                    <Button type="submit" variant="contained" color="primary" disabled={formLoader || loader} loading={loader}>Save</Button>
                </Box>
            </form>
        </Fragment>
    )
}

export default TableForm

