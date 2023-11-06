import { Card } from '@/components/Base';
import { ContentGrid } from '@/components/Layout';
import { StatsCard } from '@/components/StatsCard.component';
import { withAuthLayout } from '@/core/Auth/Layout';
import { SubscriptionList } from '@/core/Subscription';
import { TransactionList, useFetchTransactions } from '@/core/Transaction';
import { formatBalance } from '@/utils';
import { Box, Grid } from '@mui/material';

export const Dashboard = () => {
  const { transactions, loading } = useFetchTransactions();
  return (
    <ContentGrid title={'Welcome, Thorben!'}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <Grid key={idx} item xs={6} md={2}>
          <StatsCard title={formatBalance(Math.random() * 100)} subtitle={`Balance ${idx}`} />
        </Grid>
      ))}

      <Grid item xs={12} md={6} lg={4}>
        <SubscriptionList data={[]} />
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title></Card.Title>
              <Card.Subtitle></Card.Subtitle>
            </Box>
          </Card.Header>
          <Card.Body>{/* FIXME: */}</Card.Body>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        {loading ? <p>Loading...</p> : <TransactionList data={transactions} />}
      </Grid>
    </ContentGrid>
  );
};

export default withAuthLayout(Dashboard);
