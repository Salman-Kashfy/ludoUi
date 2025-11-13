import { Fragment, useContext, useState } from "react";
import { useEffect } from "react";
import { Button, Grid, Box, FormHelperText, Autocomplete } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import FormInput from "../../components/FormInput";
import { isEmpty } from "lodash";
import { CompanyContext } from "../../hooks/CompanyContext"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import {decimalOnly, numberOnly} from "../../utils/validations";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { GetCategories } from "../../services/category.service";

function TournamentForm({record = {}, formLoader, callback, loader}:{record:any, formLoader:boolean, callback: (data: any) => void, loader:boolean}) {
    const companyContext:any = useContext(CompanyContext)
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryValue, setCategoryValue] = useState<{label: string, value: string} | null>(null);
    
    const defaultValues = {
        uuid: '',
        name: '',
        categoryUuid: '',
        date: '',
        startTime: '',
        entryFee: '',
        prizePool: '',
        playerLimit: '',
    }

    const {control, handleSubmit, reset, watch, setValue} = useForm({
        mode: "onChange",
        defaultValues
    })
    
    const dateValue = watch('date');

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
            if (key === 'categoryUuid') {
                let categoryUuid = '';
                if (data.category) {
                    categoryUuid = data.category.uuid || '';
                } else if (data.categoryUuid) {
                    categoryUuid = data.categoryUuid;
                }
                _data[key] = categoryUuid;
                // Set category value for Autocomplete
                if (categoryUuid && categories.length > 0) {
                    const category = categories.find((cat: any) => cat.uuid === categoryUuid);
                    if (category) {
                        setCategoryValue({ label: category.name, value: category.uuid });
                    }
                }
            } else if (['entryFee', 'prizePool', 'playerLimit'].includes(key)) {
                _data[key] = Number(data[key])
            } else {
                _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || defaultValues[key as keyof typeof defaultValues]) : data[key]
            }
        }
        reset(_data)
    }

    const handleCategoryChange = (_event: any, newValue: {label: string, value: string} | null) => {
        setCategoryValue(newValue);
        setValue('categoryUuid', newValue ? newValue.value : '');
    }

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
        }
    }, [record, categories]);

    const onSubmit = (data: any) => {
        if(!data['uuid']) delete data.uuid
        data.companyUuid = companyContext.companyUuid
        // Use categoryUuid from categoryValue if available, otherwise from form data
        if (categoryValue) {
            data.categoryUuid = categoryValue.value;
        }
        data.entryFee = Number(data.entryFee);
        data.prizePool = Number(data.prizePool);
        data.playerLimit = Number(data.playerLimit);
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
                                    value: 100,
                                    message: "Name must not exceed 100 characters"
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
                            render={({ fieldState: { error } }: any) => (
                                <>
                                    <Autocomplete
                                        options={categories.map((cat: any) => ({ label: cat.name, value: cat.uuid }))}
                                        value={categoryValue}
                                        onChange={handleCategoryChange}
                                        getOptionLabel={(option) => option.label || ''}
                                        renderInput={(params) => (
                                            <FormInput
                                                fullWidth={true}
                                                error={error}
                                                label="Category"
                                                params={params}
                                                slotProps={{
                                                    input: {
                                                        ...params.InputProps,
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </>
                            )}
                        />
                    </Grid>
                    <Grid size={4}>
                        <Controller name="date" control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "Date is required"
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Date"
                                        closeOnSelect={true}
                                        value={field.value ? dayjs(field.value) : null}
                                        format="MMM DD, YYYY"
                                        onChange={(event) => field.onChange(event ? event.format('YYYY-MM-DD') : '')}
                                        slotProps={{
                                            textField: {
                                                variant: 'outlined',
                                                fullWidth: true,
                                                error: !!error,
                                                size: 'small',
                                            }
                                        }}
                                    />
                                    {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                </LocalizationProvider>
                            )}
                        />
                    </Grid>
                    <Grid size={4}>
                        <Controller name="startTime" control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "Start Time is required"
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        label="Start Time"
                                        closeOnSelect
                                        value={field.value && dateValue ? dayjs(`${dateValue}T${field.value}`) : null}
                                        onChange={(newValue) => field.onChange(newValue ? newValue.format('HH:mm:ss') : null)}
                                        slotProps={{
                                            textField: {
                                                variant: 'outlined',
                                                fullWidth: true,
                                                error: !!error,
                                                size: 'small',
                                                helperText: error?.message,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            )}
                        />
                    </Grid>
                    <Grid size={4}>
                        <Controller name="entryFee" control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "Entry Fee is required"
                                },
                                min: {
                                    value: 0,
                                    message: "Entry Fee must be at least 0"
                                },
                            }}
                            render={({ field, fieldState: { error } }: any) => (
                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Entry Fee'} onInput={decimalOnly}/>
                            )}
                        />
                    </Grid>
                    <Grid size={4}>
                        <Controller name="prizePool" control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "Prize Pool is required"
                                },
                                min: {
                                    value: 0,
                                    message: "Prize Pool must be at least 0"
                                },
                            }}
                            render={({ field, fieldState: { error } }: any) => (
                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Prize Pool'} onInput={decimalOnly}/>
                            )}
                        />
                    </Grid>
                    <Grid size={4}>
                        <Controller name="playerLimit" control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "Player Limit is required"
                                },
                                min: {
                                    value: 1,
                                    message: "Player Limit must be at least 1"
                                }
                            }}
                            render={({ field, fieldState: { error } }: any) => (
                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Player Limit'} onInput={numberOnly}/>
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

export default TournamentForm

