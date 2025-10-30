import { Fragment } from "react/jsx-runtime";
import { Button, Grid, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import FormInput from "../../components/FormInput";
import { useEffect } from "react";
import { isEmpty } from "lodash";

function CategoryForm({record, formLoader}:{record:any, formLoader:boolean}) {
    const navigate = useNavigate();
    const defaultValues = {
        uuid: '',
        name: '',
        categoryPrices: [],
    }
    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const initializeForm = (data:any) => {
        const _data:any = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
        }
        reset(_data)
    }


    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
        }
    }, [record]);

    const onSubmit = (data: any) => {
        console.log(data);
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
                <Box>
                    <Button type="submit" variant="contained" color="primary">Save</Button>
                </Box>
            </form>
        </Fragment>
    )
}

export default CategoryForm;