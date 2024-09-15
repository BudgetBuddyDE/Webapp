import {Box, Button, Stack, ToggleButton, ToggleButtonGroup} from '@mui/material';
import {PieChart} from '@mui/x-charts/PieChart';
import React from 'react';
import {Link} from 'react-router-dom';

import {PieCenterLabel} from '@/routes/Charts.route';
import {Formatter} from '@/services/Formatter.service';

import {Card, type TPieChartData} from '../Base';
import {CircularProgress} from '../Loading';
import {useSubscriptions} from './useSubscriptions.hook';

export const SubscriptionPieChart = () => {
  const {isLoading, data: subscriptions} = useSubscriptions();
  const [subscriptionType, setSubscriptionType] = React.useState<'INCOME' | 'EXPENSES'>('INCOME');

  const onChangeSubscriptionType = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, newType: typeof subscriptionType) => {
      setSubscriptionType(newType);
    },
    [],
  );

  const chartData: TPieChartData[] = React.useMemo(() => {
    if (!subscriptions) return [];

    const grouped = new Map<string, {name: string; total: number}>();
    for (const {
      paused,
      transfer_amount,
      expand: {
        category: {id, name},
      },
    } of subscriptions) {
      if (
        paused ||
        (subscriptionType === 'INCOME' && transfer_amount <= 0) ||
        (subscriptionType === 'EXPENSES' && transfer_amount >= 0)
      ) {
        continue;
      }

      const amount = Math.abs(transfer_amount);
      if (grouped.has(id)) {
        const curr = grouped.get(id)!;
        grouped.set(id, {name, total: curr.total + amount});
      } else grouped.set(id, {name, total: amount});
    }

    return Array.from(grouped.values()).map(({name, total}) => ({label: name, value: total}));
  }, [subscriptions, subscriptionType]);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Recurring Payments</Card.Title>
          <Card.Subtitle>Monthly recurring payments</Card.Subtitle>
        </Box>

        <Card.HeaderActions sx={{display: 'flex', flexDirection: 'row'}}>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={subscriptionType}
            onChange={onChangeSubscriptionType}
            exclusive>
            {(['INCOME', 'EXPENSES'] as (typeof subscriptionType)[]).map(type => (
              <ToggleButton key={type.toLowerCase()} value={type}>
                {type.substring(0, 1) + type.substring(1).toLowerCase()}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Card.HeaderActions>
      </Card.Header>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <React.Fragment>
          <Card.Body>
            <PieChart
              series={[
                {
                  data: chartData,
                  valueFormatter: value => Formatter.formatBalance(value.value),
                  innerRadius: 90,
                  paddingAngle: 1,
                  cornerRadius: 5,
                  highlightScope: {faded: 'global', highlighted: 'item'},
                  arcLabel: params => params.label ?? '',
                  arcLabelMinAngle: 15,
                  sortingValues(a, b) {
                    return b - a;
                  },
                },
              ]}
              height={350}
              margin={{left: 0, right: 0, top: 10, bottom: 0}}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}>
              <PieCenterLabel
                primaryText={Formatter.formatBalance(chartData.reduceRight((prev, curr) => prev + curr.value, 0))}
                secondaryText="Total"
              />
            </PieChart>
          </Card.Body>
          <Card.Footer sx={{mt: 2}}>
            <Stack direction="row" justifyContent={'flex-end'}>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/*@ts-expect-error*/}
              <Button LinkComponent={Link} to="/subscriptions">
                View more...
              </Button>
            </Stack>
          </Card.Footer>
        </React.Fragment>
      )}
    </Card>
  );
};
