import React from 'react';
import { Box, CardProps, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';
import Card from './Card.component';

export type TSparklineWidget = {
  title: string;
  subtitle?: string;
  cardProps?: CardProps;
  data: number[];
};

export const SparklineWidget: React.FC<TSparklineWidget> = ({
  title,
  subtitle,
  cardProps,
  data,
}) => {
  const theme = useTheme();
  return (
    <Card {...cardProps} sx={{ p: 0, ...cardProps?.sx }}>
      <Card.Header sx={{ p: 2 }}>
        <Box>
          <Card.Title>{title}</Card.Title>
          {subtitle && subtitle.length > 0 && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        </Box>
      </Card.Header>
      <Card.Body>
        <Chart
          type="line"
          width={'100%'}
          height={80}
          options={{
            chart: {
              sparkline: {
                enabled: true,
              },
            },
            stroke: {
              width: 3,
              curve: 'smooth',
            },
            tooltip: {
              theme: 'dark',
              y: {
                title: {
                  formatter() {
                    return '';
                  },
                },
                formatter(val) {
                  return val.toString();
                },
              },
            },
            colors: [theme.palette.primary.main],
          }}
          series={[{ data: data }]}
        />
      </Card.Body>
    </Card>
  );
};
