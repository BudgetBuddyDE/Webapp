import { Card, type TCardProps } from '@/components/Base';
import { formatBalance } from '@/utils';
import { type TDescription } from '@budgetbuddyde/types';
import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import React from 'react';

export type TBalanceWidgetData = {
  type: 'INCOME' | 'SPENDINGS';
  label: string;
  description: TDescription;
  amount: number;
};

export type TBalanceWidgetProps = {
  cardProps?: TCardProps;
  income?: TBalanceWidgetData[];
  spendings?: TBalanceWidgetData[];
};

export const BalanceWidget: React.FC<TBalanceWidgetProps> = ({ cardProps, income, spendings }) => {
  const totalIncome: number = React.useMemo(() => {
    return income?.reduce((acc, { amount }) => acc + amount, 0) ?? 0;
  }, [income]);

  const totalSpendings: number = React.useMemo(() => {
    return spendings?.reduce((acc, { amount }) => acc + amount, 0) ?? 0;
  }, [spendings]);

  const totalBalance: number = React.useMemo(() => {
    return totalIncome + totalSpendings;
  }, [totalIncome, totalSpendings]);

  const groupData = React.useCallback((data: TBalanceWidgetData[]): TBalanceWidgetData[] => {
    if (data.length === 0) return [];
    return Object.values(
      data.reduce((acc: { [key: string]: TBalanceWidgetData }, item: TBalanceWidgetData) => {
        const { label, amount, type } = item;
        if (acc[label]) {
          acc[label].amount += amount;
        } else {
          acc[label] = { label, description: 'No information', type, amount };
        }
        return acc;
      }, {})
    );
  }, []);

  const groupedIncome = React.useMemo(() => {
    return groupData(income ?? []);
  }, [income]);

  const groupedSpendings = React.useMemo(() => {
    return groupData(spendings ?? []);
  }, [spendings]);

  return (
    <Card {...cardProps}>
      <Card.Header>
        <Box>
          <Card.Title>Balance</Card.Title>
        </Box>
      </Card.Header>
      <Card.Body>
        <List subheader={<Typography fontWeight={'bolder'}>Income</Typography>} dense>
          {groupedIncome.length > 0 &&
            groupedIncome.map(({ amount, label }) => (
              <ListItem
                secondaryAction={<Typography>{formatBalance(amount)}</Typography>}
                disablePadding
              >
                <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 'bolder' }} />
              </ListItem>
            ))}
        </List>

        <Divider />
        <List subheader={<Typography fontWeight={'bolder'}>Spendings</Typography>} dense>
          {groupedSpendings.length > 0 &&
            groupedSpendings.map(({ amount, label }) => (
              <ListItem
                secondaryAction={<Typography>{formatBalance(amount)}</Typography>}
                disablePadding
              >
                <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 'bolder' }} />
              </ListItem>
            ))}
        </List>
        <Divider />

        <List dense>
          {[
            { label: 'Income', amount: totalIncome },
            { label: 'Spendings', amount: totalSpendings },
            { label: 'Balance', amount: totalBalance },
          ].map(({ label, amount }, idx, list) => (
            <ListItem
              secondaryAction={
                <Typography
                  sx={{
                    textDecoration: idx === list.length - 1 ? 'underline' : 'none',
                    textDecorationStyle: 'double',
                  }}
                >
                  {formatBalance(amount)}
                </Typography>
              }
              disablePadding
            >
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 'bolder' }} />
            </ListItem>
          ))}
        </List>
      </Card.Body>
    </Card>
  );
};
