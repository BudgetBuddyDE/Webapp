import {AddRounded, BalanceRounded, RemoveRounded} from '@mui/icons-material';
import {Grid, type GridProps} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';
import {StatsCard, type TStatsCardProps} from '@/components/StatsCard.component';
import {SubscriptionService, useFetchSubscriptions} from '@/components/Subscription';
import {Formatter} from '@/services';

import {useFetchBudget} from './useFetchBudget.hook';

export type TStatsWrapperProps = {
  containerProps?: GridProps;
};

export const StatsWrapper: React.FC<TStatsWrapperProps> = ({containerProps}) => {
  const {loading: loadingSubscriptions, subscriptions} = useFetchSubscriptions();
  const {loading: loadingBudgets, budgets} = useFetchBudget();

  const values = {
    subscriptions: {
      income: React.useMemo(
        () =>
          SubscriptionService.getPlannedBalanceByType(subscriptions, 'INCOME').reduce(
            (prev, {transfer_amount}) => prev + Math.abs(transfer_amount),
            0,
          ),
        [subscriptions],
      ),
      spendings: React.useMemo(
        () =>
          SubscriptionService.getPlannedBalanceByType(subscriptions, 'SPENDINGS').reduce(
            (prev, {transfer_amount}) => prev + Math.abs(transfer_amount),
            0,
          ),
        [subscriptions],
      ),
    },
    budgets: {
      totalPlanned: React.useMemo(() => budgets.reduce((prev, {budget}) => prev + budget, 0), [budgets]),
    },
  };

  const cards: TStatsCardProps[] = [
    {
      value: Formatter.formatBalance(values.subscriptions.income),
      label: 'Income',
      valueInformation: 'Based on your income subscriptions',
      isLoading: loadingSubscriptions,
      icon: <AddRounded />,
    },
    {
      value: Formatter.formatBalance(values.subscriptions.spendings),
      label: 'Spendings',
      valueInformation: 'Based on your spending subscriptions',
      icon: <RemoveRounded />,
    },
    {
      value: `${Formatter.formatBalance(values.budgets.totalPlanned)} / ${Formatter.formatBalance(values.subscriptions.income)}`,
      label: 'Planned Budget',
      valueInformation: 'Already planned budget against planned available income',
      isLoading: loadingBudgets,
      icon: <BalanceRounded />,
    },
    {
      value: Formatter.formatBalance(values.subscriptions.income - values.budgets.totalPlanned),
      label: 'Available Budget',
      valueInformation: 'Available budget based on planned income and budget',
      isLoading: loadingBudgets || loadingSubscriptions,
    },
  ];

  return (
    <Grid container spacing={AppConfig.baseSpacing} item xs={12} md={12} {...containerProps}>
      {cards.map((card, idx) => (
        <Grid key={idx} item xs={6} md={3} sx={{height: 'unset'}}>
          <StatsCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};
