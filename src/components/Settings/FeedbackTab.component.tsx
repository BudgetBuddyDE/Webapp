import { Box, Button, Checkbox, FormControlLabel, FormGroup, Grid, Rating, TextField } from '@mui/material';
import React from 'react';
import { AuthContext, SnackbarContext } from '../../context';
import { FeedbackService } from '../../services';
import { Card, TabPanel, TabPanelProps } from '../Base';

export type FeedbackTabProps = {
  tabPanelProps: Omit<TabPanelProps, 'children'>;
};

type FeedbackFormFields = 'rating' | 'text' | 'anonymus' | 'share';

const DefaultFeedbackFormValues: Record<FeedbackFormFields, string | number | boolean> = {
  rating: 2.5,
  text: '',
  anonymus: false,
  share: false,
};

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ tabPanelProps }) => {
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState(DefaultFeedbackFormValues);

  const handler = {
    onStarChange: function (event: React.SyntheticEvent<Element, Event>, value: number | null) {
      setForm((prev) => ({ ...prev, rating: Math.round(value ?? 2.5) }));
    },
    onTextChange: function (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, text: event.target.value }));
    },
    onCheckboxChange: function (event: React.ChangeEvent<HTMLInputElement>) {
      setForm((prev) => ({ ...prev, [event.target.name as FeedbackFormFields]: event.target.checked }));
    },
    submit: async function (event: React.FormEvent<HTMLFormElement>) {
      setSubmitting(true);
      event.preventDefault();
      try {
        if ((form.share || !form.anonymus) && (!session || !session.user)) {
          throw new Error('You need to sign in');
        }
        const data = await FeedbackService.create({
          rating: form.rating as number,
          text: form.text.toString().length > 0 ? (form.text as string) : null,
          share: form.share as boolean,
          author: form.anonymus ? null : session!.user!.id,
        });
        if (!data) throw new Error('No feedback sent');

        setForm(DefaultFeedbackFormValues);
        showSnackbar({ message: 'Feedback submitted' });
      } catch (error) {
        console.error(error);
        showSnackbar({ message: error instanceof Error ? error.message : "Couldn't submit feedback" });
      } finally {
        setSubmitting(false);
      }
    },
  };

  return (
    <TabPanel {...tabPanelProps} containerProps={{ width: '100%' }}>
      <Grid container>
        <Grid item xs={12} md={6} lg={6}>
          <Card>
            <Card.Header>
              <Box>
                <Card.Title>Feedback</Card.Title>
                <Card.Subtitle>Is there anything you 'd like to tell us about?</Card.Subtitle>
              </Box>
            </Card.Header>

            <Card.Body>
              <form onSubmit={handler.submit}>
                <Rating
                  id="rating"
                  name="rating"
                  precision={0.5}
                  sx={{ my: 2 }}
                  onChange={handler.onStarChange}
                  value={(form.rating as number) || 2.5}
                />

                <TextField
                  id="text"
                  name="text"
                  label="Feedback"
                  fullWidth
                  multiline
                  rows={3}
                  onChange={handler.onTextChange}
                  value={form.text}
                />

                <FormGroup sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="anonymus"
                        onChange={handler.onCheckboxChange}
                        checked={(form.anonymus as boolean) || false}
                      />
                    }
                    label="Anonymus feedback"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="share"
                        onChange={handler.onCheckboxChange}
                        checked={(form.share as boolean) || false}
                      />
                    }
                    label="Share on website"
                  />
                </FormGroup>

                <Box display="flex" flexDirection="row" justifyContent="flex-end">
                  <Button disabled={submitting} variant="contained" type="submit">
                    Submit feedback
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
