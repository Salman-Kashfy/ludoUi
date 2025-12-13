import { useState, useContext } from 'react'
import { useNavigate } from "react-router"
import { Box, Alert, Typography, Button } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { TextField, InputAdornment, IconButton } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
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

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500,color: 'rgba(0,0,0,0.87)' }}>
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
                            variant="standard"
                            type="email"
                            label="Email"
                            fullWidth
                            sx={{
                                mb: 3,
                                input: { color: 'rgba(0,0,0,0.87)' },
                                label: { color: 'rgba(0,0,0,0.6)' },
                                '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0,0,0,0.42)' },
                                '& .MuiInput-underline:hover:before': { borderBottomColor: 'rgba(0,0,0,0.87)' },
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
                            variant="standard"
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            fullWidth
                            sx={{
                                mb: 3,
                                input: { color: 'rgba(0,0,0,0.87)' },
                                label: { color: 'rgba(0,0,0,0.6)' },
                                '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0,0,0,0.42)' },
                                '& .MuiInput-underline:hover:before': { borderBottomColor: 'rgba(0,0,0,0.87)' },
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

                <Box sx={{ mb: 3 }}>
                    <Button
                        size="small"
                        component={NavLink}
                        to={ROUTES.AUTH.FORGOT_PASSWORD}
                    >
                        Forgot password
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                    <LoadingButton
                        variant="contained"
                        type="submit"
                        loading={loading}
                    >
                        Sign in
                    </LoadingButton>
                </Box>
            </form>
        </Box>
    )
}

export default Signin
