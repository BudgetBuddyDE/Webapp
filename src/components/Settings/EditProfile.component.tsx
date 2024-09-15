import {DeleteRounded, PersonRounded} from '@mui/icons-material';
import {Box, Button, FormControl, FormLabel, Grid2 as Grid, Stack, TextField} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {Card, NoResults} from '@/components/Base';
import {useSnackbarContext} from '@/components/Snackbar';
import {useKeyPress} from '@/hooks';
import {pb} from '@/pocketbase.ts';

import {AccountDeleteDialog} from './AccountDeleteDialog.component';

interface IEditProfileHandler {
  openDeleteDialog: () => void;
  closeDeleteDialog: () => void;
  onChangeInput: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDiscard: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export type TEditProfileProps = unknown;

export const EditProfile: React.FC<TEditProfileProps> = () => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const saveBtnRef = React.useRef<HTMLButtonElement>(null);
  const {showSnackbar} = useSnackbarContext();
  const {sessionUser} = useAuthContext();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isFormEditable, setFormEditable] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, string>>({});

  useKeyPress(
    ['s'],
    () => {
      if (!saveBtnRef.current || !isFormEditable) return;
      saveBtnRef.current.click();
    },
    formRef.current,
    true,
  );

  const handler: IEditProfileHandler = {
    openDeleteDialog() {
      setDeleteDialogOpen(true);
    },
    closeDeleteDialog() {
      setDeleteDialogOpen(false);
    },
    onChangeInput(event) {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    onDiscard() {
      if (!sessionUser) return; // should never be the case
      setFormEditable(false);
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
        setFormEditable(false);
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
    <React.Fragment>
      <Card>
        <Card.Header>
          <Box>
            <Card.Title>Profile</Card.Title>
            <Card.Subtitle>Make changes to your account</Card.Subtitle>
          </Box>
        </Card.Header>
        <Card.Body>
          <form ref={formRef} onSubmit={handler.onSubmit}>
            <Grid container spacing={AppConfig.baseSpacing} rowSpacing={Math.round(AppConfig.baseSpacing / 2)}>
              <Grid size={{xs: 12, md: 12}}>
                <FormControl fullWidth required disabled>
                  <FormLabel htmlFor="uuid">UUID</FormLabel>
                  <TextField
                    variant="outlined"
                    id="uuid"
                    name="uuid"
                    defaultValue={sessionUser.id}
                    value={sessionUser.id}
                  />
                </FormControl>
              </Grid>
              <Grid size={{xs: 6, md: 6}}>
                <FormControl fullWidth required disabled={!isFormEditable}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <TextField
                    id="name"
                    name="name"
                    value={form.name}
                    defaultValue={sessionUser.name}
                    onChange={handler.onChangeInput}
                  />
                </FormControl>
              </Grid>
              <Grid size={{xs: 6, md: 6}}>
                <FormControl fullWidth required disabled={!isFormEditable}>
                  <FormLabel htmlFor="surname">Surname</FormLabel>
                  <TextField
                    id="surname"
                    name="surname"
                    value={form.surname}
                    defaultValue={sessionUser.surname}
                    onChange={handler.onChangeInput}
                  />
                </FormControl>
              </Grid>
              <Grid size={{xs: 12, md: 12}}>
                <FormControl fullWidth required disabled={!isFormEditable}>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <TextField
                    id="username"
                    name="username"
                    value={form.username}
                    defaultValue={sessionUser.username}
                    onChange={handler.onChangeInput}
                  />
                </FormControl>
              </Grid>
              <Grid size={{xs: 12, md: 12}}>
                <FormControl fullWidth required disabled={!isFormEditable}>
                  <FormLabel htmlFor="email">E-Mail</FormLabel>
                  <TextField
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    defaultValue={sessionUser.email}
                    onChange={handler.onChangeInput}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Stack direction={'row'} justifyContent={'space-between'} sx={{mt: 2}}>
              <Button startIcon={<DeleteRounded />} color="error" onClick={handler.openDeleteDialog}>
                Delete Account
              </Button>

              {isFormEditable ? (
                <Box>
                  <Button variant="text" sx={{mr: 1}} onClick={handler.onDiscard}>
                    Discard
                  </Button>

                  <Button type="submit" variant="contained">
                    Save changes
                  </Button>
                </Box>
              ) : (
                <Button variant="contained" onClick={() => setFormEditable(true)}>
                  Edit
                </Button>
              )}
            </Stack>
          </form>
        </Card.Body>
      </Card>

      <AccountDeleteDialog open={isDeleteDialogOpen} onClose={handler.closeDeleteDialog} />
    </React.Fragment>
  );
};
