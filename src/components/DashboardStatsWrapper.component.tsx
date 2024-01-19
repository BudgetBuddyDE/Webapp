import { Grid } from '@mui/material';
import React from 'react';
import { StatsCard, TStatsCardProps } from './StatsCard.component';
import {
  AddRounded,
  BalanceRounded,
  RemoveRounded,
  ScheduleSendRounded,
} from '@mui/icons-material';
import { IBaseStore, TransactionService, useTransactionStore } from '@/core/Transaction';
import { TUser } from '@budgetbuddyde/types';
import { create } from 'zustand';
import { useAuthContext } from '@/core/Auth';
import { useSubscriptionStore } from '@/core/Subscription';
import { formatBalance } from '@/utils';

export type TDashboardStats = {
  earnings: number;
  upcoming_earnings: number;
  expenses: number;
  upcoming_expenses: number;
  balance: number;
};

export interface IDashboardStatsStore extends IBaseStore<TDashboardStats> {
  fetchedBy: TUser['uuid'] | null;
  fetchedAt: Date | null;
  setFetchedData: (data: TDashboardStats, fetchedBy: TUser['uuid'] | null) => void;
}

export const useDashboardStatsStore = create<IDashboardStatsStore>((set) => ({
  data: {
    earnings: 0,
    upcoming_earnings: 0,
    expenses: 0,
    upcoming_expenses: 0,
    balance: 0,
  },
  fetchedBy: null,
  fetchedAt: null,
  set: (data) => set({ data: data }),
  setFetchedData: (data, fetchedBy) =>
    set({ data: data, fetchedBy: fetchedBy, fetchedAt: new Date() }),
  clear: () =>
    set({
      data: {
        earnings: 0,
        upcoming_earnings: 0,
        expenses: 0,
        upcoming_expenses: 0,
        balance: 0,
      },
      fetchedBy: null,
      fetchedAt: null,
    }),
}));

export type TDashboardStatsWrapperProps = {};

export const DashboardStatsWrapper: React.FC<TDashboardStatsWrapperProps> = () => {
  const { session, authOptions } = useAuthContext();
  const { data: fetchedStats, setFetchedData, fetchedBy } = useDashboardStatsStore();
  const [loading, setLoading] = React.useState(false);

  const stats: TStatsCardProps[] = React.useMemo(() => {
    return [
      {
        value: formatBalance(fetchedStats.earnings),
        label: 'Earnings',
        icon: <AddRounded />,
      },
      {
        value: formatBalance(fetchedStats.upcoming_earnings),
        label: 'Upcoming Earnings',
        icon: <ScheduleSendRounded />,
      },
      {
        value: formatBalance(fetchedStats.expenses),
        label: 'Expenses',
        icon: <RemoveRounded />,
      },
      {
        value: formatBalance(fetchedStats.upcoming_expenses),
        label: 'Upcoming Expenses',
        icon: <ScheduleSendRounded />,
      },
      {
        value: formatBalance(fetchedStats.balance),
        label: 'Balance',
        icon: <BalanceRounded />,
      },
    ];
  }, [fetchedStats]);

  const fetchData = React.useCallback(async () => {
    if (!session) return;
    try {
      const [stats, error] = await TransactionService.getDashboardStats(authOptions);
      if (error) throw error;
      if (!stats) return;

      setFetchedData(stats, session.uuid);
    } catch (error) {
      console.error(error);
    }
  }, [authOptions]);

  React.useEffect(() => {
    useTransactionStore.subscribe((curr, prev) => {
      if (prev.data.length !== curr.data.length) fetchData();
    });

    useSubscriptionStore.subscribe((curr, prev) => {
      if (prev.data.length !== curr.data.length) fetchData();
    });
  }, []);

  React.useEffect(() => {
    if (!session || (fetchedBy === session.uuid && fetchedStats)) return;
    setLoading(true);
    fetchData().finally(() => setLoading(false));
    return () => {
      setLoading(false);
    };
  }, [session]);

  return (
    <Grid container item xs={12} md={12} columns={10} spacing={3}>
      {stats.map((props, idx, list) => (
        <Grid
          key={props.label.toString().toLowerCase().replace(' ', '_')}
          item
          xs={idx == list.length - 1 ? 10 : 5}
          md={2}
        >
          <StatsCard isLoading={loading} {...props} />
        </Grid>
      ))}
    </Grid>
  );
};
