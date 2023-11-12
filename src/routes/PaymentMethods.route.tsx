import { Card } from '@/components/Base';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import { useFetchPaymentMethods } from '@/core/PaymentMethod';
import { Box, Grid } from '@mui/material';

export const PaymentMethods = () => {
  const { paymentMethods, loading: loadingPaymentMethods } = useFetchPaymentMethods();

  return (
    <ContentGrid title={'Payment-Methods'}>
      <Grid item xs={12} md={6} lg={4} order={{ xs: 1, md: 2 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Payment-Methods</Card.Title>
              <Card.Subtitle>Manage your payment-methods</Card.Subtitle>
            </Box>
          </Card.Header>
          <Card.Body>
            <ul>
              {!loadingPaymentMethods && paymentMethods.map((t) => <li key={t.id}>{t.name}</li>)}
            </ul>
          </Card.Body>
        </Card>
      </Grid>
    </ContentGrid>
  );
};

export default withAuthLayout(PaymentMethods);
