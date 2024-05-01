import {PocketBaseCollection, type TUser} from '@budgetbuddyde/types';
import {AddRounded, BalanceRounded, RemoveRounded} from '@mui/icons-material';
import {Grid} from '@mui/material';
import {format} from 'date-fns';
import React from 'react';
import {create} from 'zustand';

import {useAuthContext} from '@/components/Auth';
import {useSubscriptionStore} from '@/components/Subscription';
import {type IBaseStore, useTransactionStore} from '@/components/Transaction';
import {pb} from '@/pocketbase.ts';
import {formatBalance} from '@/utils';

import {StatsCard, type TStatsCardProps} from './StatsCard.component';

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
  const [loading, setLoading] = React.useState(false);

  const stats: TStatsCardProps[] = React.useMemo(() => {
    return [
      {
        icon: <AddRounded />,
        label: 'Income',
        value: formatBalance(fetchedStats.earnings),
      },
      {
        icon: <RemoveRounded />,
        label: 'Spendings',
        value: formatBalance(fetchedStats.expenses),
      },
      {
        icon: <BalanceRounded />,
        label: 'Balance',
        value: formatBalance(fetchedStats.balance),
      },
    ];
  }, [fetchedStats]);

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
      if (prev.data.length !== curr.data.length) fetchData();
    });

    useSubscriptionStore.subscribe((curr, prev) => {
      if (prev.data.length !== curr.data.length) fetchData();
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
    <Grid container item xs={12} md={12} columns={12} spacing={3}>
      {stats.map((props, idx, list) => (
        <Grid
          key={props.label.toString().toLowerCase().replace(' ', '_')}
          item
          xs={idx == list.length - 1 ? 12 : 6}
          md={4}
          sx={{height: 'unset'}}>
          <StatsCard isLoading={loading} {...props} />
        </Grid>
      ))}
    </Grid>
  );
};
