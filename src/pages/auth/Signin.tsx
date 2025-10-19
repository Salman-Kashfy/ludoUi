import {useState, useContext} from 'react'
import {useNavigate} from "react-router";
import {Box, Alert, Typography, Button} from '@mui/material';
import {InputLabel, Input} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {TextField, InputAdornment, IconButton} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {NavLink} from "react-router-dom"
import {useForm, Controller} from "react-hook-form"
import {UserContext} from '../../hooks/UserContext';
import {AdminLogin, UserLogin, UserPermissions} from "../../services/auth/auth.service";
import {ROUTES} from "../../utils/constants";
import * as React from "react";

function Signin() {
    const userContext: any = useContext(UserContext)
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const {control, handleSubmit} = useForm({
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
                    console.log(error);
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
    };

    return (
        <Box>
            {
                errorMessage ? <Alert severity="error" sx={{mb: 3}}>{errorMessage}</Alert> : <></>
            }
            <Typography variant="h6" sx={{mb: 3, fw: 500}}>Welcome</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller name="email" control={control}
                    rules={{
                        required: {
                            value: "required",
                            message: "Email is required"
                        },
                        maxLength: {
                            value: 100,
                            message: "Email must not be exceed 100 characters"
                        },
                    }}
                    render={({field, fieldState: {error}}) => (
                        <TextField {...field} error={!!error} variant="standard" label="Email" fullWidth sx={{mb: 2}} helperText={error ? error.message : ''}>
                            <InputLabel>Email address</InputLabel>
                            <Input fullWidth={true}/>
                        </TextField>
                    )}
                />
                <Controller name="password" control={control}
                    rules={{
                        required: {
                            value: "required",
                            message: "Password is required"
                        },
                        maxLength: {
                            value: 64,
                            message: "Password must not be exceed 64 characters"
                        },
                    }}
                    render={({field, fieldState: {error}}) => (
                        <TextField variant="standard" {...field} error={!!error}
                             type={showPassword ? 'text' : 'password'} label="Password" sx={{mb: 3}}
                             fullWidth helperText={error ? error.message : ''}
                             InputProps={{
                                 endAdornment: (
                                     <InputAdornment position="end">
                                         <IconButton
                                             onClick={handleTogglePasswordVisibility}
                                             edge="end">
                                             {showPassword ? <VisibilityOff/> : <Visibility/>}
                                         </IconButton>
                                     </InputAdornment>
                                 ),
                             }}
                        />
                    )}
                />
                <Box sx={{mb: 3}}>
                    <Button size="small" component={NavLink} to={ROUTES.AUTH.FORGOT_PASSWORD}>Forgot password</Button>
                </Box>
                <Box sx={{textAlign: 'right'}}>
                    <LoadingButton variant="contained" type="submit" loading={loading}>Sign in</LoadingButton>
                </Box>
            </form>
        </Box>
    )
}

export default Signin
