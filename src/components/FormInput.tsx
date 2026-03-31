import { Box, FormHelperText, TextField } from "@mui/material";

function FormInput(props: any) {
    const fieldProps = props.field || {
        value: props.value,
        onChange: props.onChange,
        onBlur: props.onBlur,
        name: props.name,
    };

    const inputValue = props.value !== undefined ? props.value : (fieldProps.value ?? '');

    return (
        <Box sx={{ width: '100%', ...props.sx }}>
            <TextField
                {...fieldProps}
                InputProps={props.InputProps}
                InputLabelProps={props.InputLabelProps}
                disabled={props.disabled}
                error={!!props.error}
                variant={props.variant || 'outlined'}
                type={props.type}
                label={props.label}
                placeholder={props.placeholder}
                fullWidth={props.fullWidth}
                {...props.params}
                value={inputValue}
                slotProps={props.slotProps}
                onInput={props.onInput}
                size={props.size || 'small'}
                sx={{
                    bgcolor: '#ffffff',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                        borderColor: '#2196f3',
                    },
                    ...props.sx
                }}
            />
            {props.error && (
                <FormHelperText sx={{ ml: 0 }}>
                    {props.error.message}
                </FormHelperText>
            )}
        </Box>
    );
}

export default FormInput;