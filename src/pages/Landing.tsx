import React from 'react'
import { Box, Container, Typography, Grid, Paper } from '@mui/material'
import ludoLogo from '../assets/ludoroyalclub-horizontal.svg'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { Award, Users, Trophy, Clock } from 'lucide-react' 

function Landing() {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #fff 0%, #f8f7fb 100%)' }}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <PublicHeader />
                </Box>
            </Box>

            {/* Hero */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 }, flex: 1 }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h1" sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '1.5rem', md: '2.6rem' }, lineHeight: 1.05, maxWidth: { md: '36rem' } }}>
                            Play Ludo with style — join tournaments, climb leaderboards.
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 3, color: 'rgba(0,0,0,0.7)' }}>
                            LudoRoyalClub combines competitive play, social features, and fair match-making so you can play more and win more.
                        </Typography>

                        <Box sx={{ mt: 2, color: 'rgba(0,0,0,0.7)' }}>
                            <Typography variant="body1">Discover tournaments, leaderboards, and community features—LudoRoyalClub offers competitive play and social rooms for all skill levels.</Typography>
                        </Box>

                        <Box sx={{ mt: 6 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Paper variant="outlined" sx={{ p: { xs:2, md:3 }, height: '100%', boxSizing: 'border-box', display: 'flex', gap: 2, alignItems: 'flex-start', transition: 'transform .18s, box-shadow .18s', '&:hover': { transform: { md: 'translateY(-6px)' }, boxShadow: { md: '0 8px 30px rgba(15,23,42,0.08)' } } }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: 1, background: '#f3eefb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Award size={20} color="#5B2E8A" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tournaments</Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>Join daily and weekly tournaments with real prizes.</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper variant="outlined" sx={{ p: { xs:2, md:3 }, height: '100%', boxSizing: 'border-box', display: 'flex', gap: 2, alignItems: 'flex-start', transition: 'transform .18s, box-shadow .18s', '&:hover': { transform: { md: 'translateY(-6px)' }, boxShadow: { md: '0 8px 30px rgba(15,23,42,0.08)' } } }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: 1, background: '#f3eefb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={20} color="#5B2E8A" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Social Play</Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>Create or join rooms, chat, and make friends.</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ width: { xs: 260, md: 420 }, borderRadius: 3, background: 'linear-gradient(180deg, rgba(91,46,138,0.06), rgba(212,175,55,0.03))', p: 4, boxShadow: 1 }}>
                                <Typography variant="h5" sx={{ color: '#5B2E8A', fontWeight: 700, mb: 1 }}>Upcoming</Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>Pro League — Starts in 3 days</Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Pro League — Starts in 3 days</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>Stay tuned for the schedule and registration details.</Typography>
                                </Box>
                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <Trophy size={18} color="#5B2E8A" />
                                    <Clock size={18} color="#5B2E8A" />
                                    <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>Live leaderboards & match tracking</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Features */}
            <Box sx={{ py: { xs: 4, md: 8 }, background: 'linear-gradient(180deg, rgba(245,245,247,1) 0%, rgba(250,250,252,1) 100%)' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Features</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4} md={4}>
                            <Paper sx={{ p: { xs:2, md:3 }, height: '100%', boxSizing: 'border-box', transition: 'transform .18s, box-shadow .18s', '&:hover': { transform: { md: 'translateY(-6px)' }, boxShadow: { md: '0 8px 30px rgba(15,23,42,0.08)' } } }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Fair match-making</Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>Ranked match-making based on skill and recent performance.</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4} md={4}>
                            <Paper sx={{ p: { xs:2, md:3 }, height: '100%', boxSizing: 'border-box', transition: 'transform .18s, box-shadow .18s', '&:hover': { transform: { md: 'translateY(-6px)' }, boxShadow: { md: '0 8px 30px rgba(15,23,42,0.08)' } } }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Secure & fast</Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>Fast lobby and resilient server for a smooth experience.</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4} md={4}>
                            <Paper sx={{ p: { xs:2, md:3 }, height: '100%', boxSizing: 'border-box', transition: 'transform .18s, box-shadow .18s', '&:hover': { transform: { md: 'translateY(-6px)' }, boxShadow: { md: '0 8px 30px rgba(15,23,42,0.08)' } } }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Rewards & leaderboards</Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>Track progress, win rewards, and climb the rankings.</Typography>
                            </Paper>
                        </Grid>
                    </Grid> 
                </Container>
            </Box>

            <PublicFooter />
        </Box>
    )
}

export default Landing
