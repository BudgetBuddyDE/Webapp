import { FormEvent, SyntheticEvent, ChangeEvent, useContext, useState } from 'react';
import { Grid, Box, Rating, TextField, Button } from '@mui/material';
import Card from '../components/card.component';
import { PageHeader } from '../components/page-header.component';
import { SnackbarContext } from '../context/snackbar.context';
import { FeedbackService } from '../services/feedback.service';

export const Settings = () => {
  const { showSnackbar } = useContext(SnackbarContext);
  const [feedbackForm, setFeedbackForm] = useState<Record<string, string | number>>({});

  const feedbackHandler = {
    starChange: (event: SyntheticEvent<Element, Event>, value: number | null) => {
      setFeedbackForm((prev) => ({ ...prev, rating: Number(value) }));
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFeedbackForm((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    },
    submit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(feedbackForm);
        if (values.length < 1) return;
        if (values.includes('rating')) throw new Error('Provide an rating');

        const data = await FeedbackService.create({
          rating: Number(feedbackForm.rating) || 2.5,
          text: String(feedbackForm.text) || null,
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
                sx={{ mb: 2 }}
                fullWidth
                multiline
                rows={3}
                onChange={feedbackHandler.inputChange}
                value={feedbackForm.text}
              />

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
