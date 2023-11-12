import { Grid } from '@mui/material';
import React from 'react';
import { StatsCard, StatsIconStyle, TStatsCardProps } from './StatsCard.component';
import {
  AddRounded,
  BalanceRounded,
  RemoveRounded,
  ScheduleSendRounded,
} from '@mui/icons-material';

export type TDashboardStatsWrapperProps = {};

export const DashboardStatsWrapper: React.FC<TDashboardStatsWrapperProps> = () => {
  const stats: TStatsCardProps[] = [
    { title: '', subtitle: 'Earnings', icon: <AddRounded sx={StatsIconStyle} /> },
    { title: '', subtitle: 'Upcoming Earnings', icon: <ScheduleSendRounded sx={StatsIconStyle} /> },
    { title: '', subtitle: 'Expenses', icon: <RemoveRounded sx={StatsIconStyle} /> },
    { title: '', subtitle: 'Upcoming Expenses', icon: <ScheduleSendRounded sx={StatsIconStyle} /> },
    { title: '', subtitle: 'Balance (estimated)', icon: <BalanceRounded sx={StatsIconStyle} /> },
    { title: '', subtitle: 'Balance', icon: <BalanceRounded sx={StatsIconStyle} /> },
  ];

  return (
    <React.Fragment>
      {stats.map((props) => (
        <Grid key={props.subtitle.toString().toLowerCase().replace(' ', '_')} item xs={6} md={2}>
          <StatsCard {...props} />
        </Grid>
      ))}
    </React.Fragment>
  );
};
