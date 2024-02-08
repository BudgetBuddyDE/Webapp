import { Card, MuiPieChart, type TMuiChartData } from '@/components/Base';
import { Box } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';

export type TPortfolioDiversityChartProps = {
  data: TMuiChartData;
};

export const PortfolioDiversityChart: React.FC<TPortfolioDiversityChartProps> = ({ data }) => {
  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Positionen</Card.Title>
          <Card.Subtitle>Wie ist dein Depot aufgebaut</Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body>
        <Box sx={{ display: 'flex', flex: 1, mt: '1rem', flexDirection: 'column' }}>
          {/* <PieChart
                width={width}
                height={width}
                series={[
                  {
                    type: 'pie',
                    data: data,
                    innerRadius: 80,
                    paddingAngle: 3,
                    cornerRadius: 5,
                    startAngle: 0,
                    endAngle: 360,
                    // cx: 150,
                    // cy: 150,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 70, additionalRadius: -30, color: 'gray' },
                  },
                ]}
                margin={{ right: 0 }}
                slotProps={{ legend: { hidden: true } }}
              >
                <PieCenterLabel>
                  {formatBalance(data.reduce((prev, cur) => prev + cur.value, 0))}
                </PieCenterLabel>
              </PieChart> */}
          <ParentSize>
            {({ width }) => (
              <MuiPieChart
                width={width}
                height={width}
                data={data}
                showTotalSum
                formatAsCurrency
                skipAnimation
              />
            )}
          </ParentSize>
        </Box>
      </Card.Body>
    </Card>
  );
};
