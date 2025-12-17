import React from 'react'
import { Box, Container, Typography, Grid, Link } from '@mui/material'
import ludoIcon from '../assets/ludoroyalclub-monogram.svg'

function PublicFooter(){
    return (
        <Box component="footer" sx={{ py: 6, mt: 6, background: 'linear-gradient(180deg, #fff 0%, #fbfbfd 100%)' }}>
            <Container maxWidth="lg">
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box component="img" src={ludoIcon} sx={{ width: 40, height: 40 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>LudoRoyalClub</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(0,0,0,0.7)' }}>© {new Date().getFullYear()} LudoRoyalClub. All rights reserved.</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
                            <Link href="#" underline="hover">Terms</Link>
                            <Link href="#" underline="hover">Privacy</Link>
                            <Link href="#" underline="hover">Contact</Link>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default PublicFooter
