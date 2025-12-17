import { useState, useContext } from 'react'
import { useNavigate } from "react-router"
import { Box, Alert, Typography, Button } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material'
import { NavLink } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { UserContext } from '../../hooks/UserContext'
import { SetAuthCompany, UserLogin, UserPermissions } from "../../services/auth/auth.service"
import { ROUTES } from "../../utils/constants"

function Signin() {
    const userContext: any = useContext(UserContext)
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev)
    }

    const { control, handleSubmit } = useForm({
        mode: "onChange",
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const onSubmit = async (data: any) => {
        setLoading(true)
        await UserLogin(data).then((data) => {
            if (data.status) {
                userContext.setUser(data.user)
                SetAuthCompany(data.user.companyUuid)
                userContext.setToken(data.token)
                UserPermissions().then((response) => {
                    setLoading(false)
                    userContext.setPermissions(response.data)
                    if (response.status) {
                        navigate(ROUTES.DASHBOARD)
                    } else {
                        setErrorMessage('Permission denied!')
                    }
                }).catch((error) => {
                    setLoading(false)
                    setErrorMessage(error.response.data.message)
                })
            } else {
                setErrorMessage(data.message)
                setLoading(false)
            }
        }).catch((error) => {
            setLoading(false)
            setErrorMessage(error.response.data.message)
        })
    }

    return (
        <Box>
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {errorMessage}
                </Alert>
            )}

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: 'rgba(0,0,0,0.87)', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                Welcome
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="email"
                    control={control}
                    rules={{
                        required: { value: true, message: "Email is required" },
                        maxLength: { value: 100, message: "Email must not be exceed 100 characters" },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <TextField
                            {...field}
                            error={!!error}
                            variant="filled"
                            InputLabelProps={{ shrink: true }}
                            type="email"
                            label="Email"
                            fullWidth
                            sx={{
                                mb: 3,
                                '& .MuiFilledInput-root': { backgroundColor: { xs: '#fafafa', sm: '#fff' }, borderRadius: 1, px: { xs: 1, sm: 0 } },
                                '& .MuiFilledInput-input': { padding: { xs: '12px 12px', sm: '10px 12px' }, fontSize: { xs: '0.95rem', sm: '0.9rem' }, color: 'rgba(0,0,0,0.87)' },
                                '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.6)' },
                                '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { display: 'none' },
                            }}
                            helperText={error ? error.message : ''}
                        />
                    )}
                />

                <Controller
                    name="password"
                    control={control}
                    rules={{
                        required: { value: true, message: "Password is required" },
                        maxLength: { value: 64, message: "Password must not be exceed 64 characters" },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <TextField
                            {...field}
                            error={!!error}
                            variant="filled"
                            InputLabelProps={{ shrink: true }}
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            fullWidth
                            sx={{
                                mb: 3,
                                '& .MuiFilledInput-root': { backgroundColor: { xs: '#fafafa', sm: '#fff' }, borderRadius: 1, px: { xs: 1, sm: 0 } },
                                '& .MuiFilledInput-input': { padding: { xs: '12px 12px', sm: '10px 12px' }, fontSize: { xs: '0.95rem', sm: '0.9rem' }, color: 'rgba(0,0,0,0.87)' },
                                '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.6)' },
                                '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { display: 'none' },
                            }}
                            helperText={error ? error.message : ''}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                />

                <Box sx={{ mb: 3, textAlign: { xs: 'left', sm: 'left' } }}>
                    <Button
                        size="small"
                        component={NavLink}
                        to={ROUTES.AUTH.FORGOT_PASSWORD}
                        sx={{ padding: 0, minWidth: 0, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                        Forgot password
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, mt: 1 }}>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                        sx={{ width: { xs: '100%', sm: 'auto' }, maxWidth: { xs: '360px', sm: 'none' }, py: { xs: 1.25, sm: 0.75 }, fontSize: { xs: '1rem', sm: '0.875rem' } }}
                    >
                        Sign in
                    </Button>
                </Box>
            </form>
        </Box>
    )
}

export default Signin
