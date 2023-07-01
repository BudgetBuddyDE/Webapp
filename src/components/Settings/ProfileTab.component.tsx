import React from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/context/Auth.context';
import { SnackbarContext } from '@/context/Snackbar.context';
import { UserService } from '@/services/User.service';
import { Box, Button, Grid, TextField } from '@mui/material';
import { Card } from '../Base';
import { TabPanel, type TabPanelProps } from '../Base/Tab/TabPanel.component';
import { ProfileAvatar } from '../Profile/ProfileAvatar.component';
import { UploadProfileAvatar } from '../Profile/UploadProfileAvatar.component';

export type ProfileTabProps = {
    tabPanelProps: Omit<TabPanelProps, 'children'>;
    editProfile?: boolean;
};

type ProfileFormFields = 'uuid' | 'email' | 'username';

export const ProfileTab: React.FC<ProfileTabProps> = ({ tabPanelProps, editProfile = false }) => {
    const { session } = React.useContext(AuthContext);
    const user = React.useMemo(() => (session && session.user ? session.user : null), [session]);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const [submitting, setSubmitting] = React.useState(false);
    const [form, setForm] = React.useState<Record<ProfileFormFields, unknown>>({
        uuid: user?.id ?? null,
        email: user?.email ?? null,
        username: user?.user_metadata.username ?? null,
    });

    const enableInputs = React.useMemo(() => editProfile, [editProfile]);

    const handler = {
        onTextChange: function (event: React.ChangeEvent<HTMLInputElement>) {
            setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
        },
        onSubmit: async function (event: React.ChangeEvent<HTMLFormElement>) {
            setSubmitting(true);
            event.preventDefault();
            try {
                const { error } = await UserService.update({
                    data: { username: form.username },
                });
                if (error) throw error;
                showSnackbar({ message: 'Username updated' });
            } catch (error) {
                console.error(error);
                showSnackbar({ message: error instanceof Error ? error.message : "Couldn't save the changes" });
            } finally {
                setSubmitting(false);
            }
        },
    };

    return (
        <TabPanel {...tabPanelProps} containerProps={{ width: '100%' }}>
            <Grid container spacing={2}>
                <Grid item xs={12} lg={6}>
                    <Card>
                        <Card.Header>
                            <Box>
                                <Card.Title>Profile</Card.Title>
                                <Card.Subtitle>Make changes to your profile</Card.Subtitle>
                            </Box>
                        </Card.Header>
                        <Card.Body>
                            <form onSubmit={handler.onSubmit}>
                                <Grid container spacing={2} rowSpacing={1}>
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                py: 2,
                                            }}
                                        >
                                            {enableInputs ? (
                                                <UploadProfileAvatar sx={{ width: 88 }} />
                                            ) : (
                                                <ProfileAvatar sx={{ width: 88 }} />
                                            )}
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={12}>
                                        <TextField
                                            fullWidth
                                            disabled
                                            id="uuid"
                                            name="uuid"
                                            label="UUID"
                                            value={form.uuid}
                                            sx={{ mt: 2 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12}>
                                        <TextField
                                            fullWidth
                                            disabled
                                            id="email"
                                            name="email"
                                            label="E-Mail"
                                            value={form.email}
                                            sx={{ mt: 2 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12}>
                                        <TextField
                                            id="username"
                                            name="username"
                                            label="Username"
                                            value={form.username}
                                            onChange={handler.onTextChange}
                                            sx={{ mt: 2 }}
                                            fullWidth
                                            disabled={!enableInputs}
                                        />
                                    </Grid>
                                </Grid>

                                <Box display="flex" flexDirection="row" justifyContent="flex-end">
                                    {enableInputs ? (
                                        <Box sx={{ mt: 2 }}>
                                            <Button
                                                component={Link}
                                                to="/settings/profile"
                                                variant="text"
                                                sx={{ mr: 1 }}
                                                onClick={() =>
                                                    // @ts-ignore
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        username: session?.user.user_metadata.username,
                                                    }))
                                                }
                                            >
                                                Discard
                                            </Button>

                                            <Button type="submit" disabled={submitting} variant="contained">
                                                Save changes
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button
                                            component={Link}
                                            to="/settings/profile/edit"
                                            variant="contained"
                                            sx={{ mt: 2 }}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </Box>
                            </form>
                        </Card.Body>
                    </Card>
                </Grid>
            </Grid>
        </TabPanel>
    );
};
