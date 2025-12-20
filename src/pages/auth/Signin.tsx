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
                <Alert severity="error" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
                    {errorMessage}
                </Alert>
            )}

            <Typography variant="h6" sx={{ mb: 4, fontWeight: 500, color: 'rgba(0,0,0,0.87)', fontSize: { xs: '1.25rem', sm: '1.25rem' } }}>
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
                            variant="outlined"
                            type="email"
                            label="Email"
                            placeholder="Enter your email"
                            fullWidth
                            autoComplete="email"
                            InputLabelProps={{ 
                                shrink: true,
                                sx: {
                                    color: 'rgba(0,0,0,0.6)',
                                    fontSize: { xs: '1rem', sm: '0.875rem' },
                                    '&.Mui-focused': {
                                        color: 'primary.main'
                                    },
                                    '&.MuiInputLabel-shrink': {
                                        fontSize: { xs: '0.875rem', sm: '0.75rem' }
                                    }
                                }
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': { 
                                    backgroundColor: { xs: '#f8f9fa', sm: '#fff' }, 
                                    borderRadius: 1,
                                    '& fieldset': {
                                        borderColor: 'rgba(0,0,0,0.12)',
                                        borderWidth: 1
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(0,0,0,0.23)'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                        borderWidth: 2
                                    }
                                },
                                '& .MuiOutlinedInput-input': { 
                                    padding: { xs: '14px 16px', sm: '12px 14px' }, 
                                    fontSize: { xs: '1rem', sm: '0.9rem' }, 
                                    color: 'rgba(0,0,0,0.87)',
                                    '&::placeholder': {
                                        color: 'rgba(0,0,0,0.4)',
                                        opacity: 1
                                    },
                                    '&:-webkit-autofill': {
                                        WebkitBoxShadow: '0 0 0 1000px #f8f9fa inset',
                                        WebkitTextFillColor: 'rgba(0,0,0,0.87)'
                                    }
                                }
                            }}
                            helperText={error ? error.message : ''}
                            slotProps={{
                                formHelperText: {
                                    sx: { 
                                        fontSize: { xs: '0.75rem', sm: '0.75rem' },
                                        mx: 0,
                                        mt: 1
                                    }
                                }
                            }}
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
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            placeholder="Enter your password"
                            fullWidth
                            autoComplete="current-password"
                            InputLabelProps={{ 
                                shrink: true,
                                sx: {
                                    color: 'rgba(0,0,0,0.6)',
                                    fontSize: { xs: '1rem', sm: '0.875rem' },
                                    '&.Mui-focused': {
                                        color: 'primary.main'
                                    },
                                    '&.MuiInputLabel-shrink': {
                                        fontSize: { xs: '0.875rem', sm: '0.75rem' }
                                    }
                                }
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': { 
                                    backgroundColor: { xs: '#f8f9fa', sm: '#fff' }, 
                                    borderRadius: 1,
                                    '& fieldset': {
                                        borderColor: 'rgba(0,0,0,0.12)',
                                        borderWidth: 1
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(0,0,0,0.23)'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                        borderWidth: 2
                                    }
                                },
                                '& .MuiOutlinedInput-input': { 
                                    padding: { xs: '14px 16px', sm: '12px 14px' }, 
                                    fontSize: { xs: '1rem', sm: '0.9rem' }, 
                                    color: 'rgba(0,0,0,0.87)',
                                    '&::placeholder': {
                                        color: 'rgba(0,0,0,0.4)',
                                        opacity: 1
                                    },
                                    '&:-webkit-autofill': {
                                        WebkitBoxShadow: '0 0 0 1000px #f8f9fa inset',
                                        WebkitTextFillColor: 'rgba(0,0,0,0.87)'
                                    }
                                }
                            }}
                            helperText={error ? error.message : ''}
                            slotProps={{
                                formHelperText: {
                                    sx: { 
                                        fontSize: { xs: '0.75rem', sm: '0.75rem' },
                                        mx: 0,
                                        mt: 1
                                    }
                                },
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePasswordVisibility}
                                                edge="end"
                                                size="small"
                                                sx={{ mr: { xs: 0, sm: 1 } }}
                                            >
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }
                            }}
                        />
                    )}
                />

                <Box sx={{ mb: 4, textAlign: { xs: 'left', sm: 'left' } }}>
                    <Button
                        size="small"
                        component={NavLink}
                        to={ROUTES.AUTH.FORGOT_PASSWORD}
                        sx={{ 
                            padding: 0, 
                            minWidth: 0, 
                            fontSize: { xs: '0.875rem', sm: '0.875rem' },
                            color: 'primary.main',
                            textTransform: 'none',
                            fontWeight: 400,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        FORGOT PASSWORD
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, mt: 1 }}>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                        sx={{ 
                            width: { xs: '100%', sm: 'auto' }, 
                            maxWidth: { xs: '360px', sm: 'none' }, 
                            py: { xs: 1.5, sm: 0.75 }, 
                            fontSize: { xs: '1rem', sm: '0.875rem' },
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            borderRadius: 1,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 8px'
                            },
                            '&:disabled': {
                                backgroundColor: 'rgba(0, 0, 0, 0.12)'
                            }
                        }}
                    >
                        Sign in
                    </Button>
                </Box>
            </form>
        </Box>
    )
}

export default Signin
