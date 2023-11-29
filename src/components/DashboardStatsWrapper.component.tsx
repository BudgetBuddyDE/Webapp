import { Grid } from '@mui/material';
import React from 'react';
import { StatsCard, StatsIconStyle, TStatsCardProps } from './StatsCard.component';
import {
  AddRounded,
  BalanceRounded,
  RemoveRounded,
  ScheduleSendRounded,
} from '@mui/icons-material';
import { IBaseStore, TransactionService, useFetchTransactions } from '@/core/Transaction';
import { TUser } from '@/types';
import { create } from 'zustand';
import { useAuthContext } from '@/core/Auth';
import { useFetchSubscriptions } from '@/core/Subscription';
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
  const { loading: loadingTransactions, transactions } = useFetchTransactions();
  const { loading: loadingSubscriptions, subscriptions } = useFetchSubscriptions();
  const { data: fetchedStats, setFetchedData, fetchedBy } = useDashboardStatsStore();
  const [loading, setLoading] = React.useState(false);

  const stats: TStatsCardProps[] = React.useMemo(() => {
    return [
      {
        title: formatBalance(fetchedStats.earnings),
        subtitle: 'Earnings',
        icon: <AddRounded sx={StatsIconStyle} />,
      },
      {
        title: formatBalance(fetchedStats.upcoming_earnings),
        subtitle: 'Upcoming Earnings',
        icon: <ScheduleSendRounded sx={StatsIconStyle} />,
      },
      {
        title: formatBalance(fetchedStats.expenses),
        subtitle: 'Expenses',
        icon: <RemoveRounded sx={StatsIconStyle} />,
      },
      {
        title: formatBalance(fetchedStats.upcoming_expenses),
        subtitle: 'Upcoming Expenses',
        icon: <ScheduleSendRounded sx={StatsIconStyle} />,
      },
      {
        title: formatBalance(fetchedStats.balance),
        subtitle: 'Balance',
        icon: <BalanceRounded sx={StatsIconStyle} />,
      },
    ];
  }, [fetchedStats]);

  const fetchData = React.useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [stats, error] = await TransactionService.getDashboardStats(authOptions);
      if (error) throw error;
      if (!stats) return;

      setFetchedData(stats, session.uuid);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [authOptions]);

  React.useEffect(() => {
    if (!session || (fetchedBy === session.uuid && fetchedStats)) return;
    if (loadingTransactions || loadingSubscriptions) return;
    if (!transactions || !subscriptions) return;
    fetchData();
  }, [session, transactions, subscriptions]);

  return (
    <Grid container item xs={12} md={12} columns={10} spacing={3}>
      {stats.map((props, idx, list) => (
        <Grid
          key={props.subtitle.toString().toLowerCase().replace(' ', '_')}
          item
          xs={idx == list.length - 1 ? 10 : 5}
          md={2}
        >
          <StatsCard loading={loading} {...props} />
        </Grid>
      ))}
    </Grid>
  );
};
