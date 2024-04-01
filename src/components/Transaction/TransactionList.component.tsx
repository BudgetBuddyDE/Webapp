import React from 'react';
import {format} from 'date-fns';
import {Box, Chip, IconButton, type ChipProps} from '@mui/material';
import {AddRounded as AddIcon, ReceiptRounded as ReceiptIcon} from '@mui/icons-material';
import type {TTransaction} from '@budgetbuddyde/types';
import {Card, ListWithIcon, NoResults, TCardProps} from '@/components/Base';

export type TTransactionListProps = {
  title: string;
  subtitle?: string;
  noResultsMessage?: string;
  data: TTransaction[];
  onAddTransaction?: () => void;
  cardProps?: TCardProps;
};

export const TransactionList: React.FC<TTransactionListProps> = ({
  title,
  subtitle,
  noResultsMessage = "You haven't made any purchases yet",
  data,
  onAddTransaction,
  cardProps,
}) => {
  const chipProps: ChipProps = {
    variant: 'outlined',
    size: 'small',
    sx: {mr: 1},
  };

  return (
    <Card {...cardProps}>
      <Card.Header sx={{mb: 1}}>
        <Box>
          <Card.Title>{title}</Card.Title>
          {subtitle !== undefined && subtitle.length > 0 && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        </Box>
        {onAddTransaction && (
          <Card.HeaderActions>
            <IconButton color="primary" onClick={onAddTransaction}>
              <AddIcon />
            </IconButton>
          </Card.HeaderActions>
        )}
      </Card.Header>
      <Card.Body>
        {data.length > 0 ? (
          data.map(transaction => (
            <ListWithIcon
              key={transaction.id}
              icon={<ReceiptIcon />}
              title={transaction.receiver}
              subtitle={
                <Box>
                  <Chip label={format(new Date(transaction.processedAt), 'dd.MM')} sx={{mr: 1}} {...chipProps} />
                  <Chip label={transaction.category.name} {...chipProps} />
                </Box>
              }
              amount={transaction.transferAmount}
            />
          ))
        ) : (
          <NoResults text={noResultsMessage} />
        )}
      </Card.Body>
    </Card>
  );
};
