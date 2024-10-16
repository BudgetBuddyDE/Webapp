import {PaymentsRounded} from '@mui/icons-material';
import {Box} from '@mui/material';
import React from 'react';

import {Card} from '@/components/Base/Card';
import {ListWithIcon} from '@/components/Base/ListWithIcon';
import {CircularProgress} from '@/components/Loading';
import {useSubscriptions} from '@/features/Subscription';
import {Formatter} from '@/services/Formatter';

export type TUpcomingSubscriptionProps = {};

export const UpcomingSubscriptions: React.FC<TUpcomingSubscriptionProps> = ({}) => {
  const {isLoading: isLoadingSubscriptions, data: subscriptions} = useSubscriptions();

  const groupedPayments = React.useMemo(() => {
    const today = new Date().getDate();
    const upcomignSubscriptions = (subscriptions ?? []).filter(
      ({paused, execute_at, transfer_amount}) => !paused && execute_at > today && transfer_amount < 0,
    );
    const grouped = new Map<string, {label: string; sum: number}>();

    for (const {
      expand: {
        category: {id, name},
      },
      transfer_amount,
    } of upcomignSubscriptions) {
      const amount = Math.abs(transfer_amount);
      if (grouped.has(id)) {
        const curr = grouped.get(id);
        grouped.set(id, {label: name, sum: curr!.sum + amount});
      } else grouped.set(id, {label: name, sum: amount});
    }

    return Array.from(grouped.values());
  }, [subscriptions]);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Upcoming subscriptions</Card.Title>
          <Card.Subtitle>
            {Formatter.formatBalance(
              groupedPayments.length > 0 ? groupedPayments.reduce((acc, curr) => acc + curr.sum, 0) : 0,
            )}{' '}
            grouped by category
          </Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body>
        {isLoadingSubscriptions ? (
          <CircularProgress />
        ) : (
          groupedPayments.map(({label, sum}) => (
            <ListWithIcon
              key={'upc-sub-' + label.replaceAll(' ', '_').toLowerCase()}
              icon={<PaymentsRounded />}
              title={label}
              amount={sum}
            />
          ))
        )}
      </Card.Body>
    </Card>
  );
};
