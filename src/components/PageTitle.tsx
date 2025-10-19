import React from "react";
import {Box, Typography, useTheme} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { NavLink } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

interface ButtonInterface {
    to?: string;
    label: string;
    show: boolean;
    onClick?: any
    loading?: boolean
    disabled?: boolean
}

interface PageTitleProps {
    title: string;
    titleIcon?: React.ReactNode;
    btn?: ButtonInterface;
    backTo?: string;
    input?: any
}

const PageTitle = ({ title, titleIcon, btn, backTo = '', input = ''}: PageTitleProps) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 2, borderRadius: '6px 6px 0 0', backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff', borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {titleIcon && (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {React.cloneElement(titleIcon as React.ReactElement, {
                            size: 16,
                            strokeWidth: 2
                        })}
                    </Box>
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 'normal' }}>
                    {backTo ? (
                        <IconButton component={NavLink} to={backTo} sx={{ mr: 1 }}>
                            <KeyboardBackspaceIcon />
                        </IconButton>
                    ) : null}
                    {title}
                </Typography>
            </Box>
            <Box>
                {(Array.isArray(btn) ? btn : btn ? [btn] : [])
                    .filter(button => button.show)
                    .map((button, index) => (
                        button.icon ? (
                            <IconButton
                                key={index}
                                component={button.to ? NavLink : undefined}
                                to={button.to}
                                onClick={button.onClick}
                                disabled={button.disabled}
                                sx={{
                                    ml: 1,
                                    backgroundColor: button.backgroundColor ? button.backgroundColor+'.main' : 'warning.main',
                                    boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
                                    color: button.color || (theme.palette.mode === 'light' ? 'white' : 'black'),
                                    "&:hover": {
                                        backgroundColor: button.backgroundColor ? button.backgroundColor+'.dark' : 'warning.dark',
                                    },
                                }}
                            >
                                {button.icon}
                            </IconButton>
                        ) : (
                            <LoadingButton
                                key={index}
                                variant="contained"
                                loading={button.loading}
                                disabled={button.disabled}
                                component={button.to ? NavLink : undefined}
                                to={button.to}
                                startIcon={button.startIcon}
                                onClick={button.onClick}
                                sx={{ ml: 1 }}
                            >
                                {button.label}
                            </LoadingButton>
                        )
                    ))}
            </Box>
            <>
                {input}
            </>

        </Box>
    );
};

export default PageTitle;
