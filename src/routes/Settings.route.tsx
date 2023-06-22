import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AboutInformation, Card, PageHeader, ProfileAvatar, StyledTab } from '@/components';
import { FeedbackTab } from '@/components/Settings/FeedbackTab.component';
import { ProfileTab } from '@/components/Settings/ProfileTab.component';
import { AuthContext } from '@/context';
import { AccountCircleRounded, FeedbackRounded } from '@mui/icons-material';
import { Avatar, Grid, Tabs } from '@mui/material';

function determineDefaultTabValue(currentPathname: string) {
    if (currentPathname === '/settings') return 'profile';
    if (currentPathname.includes('/settings/')) return currentPathname.split('/settings/')[1];
    return currentPathname;
}

export const Settings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = React.useContext(AuthContext);
    const [value, setValue] = React.useState(determineDefaultTabValue(location.pathname));

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
        navigate(newValue);
    };

    return (
        <Grid container spacing={3}>
            <PageHeader title="Settings" />

            <Grid item xs={12} md={12} lg={12}>
                <Card sx={{ p: 0 }}>
                    <Card.Header
                        sx={{
                            position: 'relative',
                            p: 0,
                            aspectRatio: { xs: '7/2', md: '9/1' },
                            backgroundImage:
                                'url(https://dbxmjjzl5pc1g.cloudfront.net/8f452ba1-93c8-46b9-9d49-b9ccffd85612/images/offline.webp)',
                            backgroundSize: '100%',
                            borderRadius: 'inherit',
                            alignItems: 'end',
                        }}
                    >
                        <ProfileAvatar
                            sx={{
                                position: 'absolute',
                                bottom: '-1rem',
                                left: { xs: '1rem', md: '2rem' },
                                width: { xs: 64, md: 96 },
                                height: 'auto',
                                aspectRatio: '1/1',
                            }}
                        />
                    </Card.Header>
                    <Card.Body sx={{ px: 2, pt: 1 }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ width: 'max-content', ml: 'auto' }}
                            TabIndicatorProps={{ sx: { display: 'none' } }}
                        >
                            <StyledTab
                                icon={<AccountCircleRounded />}
                                iconPosition="start"
                                label="Profile"
                                value="profile"
                            />
                            <StyledTab
                                icon={<FeedbackRounded />}
                                iconPosition="start"
                                label="Feedback"
                                value="feedback"
                            />
                        </Tabs>
                    </Card.Body>
                </Card>
            </Grid>

            <Grid container item xs={12} md={4} lg={3} order={{ xs: 1, md: 0 }}>
                <Grid item xs={12} md={12} lg={12}>
                    <AboutInformation />
                </Grid>
            </Grid>

            <Grid container item xs={12} md={8} lg={9} order={{ xs: 0, md: 1 }}>
                <ProfileTab tabPanelProps={{ index: 'profile', value: value }} />
                <FeedbackTab
                    tabPanelProps={{
                        index: 'feedback',
                        value: value,
                    }}
                />
            </Grid>
        </Grid>
    );
};
