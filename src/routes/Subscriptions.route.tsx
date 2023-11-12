import { Card } from '@/components/Base';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import { useFetchSubscriptions } from '@/core/Subscription';
import { Box, Grid } from '@mui/material';

export const Subscriptions = () => {
  const { subscriptions, loading: loadingSubscriptions } = useFetchSubscriptions();

  return (
    <ContentGrid title={'Subscriptions'}>
      <Grid item xs={12} md={6} lg={4} order={{ xs: 1, md: 2 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Subscriptions</Card.Title>
              <Card.Subtitle>Manage your subscriptions</Card.Subtitle>
            </Box>
          </Card.Header>
          <Card.Body>
            <ul>
              {!loadingSubscriptions && subscriptions.map((t) => <li key={t.id}>{t.receiver}</li>)}
            </ul>
          </Card.Body>
        </Card>
      </Grid>
    </ContentGrid>
  );
};

export default withAuthLayout(Subscriptions);
