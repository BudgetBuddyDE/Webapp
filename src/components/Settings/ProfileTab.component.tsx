import { Box, Button, Grid, TextField } from '@mui/material';
import React from 'react';
import { AuthContext, SnackbarContext } from '../../context';
import { UserService } from '../../services';
import { Card, TabPanel, TabPanelProps } from '../Base';
import { UploadProfileAvatar } from '../Core';

export type ProfileTabProps = {
    tabPanelProps: Omit<TabPanelProps, 'children'>;
};

type ProfileFormFields = 'uuid' | 'email' | 'username';

export const ProfileTab: React.FC<ProfileTabProps> = ({ tabPanelProps }) => {
    const { session } = React.useContext(AuthContext);
    const user = React.useMemo(() => (session && session.user ? session.user : null), [session]);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const [submitting, setSubmitting] = React.useState(false);
    const [form, setForm] = React.useState<Record<ProfileFormFields, unknown>>({
        uuid: user?.id ?? null,
        email: user?.email ?? null,
        username: user?.user_metadata.username ?? null,
    });

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
                                            <UploadProfileAvatar sx={{ width: 88 }} />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
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
                                    <Grid item xs={12} md={6}>
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
                                        />
                                    </Grid>
                                </Grid>

                                <Box display="flex" flexDirection="row" justifyContent="flex-end">
                                    <Button type="submit" disabled={submitting} variant="contained" sx={{ mt: 2 }}>
                                        Save changes
                                    </Button>
                                </Box>
                            </form>
                        </Card.Body>
                    </Card>
                </Grid>
            </Grid>
        </TabPanel>
    );
};
