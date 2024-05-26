import {PersonRounded} from '@mui/icons-material';
import {Box, Button, Grid, TextField} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {Card, NoResults} from '@/components/Base';
import {useSnackbarContext} from '@/components/Snackbar';
import {pb} from '@/pocketbase.ts';

interface IEditProfileHandler {
  onChangeInput: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDiscard: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export type TEditProfileProps = unknown;

export const EditProfile: React.FC<TEditProfileProps> = () => {
  const {showSnackbar} = useSnackbarContext();
  const {sessionUser} = useAuthContext();
  const [enableInputs, setEnableInputs] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, string>>({});

  const handler: IEditProfileHandler = {
    onChangeInput(event) {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    onDiscard() {
      if (!sessionUser) return; // should never be the case
      setEnableInputs(false);
      setForm({
        name: sessionUser.name ?? '',
        surname: sessionUser.surname ?? '',
        username: sessionUser.username,
        email: sessionUser.email,
      });
    },
    async onSubmit(event) {
      event.preventDefault();
      if (!sessionUser) return;
      try {
        await pb.collection('users').update(sessionUser.id, form);
        showSnackbar({message: "Changes we're saved"});
        setEnableInputs(false);
      } catch (error) {
        console.error(error);
        showSnackbar({message: (error as Error).message});
      }
    },
  };

  if (!sessionUser) {
    return (
      <Card>
        <NoResults icon={<PersonRounded />} text="No user found" />
      </Card>
    );
  }
  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Profile</Card.Title>
          <Card.Subtitle>Make changes to your account</Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handler.onSubmit}>
          <Grid container spacing={AppConfig.baseSpacing} rowSpacing={Math.round(AppConfig.baseSpacing / 2)}>
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                disabled
                id="uuid"
                name="uuid"
                label="UUID"
                value={sessionUser.id}
                defaultValue={sessionUser.id}
                sx={{mt: 2}}
                required
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <TextField
                id="name"
                name="name"
                label="Name"
                value={form.name}
                defaultValue={sessionUser.name}
                onChange={handler.onChangeInput}
                sx={{mt: 2}}
                fullWidth
                disabled={!enableInputs}
                required
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <TextField
                id="surname"
                name="surname"
                label="Surname"
                value={form.surname}
                defaultValue={sessionUser.surname}
                onChange={handler.onChangeInput}
                sx={{mt: 2}}
                fullWidth
                disabled={!enableInputs}
                required
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={form.username}
                defaultValue={sessionUser.username}
                sx={{mt: 2}}
                disabled={!enableInputs}
                required
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="E-Mail"
                value={form.email}
                defaultValue={sessionUser.email}
                sx={{mt: 2}}
                disabled={!enableInputs}
                required
              />
            </Grid>
          </Grid>

          <Box display="flex" flexDirection="row" justifyContent="flex-end">
            {enableInputs ? (
              <Box sx={{mt: 2}}>
                <Button variant="text" sx={{mr: 1}} onClick={handler.onDiscard}>
                  Discard
                </Button>

                <Button type="submit" variant="contained">
                  Save changes
                </Button>
              </Box>
            ) : (
              <Button variant="contained" sx={{mt: 2}} onClick={() => setEnableInputs(true)}>
                Edit
              </Button>
            )}
          </Box>
        </form>
      </Card.Body>
    </Card>
  );
};
