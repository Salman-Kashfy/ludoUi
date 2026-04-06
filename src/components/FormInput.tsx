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
                inputProps={props.inputProps}
                InputLabelProps={{
                    ...props.InputLabelProps,
                    sx: {
                        color: 'rgba(0,0,0,0.72)',
                        '&.Mui-focused': {
                            color: 'primary.main',
                        },
                        '&.MuiInputLabel-shrink': {
                            px: 0.5,
                            lineHeight: 1.1,
                            bgcolor: '#ffffff',
                        },
                        ...(props.InputLabelProps?.sx || {})
                    }
                }}
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
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: '#ffffff',
                        '& fieldset': {
                            borderColor: 'rgba(0,0,0,0.2)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(0,0,0,0.45)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                        }
                    },
                    '& .MuiOutlinedInput-input': {
                        color: 'rgba(0,0,0,0.9)',
                    },
                    '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(0,0,0,0.5)',
                        opacity: 1,
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