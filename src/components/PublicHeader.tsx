import React from 'react'
import { Box, Button } from '@mui/material'
import { NavLink } from 'react-router-dom'
import ludoLogo from '../assets/ludoroyalclub-horizontal.svg'
import { ROUTES } from '../utils/constants'

function PublicHeader(){
    return (
        <Box sx={{ py: 2, px: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box component={NavLink} to={ROUTES.LANDING} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <Box component="img" src={ludoLogo} sx={{ height: 36 }} />
            </Box>
            <Box>
                <Button variant="text" component={NavLink} to={ROUTES.AUTH.LOGIN}>Sign in</Button>
            </Box>
        </Box>
    )
}

export default PublicHeader
