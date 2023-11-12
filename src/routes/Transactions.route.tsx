import { Card } from '@/components/Base';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import { useFetchTransactions } from '@/core/Transaction';
import { Box, Grid } from '@mui/material';

export const Transactions = () => {
  const { transactions, loading: loadingTransactions } = useFetchTransactions();

  return (
    <ContentGrid title={'Transactions'}>
      <Grid item xs={12} md={6} lg={4} order={{ xs: 1, md: 2 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>Manage your transactions</Card.Subtitle>
            </Box>
          </Card.Header>
          <Card.Body>
            <ul>
              {!loadingTransactions && transactions.map((t) => <li key={t.id}>{t.receiver}</li>)}
            </ul>
          </Card.Body>
        </Card>
      </Grid>
    </ContentGrid>
  );
};

export default withAuthLayout(Transactions);
