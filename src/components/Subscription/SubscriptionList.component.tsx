import React from 'react';
import {format} from 'date-fns';
import {Box, Chip, IconButton, type ChipProps} from '@mui/material';
import {AddRounded as AddIcon, ReceiptRounded as ReceiptIcon} from '@mui/icons-material';
import type {TSubscription} from '@budgetbuddyde/types';
import {Card, ListWithIcon, NoResults} from '@/components/Base';

export type TSubscriptionList = {
  data: TSubscription[];
  onAddSubscription?: () => void;
};

export const SubscriptionList: React.FC<TSubscriptionList> = ({data, onAddSubscription}) => {
  const chipProps: ChipProps = {
    variant: 'outlined',
    size: 'small',
    sx: {mr: 1},
  };

  const upcomingSubscriptions = React.useMemo(() => {
    return data.filter(({executeAt}) => executeAt > new Date().getDate());
  }, [data]);

  return (
    <Card>
      <Card.Header sx={{mb: 1}}>
        <Box>
          <Card.Title>Subscriptions</Card.Title>
          <Card.Subtitle>Your upcoming subscription-payments</Card.Subtitle>
        </Box>
        {onAddSubscription && (
          <Card.HeaderActions>
            <IconButton color="primary" onClick={onAddSubscription}>
              <AddIcon />
            </IconButton>
          </Card.HeaderActions>
        )}
      </Card.Header>
      <Card.Body>
        {data.length > 0 ? (
          upcomingSubscriptions.length > 0 ? (
            upcomingSubscriptions.map(subscription => {
              const executionDate = new Date();
              executionDate.setDate(subscription.executeAt);
              return (
                <ListWithIcon
                  key={subscription.id}
                  icon={<ReceiptIcon />}
                  title={subscription.receiver}
                  subtitle={
                    <Box>
                      <Chip label={'Next ' + format(executionDate, 'dd.MM')} sx={{mr: 1}} {...chipProps} />
                      <Chip label={subscription.category.name} {...chipProps} />
                    </Box>
                  }
                  amount={subscription.transferAmount}
                />
              );
            })
          ) : (
            <NoResults text="There are no more upcoming subscriptions for this month!" />
          )
        ) : (
          <NoResults />
        )}
      </Card.Body>
    </Card>
  );
};
