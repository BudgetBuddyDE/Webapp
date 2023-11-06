import React from 'react';
import { format } from 'date-fns';
import { Box, Chip, IconButton, type ChipProps } from '@mui/material';
import { AddRounded as AddIcon, ReceiptRounded as ReceiptIcon } from '@mui/icons-material';
import type { TTransaction } from '@/types';
import { Card, ListWithIcon, NoResults } from '@/components/Base';

export type TTransactionList = {
  data: TTransaction[];
};

export const TransactionList: React.FC<TTransactionList> = ({ data }) => {
  const chipProps: ChipProps = {
    variant: 'outlined',
    size: 'small',
    sx: { mr: 1 },
  };

  const handleAddClick = () => {
    console.log('test');
  };

  return (
    <Card>
      <Card.Header sx={{ mb: 1 }}>
        <Box>
          <Card.Title>Transactions</Card.Title>
          <Card.Subtitle>Your latest transactions</Card.Subtitle>
        </Box>
        <Card.HeaderActions>
          <IconButton color="primary" onClick={handleAddClick}>
            <AddIcon />
          </IconButton>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body>
        {data.length > 0 ? (
          data.map((transaction) => (
            <ListWithIcon
              key={transaction.id}
              icon={<ReceiptIcon />}
              title={transaction.receiver}
              subtitle={
                <Box>
                  <Chip
                    label={format(new Date(transaction.processedAt), 'dd.MM')}
                    sx={{ mr: 1 }}
                    {...chipProps}
                  />
                  <Chip label={transaction.category.name} {...chipProps} />
                </Box>
              }
              amount={transaction.transferAmount}
            />
          ))
        ) : (
          <NoResults />
        )}
      </Card.Body>
    </Card>
  );
};
