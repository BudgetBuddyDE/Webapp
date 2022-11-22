import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Rating,
  TextField,
} from '@mui/material';
import React from 'react';
import Card from '../components/card.component';
import { PageHeader } from '../components/page-header.component';
import { UserProfile } from '../components/user-profile.component';
import { AuthContext } from '../context/auth.context';
import { SnackbarContext } from '../context/snackbar.context';
import { FeedbackService } from '../services/feedback.service';

export const Settings = () => {
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [feedbackForm, setFeedbackForm] = React.useState<Record<string, string | number | boolean>>(
    {}
  );

  const feedbackHandler = {
    starChange: (event: React.SyntheticEvent<Element, Event>, value: number | null) => {
      setFeedbackForm((prev) => ({ ...prev, rating: Number(value) }));
    },
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFeedbackForm((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    },
    checkboxChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setFeedbackForm((prev) => ({
        ...prev,
        [event.target.name]: event.target.checked,
      }));
    },
    submit: async (event: React.FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        if (!session || !session.user) throw new Error('You need to sign in first');
        const data = await FeedbackService.create({
          rating: Number(feedbackForm.rating) || 2.5,
          text: String(feedbackForm.text) || null,
          share: Boolean(feedbackForm.share) || false,
          author: Boolean(feedbackForm.anonymus) ? session.user.id : null,
        });
        if (!data) throw new Error('No feedback sent');

        setFeedbackForm({ rating: 2.5, text: '' });
        showSnackbar({ message: 'Feedback submitted' });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        showSnackbar({ mesage: error.mesage || "Couldn't submit feedback" });
      }
    },
  };

  return (
    <Grid container spacing={3}>
      <PageHeader title="Settings" />

      <Grid item xs={12} md={12} lg={4}>
        <UserProfile />
      </Grid>

      <Grid item xs={12} md={12} lg={4}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Feedback</Card.Title>
            </Box>
          </Card.Header>
          <Card.Body>
            <form onSubmit={feedbackHandler.submit}>
              <Rating
                id="rating"
                name="rating"
                precision={0.5}
                sx={{ my: 2 }}
                onChange={feedbackHandler.starChange}
                value={Number(feedbackForm.rating) || 2.5}
              />

              <TextField
                id="text"
                name="text"
                label="Feedback"
                fullWidth
                multiline
                rows={3}
                onChange={feedbackHandler.inputChange}
                value={feedbackForm.text}
              />

              <FormGroup sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="anonymus"
                      onChange={feedbackHandler.checkboxChange}
                      checked={Boolean(feedbackForm.anonymus)}
                    />
                  }
                  label="Anonymus feedback"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="share"
                      onChange={feedbackHandler.checkboxChange}
                      checked={Boolean(feedbackForm.share)}
                    />
                  }
                  label="Share on website"
                />
              </FormGroup>

              <Button variant="contained" type="submit">
                Submit
              </Button>
            </form>
          </Card.Body>
        </Card>
      </Grid>
    </Grid>
  );
};
