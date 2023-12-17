import { Card } from '@/components/Base';
import { Box, Button, Grid, TextField } from '@mui/material';
import React from 'react';
import { useAuthContext } from '../Auth';
import { type TUpdateUserPayload, ZUpdateUserPayload } from '@/types';
import { useSnackbarContext } from '../Snackbar';
import { UserService } from '@/services';

interface IEditProfileHandler {
  onChangeInput: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDiscard: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export type TEditProfileProps = {};

export const EditProfile: React.FC<TEditProfileProps> = () => {
  const { showSnackbar } = useSnackbarContext();
  const { session, setSession, authOptions } = useAuthContext();
  const [enableInputs, setEnableInputs] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, string>>({});

  const handler: IEditProfileHandler = {
    onChangeInput(event) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onDiscard() {
      if (!session) return; // should never be the case
      setEnableInputs(false);
      setForm({
        name: session.name,
        surname: session.surname,
        email: session.email,
      });
    },
    async onSubmit(event) {
      event.preventDefault();
      if (!session) return;
      try {
        const parsedForm = ZUpdateUserPayload.safeParse({
          uuid: session.uuid,
          email: form.email ?? session.email,
          name: form.name ?? session.name,
          surname: form.surname ?? session.surname,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TUpdateUserPayload = parsedForm.data;

        const [updatedUser, error] = await UserService.update(payload, authOptions);
        if (error) throw error;
        if (!updatedUser) throw new Error("Couldn't save the applied changes");

        showSnackbar({ message: "Changes we're saved" });
        setForm({
          name: updatedUser.name,
          surname: updatedUser.surname,
          email: updatedUser.email,
        });
        setForm({});
        setSession(updatedUser);
        setEnableInputs(false);
      } catch (error) {
        console.error(error);
        showSnackbar({ message: (error as Error).message });
      }
    },
  };

  if (!session) return;
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
          <Grid container spacing={2} rowSpacing={1}>
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                disabled
                id="uuid"
                name="uuid"
                label="UUID"
                defaultValue={session.uuid}
                sx={{ mt: 2 }}
                required
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <TextField
                id="name"
                name="name"
                label="Name"
                value={form.name}
                defaultValue={session.name}
                onChange={handler.onChangeInput}
                sx={{ mt: 2 }}
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
                defaultValue={session.surname}
                onChange={handler.onChangeInput}
                sx={{ mt: 2 }}
                fullWidth
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
                defaultValue={session.email}
                sx={{ mt: 2 }}
                disabled={!enableInputs}
                required
              />
            </Grid>
          </Grid>

          <Box display="flex" flexDirection="row" justifyContent="flex-end">
            {enableInputs ? (
              <Box sx={{ mt: 2 }}>
                <Button variant="text" sx={{ mr: 1 }} onClick={handler.onDiscard}>
                  Discard
                </Button>

                <Button type="submit" variant="contained">
                  Save changes
                </Button>
              </Box>
            ) : (
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setEnableInputs(true)}>
                Edit
              </Button>
            )}
          </Box>
        </form>
      </Card.Body>
    </Card>
  );
};
