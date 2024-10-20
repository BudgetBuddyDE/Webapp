import {PocketBaseCollection, type TUser} from '@budgetbuddyde/types';
import {AddRounded, BalanceRounded, RemoveRounded} from '@mui/icons-material';
import {Grid2 as Grid} from '@mui/material';
import {format} from 'date-fns';
import React from 'react';
import {create} from 'zustand';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/features/Auth';
import {useSubscriptionStore, useSubscriptions} from '@/features/Subscription';
import {useTransactionStore, useTransactions} from '@/features/Transaction';
import {type IBaseStore} from '@/hooks/GenericHook';
import {pb} from '@/pocketbase.ts';
import {Formatter} from '@/services/Formatter';

import {StatsCard, type TStatsCardProps} from '../StatsCard';

export type TDashboardStats = {
  earnings: number;
  expenses: number;
  balance: number;
};

export interface IDashboardStatsStore extends IBaseStore<TDashboardStats> {
  fetchedBy: NonNullable<TUser>['id'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TDashboardStats, fetchedBy: NonNullable<TUser>['id'] | null) => void;
}

export const useDashboardStatsStore = create<IDashboardStatsStore>(set => ({
  data: {
    earnings: 0,
    expenses: 0,
    balance: 0,
  },
  fetchedBy: null,
  fetchedAt: null,
  set: data => set({data: data}),
  setFetchedData: (data, fetchedBy) => set({data: data, fetchedBy: fetchedBy, fetchedAt: new Date()}),
  clear: () =>
    set({
      data: {
        earnings: 0,
        expenses: 0,
        balance: 0,
      },
      fetchedBy: null,
      fetchedAt: null,
    }),
}));

export type TDashboardStatsWrapperProps = unknown;

export const DashboardStatsWrapper: React.FC<TDashboardStatsWrapperProps> = () => {
  const {sessionUser} = useAuthContext();
  const {data: fetchedStats, setFetchedData, fetchedBy} = useDashboardStatsStore();
  const {isLoading: isLoadingTransactions, getUpcoming: tra_getUpcoming} = useTransactions();
  const {isLoading: isLoadingSubscriptions, getUpcoming: sub_getUpcoming} = useSubscriptions();
  const [loading, setLoading] = React.useState(false);

  const upcomingIncome: number = React.useMemo(() => {
    return tra_getUpcoming('INCOME') + sub_getUpcoming('INCOME');
  }, [tra_getUpcoming, sub_getUpcoming]);

  const upcomingExpenses: number = React.useMemo(() => {
    return tra_getUpcoming('EXPENSES') + sub_getUpcoming('EXPENSES');
  }, [tra_getUpcoming, sub_getUpcoming]);

  const estimatedBalance: number = React.useMemo(() => {
    const income = fetchedStats.earnings + upcomingIncome;
    const expenses = fetchedStats.expenses + Math.abs(upcomingExpenses);
    return income - expenses;
  }, [fetchedStats, upcomingIncome, upcomingExpenses]);

  const stats: TStatsCardProps[] = React.useMemo(() => {
    return [
      {
        isLoading: isLoadingTransactions || isLoadingSubscriptions || loading,
        icon: <AddRounded />,
        label: 'Income',
        value: Formatter.formatBalance(fetchedStats.earnings),
        valueInformation: `Upcoming: ${Formatter.formatBalance(upcomingIncome)}`,
      },
      {
        isLoading: isLoadingTransactions || isLoadingSubscriptions || loading,
        icon: <RemoveRounded />,
        label: 'Spendings',
        value: Formatter.formatBalance(fetchedStats.expenses),
        valueInformation: `Upcoming: ${Formatter.formatBalance(Math.abs(upcomingExpenses))}`,
      },
      {
        icon: <BalanceRounded />,
        label: 'Balance',
        value: Formatter.formatBalance(fetchedStats.balance),
        valueInformation: `Exstimated: ${Formatter.formatBalance(estimatedBalance)}`,
      },
    ];
  }, [fetchedStats, loading, isLoadingTransactions, isLoadingSubscriptions, upcomingIncome, upcomingExpenses]);

  const fetchData = React.useCallback(async () => {
    if (!sessionUser) return;
    try {
      const data = await pb
        .collection(PocketBaseCollection.V_MONTHLY_BALANCES)
        .getFirstListItem(`date="${format(new Date(), 'yyyy-MM')}"`);
      if (!data) {
        setFetchedData({earnings: 0, expenses: 0, balance: 0}, sessionUser.id);
      }
      setFetchedData(
        {
          earnings: data.income,
          expenses: data.expenses,
          balance: data.balance,
        },
        sessionUser.id,
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  React.useEffect(() => {
    useTransactionStore.subscribe((curr, prev) => {
      if ((prev.data ?? []).length !== (curr.data ?? []).length) fetchData();
    });

    useSubscriptionStore.subscribe((curr, prev) => {
      if ((prev.data ?? []).length !== (curr.data ?? []).length) fetchData();
    });
  }, []);

  React.useEffect(() => {
    if (!sessionUser || (fetchedBy === sessionUser.id && fetchedStats)) return;
    setLoading(true);
    fetchData().finally(() => setLoading(false));
    return () => {
      setLoading(false);
    };
  }, [sessionUser]);

  return (
    <Grid container size={{xs: 12}} spacing={AppConfig.baseSpacing}>
      {stats.map((props, idx, list) => (
        <Grid
          key={props.label.toString().toLowerCase().replace(' ', '_')}
          size={{xs: idx == list.length - 1 ? 12 : 6, md: 4}}
          sx={{height: 'unset'}}>
          <StatsCard isLoading={loading} {...props} />
        </Grid>
      ))}
    </Grid>
  );
};
