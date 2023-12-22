import React from 'react';
import { Grid, type GridProps } from '@mui/material';
import { StatsCard, StatsIconStyle, type TStatsCardProps } from '@/components/StatsCard.component';
import { formatBalance } from '@/utils';
import { useFetchBudget } from '.';
import { SubscriptionService, useFetchSubscriptions } from '../Subscription';
import { AddRounded, BalanceRounded, RemoveRounded } from '@mui/icons-material';

export type TStatsWrapperProps = {
  containerProps?: GridProps;
};

export const StatsWrapper: React.FC<TStatsWrapperProps> = ({ containerProps }) => {
  const { loading: loadingSubscriptions, subscriptions } = useFetchSubscriptions();
  const { loading: loadingBudgets, budgets } = useFetchBudget();

  const values = {
    subscriptions: {
      income: React.useMemo(
        () =>
          SubscriptionService.getPlannedBalanceByType(subscriptions, 'INCOME').reduce(
            (prev, { transferAmount }) => prev + Math.abs(transferAmount),
            0
          ),
        [subscriptions]
      ),
      spendings: React.useMemo(
        () =>
          SubscriptionService.getPlannedBalanceByType(subscriptions, 'SPENDINGS').reduce(
            (prev, { transferAmount }) => prev + Math.abs(transferAmount),
            0
          ),
        [subscriptions]
      ),
    },
    budgets: {
      totalPlanned: React.useMemo(
        () => budgets.reduce((prev, { budget }) => prev + budget, 0),
        [budgets]
      ),
    },
  };

  const cards: TStatsCardProps[] = [
    {
      title: formatBalance(values.subscriptions.income),
      subtitle: 'Income',
      info: 'Based on your income subscriptions',
      loading: loadingSubscriptions,
      icon: <AddRounded sx={StatsIconStyle} />,
    },
    {
      title: formatBalance(values.subscriptions.spendings),
      subtitle: 'Spendings',
      info: 'Based on your spending subscriptions',
      icon: <RemoveRounded sx={StatsIconStyle} />,
    },
    {
      title: `${formatBalance(values.budgets.totalPlanned)} / ${formatBalance(
        values.subscriptions.income
      )}`,
      subtitle: 'Planned Budget',
      info: 'Already planned budget against planned available income',
      loading: loadingBudgets,
      icon: <BalanceRounded sx={StatsIconStyle} />,
    },
    {
      title: formatBalance(values.subscriptions.income - values.budgets.totalPlanned),
      subtitle: 'Available Budget',
      info: 'Available budget based on planned income and budget',
      loading: loadingBudgets || loadingSubscriptions,
    },
  ];

  return (
    <Grid container spacing={3} item xs={12} md={12} {...containerProps}>
      {cards.map((card, idx) => (
        <Grid key={idx} item xs={6} md={6}>
          <StatsCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};
