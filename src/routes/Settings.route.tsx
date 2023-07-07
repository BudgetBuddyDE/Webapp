import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/Base';
import { StyledTab } from '@/components/Base/Tab/StyledTab.component';
import { PageHeader } from '@/components/Layout/PageHeader.component';
import { ProfileAvatar } from '@/components/Profile/ProfileAvatar.component';
import { AboutInformation } from '@/components/Settings/AboutInformation.component';
import { FeedbackTab } from '@/components/Settings/FeedbackTab.component';
import { ProfileTab } from '@/components/Settings/ProfileTab.component';
import { AccountCircleRounded, FeedbackRounded } from '@mui/icons-material';
import { Grid, Tabs } from '@mui/material';

function determineDefaultTabValue(currentPathname: string) {
    if (
        currentPathname === '/settings' ||
        currentPathname === '/settings/profile' ||
        currentPathname === '/settings/profile/edit'
    ) {
        return 'profile';
    } else return 'feedback';
}

export type SettingsRouteProps = {
    editProfile?: boolean;
};

const SettingsRoute: React.FC<SettingsRouteProps> = ({ editProfile = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [value, setValue] = React.useState(determineDefaultTabValue(location.pathname));

    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
        let route = '/settings';
        setValue(newValue);
        navigate(route + '/' + newValue);
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

            <Grid container item xs={12} md={4} lg={4} xl={3} order={{ xs: 1, md: 0 }}>
                <Grid item xs={12} md={12} lg={12}>
                    <AboutInformation />
                </Grid>
            </Grid>

            <Grid container item xs={12} md={8} lg={8} xl={9} order={{ xs: 0, md: 1 }}>
                <ProfileTab tabPanelProps={{ index: 'profile', value: value }} editProfile={editProfile} />
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

export default SettingsRoute;
