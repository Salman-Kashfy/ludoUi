import { Fragment, useState, useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { MuiTelInput } from 'mui-tel-input';
import FormInput from './FormInput';
import { CompanyContext } from '../hooks/CompanyContext';
import { SaveUser as SaveUserService } from '../services/user.service';
import { useToast } from '../utils/toast';
import { ROLE, ROLE_NAMES } from '../utils/constants';

interface SaveUserProps {
    open: boolean;
    handleDialogClose: () => void;
    onUserSaved: (user: any) => void;
    user?: any; // For edit mode
}

const SaveUser = ({ open, handleDialogClose, onUserSaved, user }: SaveUserProps) => {
    const companyContext: any = useContext(CompanyContext);
    const { successToast, errorToast } = useToast();
    const [loading, setLoading] = useState(false);

    const isEditMode = !!user;

    const getDefaultValues = () => {
        if (user) {
            // Construct phone number from phoneCode and phoneNumber for edit mode
            const phone = user.phoneCode && user.phoneNumber 
                ? `${user.phoneCode}${user.phoneNumber}` 
                : user.phone || '';
            return {
                uuid: user.id || user.uuid || '',
                roleId: user.role?.id || '',
                firstName: user.firstName || '',
                middleName: user.middleName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                password: '', // Don't pre-fill password
                phone: phone,
                gender: user.gender || '',
                companyUuid: companyContext.companyUuid,
            };
        }
        return {
            roleId: '',
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            gender: '',
            companyUuid: companyContext.companyUuid,
        };
    };

    const { control, handleSubmit, reset } = useForm({
        mode: "onChange",
        defaultValues: getDefaultValues()
    });

    // Reset form when user prop or open state changes
    useEffect(() => {
        if (open) {
            reset(getDefaultValues());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            // Ensure companyUuid is always current
            data.companyUuid = companyContext.companyUuid;
            
            // Add uuid for edit mode
            if (isEditMode && (user?.id || user?.uuid)) {
                data.uuid = user.id || user.uuid;
            }
            
            // Extract phone code and phone number from MuiTelInput format
            if (data.phone) {
                const phoneValue = data.phone;
                const { parsePhoneNumber } = await import('libphonenumber-js');
                try {
                    const phoneNumber = parsePhoneNumber(phoneValue);
                    data.phoneCode = phoneNumber.countryCallingCode ? `+${phoneNumber.countryCallingCode}` : '';
                    data.phoneNumber = phoneNumber.nationalNumber || '';
                } catch (e) {
                    // Fallback: simple parsing if libphonenumber fails
                    const match = phoneValue.match(/^\+(\d{1,4})(.+)$/);
                    if (match) {
                        data.phoneCode = `+${match[1]}`;
                        data.phoneNumber = match[2];
                    } else {
                        data.phoneCode = '';
                        data.phoneNumber = phoneValue.replace(/[^0-9]/g, '');
                    }
                }
            }
            
            // Remove phone field as API expects phoneCode and phoneNumber separately
            delete data.phone;
            
            // Remove password if empty in edit mode
            if (isEditMode && !data.password) {
                delete data.password;
            }
            
            // Ensure roleId is a number
            if (data.roleId) {
                data.roleId = parseInt(data.roleId);
            }
            
            const response = await SaveUserService(data);
            if (response.status) {
                successToast(isEditMode ? 'User updated successfully' : 'User created successfully');
                onUserSaved(response.data);
                reset(getDefaultValues());
                handleDialogClose();
            } else {
                errorToast(response.errorMessage || (isEditMode ? 'Failed to update user' : 'Failed to create user'));
            }
        } catch (error: any) {
            console.error(error);
            errorToast(isEditMode ? 'Failed to update user' : 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const _handleDialogClose = () => {
        if (loading) return;
        reset(getDefaultValues());
        handleDialogClose();
    };

    // Role options - you may need to fetch these from an API
    const roleOptions = [
        { value: 1, label: ROLE_NAMES.ADMIN },
        { value: 2, label: ROLE_NAMES.EMPLOYEE },
    ];

    // Gender options
    const genderOptions = [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' },
    ];

    return (
        <Fragment>
            <Dialog open={open} onClose={_handleDialogClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>{isEditMode ? 'Edit User' : 'Create User'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: "First name is required" },
                                        maxLength: { value: 100, message: "First name must not exceed 100 characters" }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label="First Name"
                                            placeholder="Enter first name"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="middleName"
                                    control={control}
                                    rules={{
                                        maxLength: { value: 100, message: "Middle name must not exceed 100 characters" }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label="Middle Name"
                                            placeholder="Enter middle name (optional)"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{
                                        maxLength: { value: 100, message: "Last name must not exceed 100 characters" }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label="Last Name"
                                            placeholder="Enter last name (optional)"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: "Email is required" },
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label="Email"
                                            placeholder="Enter email address"
                                            type="email"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: { 
                                            value: !isEditMode, 
                                            message: "Password is required" 
                                        },
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters"
                                        },
                                        validate: (value) => {
                                            if (isEditMode && !value) return true; // Optional in edit mode
                                            if (!value) return "Password is required";
                                            // Password must have uppercase, lowercase, number, and special character
                                            const hasUpper = /[A-Z]/.test(value);
                                            const hasLower = /[a-z]/.test(value);
                                            const hasNumber = /[0-9]/.test(value);
                                            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
                                            if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
                                                return "Password must have uppercase, lowercase, number, and special character";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormInput
                                            fullWidth={true}
                                            error={error}
                                            field={field}
                                            value={field.value || ''}
                                            label={isEditMode ? "Password (leave blank to keep current)" : "Password"}
                                            placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                                            type="password"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="roleId"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: "Role is required" }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormControl fullWidth error={!!error} size="small">
                                            <InputLabel>Role</InputLabel>
                                            <Select
                                                {...field}
                                                value={field.value || ''}
                                                label="Role"
                                            >
                                                {roleOptions.map((role) => (
                                                    <MenuItem key={role.value} value={role.value}>
                                                        {role.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormControl fullWidth error={!!error} size="small">
                                            <InputLabel>Gender</InputLabel>
                                            <Select
                                                {...field}
                                                value={field.value || ''}
                                                label="Gender"
                                            >
                                                <MenuItem value="">None</MenuItem>
                                                {genderOptions.map((gender) => (
                                                    <MenuItem key={gender.value} value={gender.value}>
                                                        {gender.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (value && value.length < 8) return "Please enter a valid phone number";
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }: any) => (
                                        <FormControl fullWidth error={!!error}>
                                            <MuiTelInput
                                                {...field}
                                                label="Phone Number"
                                                placeholder="Enter phone number (optional)"
                                                defaultCountry="PK"
                                                preferredCountries={['PK', 'US', 'GB', 'IN']}
                                                size="small"
                                                fullWidth
                                                error={!!error}
                                                helperText={error?.message}
                                            />
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={_handleDialogClose} color="error" disabled={loading}>
                            Cancel
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            loading={loading}
                            disabled={loading}
                        >
                            {isEditMode ? 'Update User' : 'Create User'}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>
        </Fragment>
    );
};

export default SaveUser;

