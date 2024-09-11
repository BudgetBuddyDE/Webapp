import {type TStockPositionWithQuote} from '@budgetbuddyde/types';
import {Box, LinearProgress, Stack, Typography, linearProgressClasses, useTheme} from '@mui/material';
import {PieChart} from '@mui/x-charts/PieChart';
import React from 'react';

import {Card, NoResults, type TPieChartData} from '@/components/Base';
import {PieCenterLabel} from '@/routes/Charts.route';
import {Formatter} from '@/services/Formatter.service';
import {generateHslColorScale} from '@/utils/colors';

export type TPortfolioDiversityChartProps = {
  positions: TStockPositionWithQuote[];
};

export const PortfolioDiversityChart: React.FC<TPortfolioDiversityChartProps> = ({positions}) => {
  const theme = useTheme();

  const preparedData: TPieChartData[] = React.useMemo(() => {
    const groupedData: Record<string, {label: string; total: number}> = {};
    for (const position of positions) {
      if (groupedData[position.isin]) {
        groupedData[position.isin].total += position.quantity * position.quote.price;
      } else {
        groupedData[position.isin] = {
          label: position.name,
          total: position.quantity * position.quote.price,
        };
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return Object.entries(groupedData).map(([_, {label, total}]) => ({
      label: label,
      value: total,
    }));
  }, [positions]);

  const colorRange: string[] = React.useMemo(() => {
    return generateHslColorScale(theme.palette.primary.dark, theme.palette.primary.light, preparedData.length);
  }, [preparedData]);

  const totalVolume: number = React.useMemo(() => {
    return preparedData.reduce((acc, curr) => acc + curr.value, 0);
  }, [preparedData]);

  return (
    <React.Fragment>
      <Card variant="outlined" sx={{display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1}}>
        <Card.Header>
          <Box>
            <Card.Title>Positions</Card.Title>
            <Card.Subtitle>How are you positions allocated?</Card.Subtitle>
          </Box>
        </Card.Header>
        <Card.Body>
          {preparedData.length > 0 ? (
            <Box sx={{display: 'flex'}}>
              <PieChart
                colors={colorRange}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
                series={[
                  {
                    data: preparedData.map(v => ({value: v.value, label: v.label})),
                    valueFormatter: value => Formatter.formatBalance(value.value),
                    innerRadius: 90,
                    paddingAngle: 1,
                    cornerRadius: 5,
                    highlightScope: {faded: 'global', highlighted: 'item'},
                  },
                ]}
                height={350}
                width={350}
                slotProps={{legend: {hidden: true}}}>
                <PieCenterLabel
                  primaryText={Formatter.formatBalance(preparedData.reduce((acc, curr) => acc + curr.value, 0))}
                  secondaryText="Total"
                />
              </PieChart>
            </Box>
          ) : (
            <NoResults text="No stock-positions found!" />
          )}
        </Card.Body>
        <Card.Body>
          {preparedData
            .map((pos, idx) => ({
              label: pos.label,
              value: parseFloat(((pos.value * 100) / totalVolume).toFixed(2)),
              color: colorRange[idx],
            }))
            .map((pos, idx) => (
              <Stack key={idx} direction="row" sx={{alignItems: 'center', gap: 2, pb: 2}}>
                <Stack sx={{gap: 1, flexGrow: 1}}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                    <Typography variant="body2" sx={{fontWeight: '500'}} noWrap>
                      {pos.label}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                      {pos.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    aria-label="Number of users by country"
                    value={pos.value}
                    sx={{
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: pos.color,
                      },
                    }}
                  />
                </Stack>
              </Stack>
            ))}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};
