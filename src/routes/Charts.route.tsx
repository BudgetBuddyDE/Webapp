import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid2,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  linearProgressClasses,
  styled,
  useTheme,
} from '@mui/material';
import {Gauge, gaugeClasses, useDrawingArea} from '@mui/x-charts';
import {BarChart} from '@mui/x-charts/BarChart';
import {LineChart, areaElementClasses} from '@mui/x-charts/LineChart';
import {PieChart} from '@mui/x-charts/PieChart';
import {SparkLineChart} from '@mui/x-charts/SparkLineChart';
import React from 'react';

import {AppConfig} from '@/app.config';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {Formatter} from '@/services';

const ChartsRoute = () => {
  const theme = useTheme();
  const daysInMonth = getDaysInMonth(new Date().getMonth() + 1, new Date().getFullYear());
  const sparklineData = daysInMonth.map(() => Math.floor(Math.random() * 100));
  const trendColors = {
    up: theme.palette.mode === 'light' ? theme.palette.success.main : theme.palette.success.dark,
    down: theme.palette.mode === 'light' ? theme.palette.error.main : theme.palette.error.dark,
    neutral: theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[700],
  };

  return (
    <Grid2 container spacing={AppConfig.baseSpacing}>
      <Grid2 size={{xs: 12}}>
        <Typography variant="h4">Charts</Typography>
      </Grid2>
      <Grid2 size={{xs: 12, md: 6}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Sessions
            </Typography>
            <Stack sx={{justifyContent: 'space-between'}}>
              <Stack
                direction="row"
                sx={{
                  alignContent: {xs: 'center', sm: 'flex-start'},
                  alignItems: 'center',
                  gap: 1,
                }}>
                <Typography variant="h4" component="p">
                  13,277
                </Typography>
                <Chip size="small" color="success" label="+35%" />
              </Stack>
              <Typography variant="caption" sx={{color: 'text.secondary'}}>
                Sessions per day for the last 30 days
              </Typography>
            </Stack>
            <LineChart
              colors={[theme.palette.primary.light, theme.palette.primary.main, theme.palette.primary.dark]}
              xAxis={[
                {
                  scaleType: 'point',
                  data: getDaysInMonth(4, 2024),
                  tickInterval: (_, i) => (i + 1) % 5 === 0,
                },
              ]}
              series={[
                {
                  id: 'direct',
                  label: 'Direct',
                  showMark: false,
                  curve: 'linear',
                  stack: 'total',
                  area: true,
                  stackOrder: 'ascending',
                  data: [
                    300, 900, 600, 1200, 1500, 1800, 2400, 2100, 2700, 3000, 1800, 3300, 3600, 3900, 4200, 4500, 3900,
                    4800, 5100, 5400, 4800, 5700, 6000, 6300, 6600, 6900, 7200, 7500, 7800, 8100,
                  ],
                },
                {
                  id: 'referral',
                  label: 'Referral',
                  showMark: false,
                  curve: 'linear',
                  stack: 'total',
                  area: true,
                  stackOrder: 'ascending',
                  data: [
                    500, 900, 700, 1400, 1100, 1700, 2300, 2000, 2600, 2900, 2300, 3200, 3500, 3800, 4100, 4400, 2900,
                    4700, 5000, 5300, 5600, 5900, 6200, 6500, 5600, 6800, 7100, 7400, 7700, 8000,
                  ],
                },
                {
                  id: 'organic',
                  label: 'Organic',
                  showMark: false,
                  curve: 'linear',
                  stack: 'total',
                  stackOrder: 'ascending',
                  data: [
                    1000, 1500, 1200, 1700, 1300, 2000, 2400, 2200, 2600, 2800, 2500, 3000, 3400, 3700, 3200, 3900,
                    4100, 3500, 4300, 4500, 4000, 4700, 5000, 5200, 4800, 5400, 5600, 5900, 6100, 6300,
                  ],
                  area: true,
                },
              ]}
              height={250}
              margin={{left: 50, right: 0, top: 20, bottom: 20}}
              grid={{horizontal: true}}
              sx={{
                '& .MuiAreaElement-series-organic': {
                  fill: "url('#organic')",
                },
                '& .MuiAreaElement-series-referral': {
                  fill: "url('#referral')",
                },
                '& .MuiAreaElement-series-direct': {
                  fill: "url('#direct')",
                },
              }}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}>
              <AreaGradient color={theme.palette.primary.dark} id="organic" />
              <AreaGradient color={theme.palette.primary.main} id="referral" />
              <AreaGradient color={theme.palette.primary.light} id="direct" />
            </LineChart>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12, md: 6}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Page views and downloads
            </Typography>
            <Stack sx={{justifyContent: 'space-between'}}>
              <Stack
                direction="row"
                sx={{
                  alignContent: {xs: 'center', sm: 'flex-start'},
                  alignItems: 'center',
                  gap: 1,
                }}>
                <Typography variant="h4" component="p">
                  1.3M
                </Typography>
                <Chip size="small" color="error" label="-8%" />
              </Stack>
              <Typography variant="caption" sx={{color: 'text.secondary'}}>
                Page views and downloads for the last 6 months
              </Typography>
            </Stack>
            <BarChart
              borderRadius={8}
              colors={[theme.palette.primary.light, theme.palette.primary.main, theme.palette.primary.dark]}
              xAxis={
                [
                  {
                    scaleType: 'band',
                    categoryGapRatio: 0.5,
                    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                  },
                ] as any
              }
              series={[
                {
                  id: 'page-views',
                  label: 'Page views',
                  data: [2234, 3872, 2998, 4125, 3357, 2789, 2998],
                  stack: 'A',
                },
                {
                  id: 'downloads',
                  label: 'Downloads',
                  data: [3098, 4215, 2384, 2101, 4752, 3593, 2384],
                  stack: 'A',
                },
                {
                  id: 'conversions',
                  label: 'Conversions',
                  data: [4051, 2275, 3129, 4693, 3904, 2038, 2275],
                  stack: 'A',
                },
              ]}
              height={250}
              margin={{left: 50, right: 0, top: 20, bottom: 20}}
              grid={{horizontal: true}}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12}}>
        <Typography variant="h4">Pie Charts</Typography>
      </Grid2>

      <Grid2 size={{xs: 12, md: 3}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Monthly expenses
            </Typography>
            <PieChart
              series={[
                {
                  data: [
                    {id: 'groceries', value: 276, label: 'Grocieries'},
                    {id: 'public-transport', value: 65, label: 'Public transport'},
                    {id: 'rent', value: 800, label: 'Rent'},
                  ],
                  valueFormatter: value => Formatter.formatBalance(value.value),
                },
              ]}
              height={250}
              margin={{left: 20, right: 20, top: 20, bottom: 20}}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12, md: 3}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Monthly expenses
            </Typography>
            <PieChart
              series={[
                {
                  data: [
                    {id: 'groceries', value: 276, label: 'Grocieries'},
                    {id: 'public-transport', value: 65, label: 'Public transport'},
                    {id: 'rent', value: 800, label: 'Rent'},
                  ],
                  valueFormatter: value => Formatter.formatBalance(value.value),
                  innerRadius: 50,
                  outerRadius: 100,
                  paddingAngle: 5,
                  cornerRadius: 5,
                },
              ]}
              height={250}
              margin={{left: 20, right: 20, top: 20, bottom: 20}}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12, md: 3}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Monthly expenses
            </Typography>
            <PieChart
              series={[
                {
                  data: [
                    {id: 'groceries', value: 276, label: 'Grocieries'},
                    {id: 'public-transport', value: 65, label: 'Public transport'},
                    {id: 'rent', value: 800, label: 'Rent'},
                    {id: 'abonement', value: 124, label: 'Abonement'},
                    {id: 'investment', value: 1200, label: 'Investment'},
                    {id: 'office', value: 87, label: 'Office'},
                  ],
                  valueFormatter: value => Formatter.formatBalance(value.value),
                  innerRadius: 50,
                  outerRadius: 100,
                  paddingAngle: 1,
                  cornerRadius: 5,
                  arcLabel: params => params.label ?? '',
                  arcLabelMinAngle: 30,
                  sortingValues(a, b) {
                    return b - a;
                  },
                },
              ]}
              height={250}
              margin={{left: 20, right: 20, top: 20, bottom: 20}}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}>
              {/* <PieCenterLabel>Center label</PieCenterLabel> */}
            </PieChart>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12, md: 3}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Monthly expenses
            </Typography>
            <PieChart
              series={[
                {
                  data: [
                    {id: 'groceries', value: 276, label: 'Grocieries'},
                    {id: 'public-transport', value: 65, label: 'Public transport'},
                    {id: 'rent', value: 800, label: 'Rent'},
                    {id: 'abonement', value: 124, label: 'Abonement'},
                    {id: 'investment', value: 1200, label: 'Investment'},
                    {id: 'office', value: 87, label: 'Office'},
                  ],
                  valueFormatter: value => Formatter.formatBalance(value.value),
                  innerRadius: 65,
                  outerRadius: 110,
                  paddingAngle: 1,
                  cornerRadius: 5,
                  startAngle: -110,
                  endAngle: 110,
                  arcLabel: params => params.label ?? '',
                  arcLabelMinAngle: 30,
                  sortingValues(a, b) {
                    return b - a;
                  },
                },
              ]}
              height={250}
              margin={{left: 10, right: 10, top: 10, bottom: 10}}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}>
              <PieCenterLabel primaryText={Formatter.formatBalance(2552)} secondaryText="Total" />
            </PieChart>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12}}>
        <Typography variant="h4">Stocks</Typography>
      </Grid2>

      <Grid2 size={{xs: 12, md: 6}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Siemens AG
            </Typography>
            <Stack sx={{justifyContent: 'space-between'}}>
              <Stack
                direction="row"
                sx={{
                  alignContent: {xs: 'center', sm: 'flex-start'},
                  alignItems: 'center',
                  gap: 1,
                }}>
                <Typography variant="h4" component="p">
                  {Formatter.formatBalance(183.45)}
                </Typography>
                <Chip size="small" color="success" label={`+ ${Formatter.formatBalance(183.45 - 123.65)}`} />
              </Stack>
              <Typography variant="caption" sx={{color: 'text.secondary'}}>
                Stock price per day for the past 3 months
              </Typography>
            </Stack>
            <LineChart
              colors={[theme.palette.primary.main]}
              xAxis={[
                {
                  scaleType: 'point',
                  data: getDaysInDateRange(new Date(2024, 3, 1), new Date(2024, 6, 1)),
                  tickInterval: (_, i) => (i + 1) % 5 === 0,
                },
              ]}
              yAxis={[
                {
                  id: 'price',
                  valueFormatter: (value: string) => Formatter.formatBalance(Number(value)),
                },
              ]}
              series={[
                {
                  id: 'price',
                  label: '$SIE',
                  showMark: false,
                  curve: 'linear',
                  stack: 'total',
                  area: true,
                  stackOrder: 'ascending',
                  data: [
                    123.46, 124.12, 122.98, 125.67, 124.45, 126.78, 127.89, 126.34, 128.9, 127.56, 129.01, 130.12,
                    129.45, 131.23, 132.34, 131.78, 133.45, 134.56, 133.89, 135.67, 136.78, 135.23, 137.89, 138.9,
                    137.45, 139.01, 140.12, 138.89, 141.23, 142.34, 141.67, 143.45, 144.56, 143.12, 145.67, 146.78,
                    145.34, 147.89, 148.9, 147.56, 149.01, 150.12, 149.45, 151.23, 152.34, 151.78, 153.45, 154.56,
                    153.89, 155.67, 156.78, 155.23, 157.89, 158.9, 157.45, 159.01, 160.12, 158.89, 161.23, 162.34,
                    161.67, 163.45, 164.56, 163.12, 165.67, 166.78, 165.34, 167.89, 168.9, 167.56, 169.01, 170.12,
                    169.45, 171.23, 172.34, 171.78, 173.45, 174.56, 173.89, 175.67, 176.78, 175.23, 177.89, 178.9,
                    177.45, 179.01, 180.12, 178.89, 181.23, 182.34, 181.67, 183.45,
                  ],
                  valueFormatter: value => Formatter.formatBalance(value ?? 0),
                },
              ]}
              height={250}
              margin={{left: 60, right: 0, top: 20, bottom: 20}}
              grid={{horizontal: true}}
              sx={{
                '& .MuiAreaElement-series-price': {
                  fill: "url('#price')",
                },
              }}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}>
              <AreaGradient color={theme.palette.primary.main} id="price" />
            </LineChart>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12, md: 6}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Siemens AG Financials
            </Typography>
            <Stack sx={{justifyContent: 'space-between'}}>
              <Stack
                direction="row"
                sx={{
                  alignContent: {xs: 'center', sm: 'flex-start'},
                  alignItems: 'center',
                  gap: 1,
                }}>
                <Typography variant="h4" component="p">
                  1.3M
                </Typography>
                <Chip size="small" color="error" label="-8%" />
              </Stack>
              <Typography variant="caption" sx={{color: 'text.secondary'}}>
                Page views and downloads for the last 12 months
              </Typography>
            </Stack>
            <BarChart
              borderRadius={8}
              colors={[theme.palette.primary.light, theme.palette.primary.main, theme.palette.primary.dark]}
              xAxis={[
                {
                  scaleType: 'band',
                  data: ['2019', '2020', '2021', '2022', '2023'],
                },
              ]}
              yAxis={[
                {
                  valueFormatter: value => Formatter.shortenNumber(value ?? 0),
                },
              ]}
              series={[
                {
                  data: [58483000000, 60000000000, 62000000000, 64000000000, 66000000000],
                  valueFormatter: value => Formatter.shortenNumber(value ?? 0),
                  label: 'Revenue (Eur)',
                },
                {
                  data: [21634000000, 22000000000, 22500000000, 23000000000, 23500000000],
                  valueFormatter: value => Formatter.shortenNumber(value ?? 0),
                  label: 'Gross profit (Eur)',
                },
                {
                  data: [8173000000, 8500000000, 8700000000, 8900000000, 9100000000],
                  valueFormatter: value => Formatter.shortenNumber(value ?? 0),
                  label: 'EBITDA (Eur)',
                },
                {
                  data: [5174000000, 5300000000, 5400000000, 5500000000, 5600000000],
                  valueFormatter: value => Formatter.shortenNumber(value ?? 0),
                  label: 'Net profit (Eur)',
                },
              ]}
              height={250}
              margin={{left: 80, right: 0, top: 20, bottom: 20}}
              grid={{horizontal: true}}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12}}>
        <Typography variant="h6">Stock allocation</Typography>
      </Grid2>
      <Grid2 size={{xs: 12, md: 4}}>
        <Card variant="outlined" sx={{display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Allocated positions
            </Typography>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <PieChart
                colors={[
                  theme.palette.grey['50'],
                  theme.palette.grey['100'],
                  theme.palette.grey['200'],
                  theme.palette.grey['300'],
                  theme.palette.grey['400'],
                ]}
                margin={{
                  left: 80,
                  right: 80,
                  top: 80,
                  bottom: 80,
                }}
                series={[
                  {
                    data: [
                      {label: '$SIE', value: 50000},
                      {label: '$RHM', value: 50000},
                      {label: '$13M', value: 50000},
                      {label: '$ALV', value: 50000},
                      {label: '$NVDA', value: 50000},
                    ],
                    valueFormatter: value => Formatter.formatBalance(value.value),
                    innerRadius: 60,
                    outerRadius: 100,
                    paddingAngle: 1,
                    cornerRadius: 5,
                    highlightScope: {faded: 'global', highlighted: 'item'},
                  },
                ]}
                height={260}
                width={260}
                slotProps={{
                  legend: {hidden: true},
                }}>
                <PieCenterLabel primaryText="98.5K" secondaryText="Total" />
              </PieChart>
            </Box>
            {[
              {name: '$SIE', value: (50000 * 100) / 250000, color: theme.palette.grey['50']},
              {name: '$RHM', value: (50000 * 100) / 250000, color: theme.palette.grey['100']},
              {name: '$13M', value: (50000 * 100) / 250000, color: theme.palette.grey['200']},
              {name: '$ALV', value: (50000 * 100) / 250000, color: theme.palette.grey['300']},
              {name: '$NVDA', value: (50000 * 100) / 250000, color: theme.palette.grey['400']},
            ].map((country, index) => (
              <Stack key={index} direction="row" sx={{alignItems: 'center', gap: 2, pb: 2}}>
                {/* {country.flag} */}
                <Stack sx={{gap: 1, flexGrow: 1}}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                    <Typography variant="body2" sx={{fontWeight: '500'}}>
                      {country.name}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                      {country.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    aria-label="Number of users by country"
                    value={country.value}
                    sx={{
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: country.color,
                      },
                    }}
                  />
                </Stack>
              </Stack>
            ))}
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12, md: 4}}>
        <Card variant="outlined" sx={{display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Stocks by country
            </Typography>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <PieChart
                colors={['hsl(220, 20%, 65%)', 'hsl(220, 20%, 42%)', 'hsl(220, 20%, 35%)', 'hsl(220, 20%, 25%)']}
                margin={{
                  left: 80,
                  right: 80,
                  top: 80,
                  bottom: 80,
                }}
                series={[
                  {
                    data: [
                      {label: 'India', value: 50000},
                      {label: 'USA', value: 35000},
                      {label: 'Brazil', value: 10000},
                      {label: 'Other', value: 5000},
                    ],
                    innerRadius: 75,
                    outerRadius: 100,
                    paddingAngle: 1,
                    cornerRadius: 5,
                    highlightScope: {faded: 'global', highlighted: 'item'},
                  },
                ]}
                height={260}
                width={260}
                slotProps={{
                  legend: {hidden: true},
                }}>
                <PieCenterLabel primaryText="98.5K" secondaryText="Total" />
              </PieChart>
            </Box>
            {[
              {
                name: 'India',
                value: 50,
                // flag: <IndiaFlag />,
                color: 'hsl(220, 25%, 65%)',
              },
              {
                name: 'USA',
                value: 35,
                // flag: <UsaFlag />,
                color: 'hsl(220, 25%, 45%)',
              },
              {
                name: 'Brazil',
                value: 10,
                // flag: <BrazilFlag />,
                color: 'hsl(220, 25%, 30%)',
              },
              {
                name: 'Other',
                value: 5,
                // flag: <GlobeFlag />,
                color: 'hsl(220, 25%, 20%)',
              },
            ].map((country, index) => (
              <Stack key={index} direction="row" sx={{alignItems: 'center', gap: 2, pb: 2}}>
                {/* {country.flag} */}
                <Stack sx={{gap: 1, flexGrow: 1}}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                    <Typography variant="body2" sx={{fontWeight: '500'}}>
                      {country.name}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                      {country.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    aria-label="Number of users by country"
                    value={country.value}
                    sx={{
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: country.color,
                      },
                    }}
                  />
                </Stack>
              </Stack>
            ))}
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12, md: 4}}>
        <Card variant="outlined" sx={{width: '100%'}}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Rating
            </Typography>
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <Gauge
                width={250}
                height={250}
                value={75}
                startAngle={-110}
                endAngle={110}
                cornerRadius={5}
                sx={{
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: 30,
                    transform: 'translate(0px, -10px)',
                  },
                }}
                text={({value, valueMax}) => `${value} / ${valueMax}`}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{xs: 12}}>
        <Typography variant="h6">Related stocks</Typography>
      </Grid2>
      {(
        [
          {name: 'Siemens AG', trend: 'up'},
          {name: 'Tesla', trend: 'down'},
          {name: 'Volkswagen', trend: 'neutral'},
          {name: 'Porsche AG', trend: 'up'},
          {name: 'Skoda', trend: 'down'},
          {name: 'Daimler AG', trend: 'neutral'},
        ] as {name: string; trend: keyof typeof trendColors}[]
      ).map((stock, idx, arr) => (
        <Grid2 key={'related-stock-' + idx} size={{xs: 6, md: 12 / arr.length}}>
          <Card variant="outlined" sx={{p: 0}}>
            <Stack flexDirection={'row'} alignItems={'center'} columnGap={AppConfig.baseSpacing / 2} sx={{m: 2, mb: 1}}>
              <Skeleton variant="rounded" width={32} height={32} />
              <Typography variant="subtitle1" noWrap>
                {stock.name}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                color={stock.trend === 'up' ? 'success' : stock.trend === 'down' ? 'error' : 'secondary'}
                label="-8%"
              />
            </Stack>

            <SparkLineChart
              colors={[trendColors[stock.trend]]}
              data={sparklineData}
              area
              showHighlight
              valueFormatter={value => Formatter.formatBalance(value ?? 0)}
              height={60}
              showTooltip
              xAxis={{
                scaleType: 'band',
                data: daysInMonth, // Use the correct property 'data' for xAxis
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${stock.name})`,
                },
              }}>
              <SparklineAreaGradient color={trendColors[stock.trend]} id={`area-gradient-${stock.name}`} />
            </SparkLineChart>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default withUnauthentificatedLayout(ChartsRoute);

function SparklineAreaGradient({color, id}: {color: string; id: string}) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function AreaGradient({color, id}: {color: string; id: string}) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function getDaysInMonth(month: number, year: number): string[] {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function getDaysInDateRange(start: Date, end: Date): string[] {
  const days = [];
  let currentDate = new Date(start);
  while (currentDate <= end) {
    days.push(currentDate.toLocaleDateString('en-US', {day: 'numeric', month: 'short'}));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
}

interface StyledTextProps {
  variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
  shouldForwardProp: prop => prop !== 'variant',
})<StyledTextProps>(({theme}) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: theme.palette.text.secondary,
  variants: [
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
      },
    },
    {
      props: ({variant}) => variant !== 'primary',
      style: {
        fontSize: theme.typography.body2.fontSize,
      },
    },
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({variant}) => variant !== 'primary',
      style: {
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({primaryText, secondaryText}: PieCenterLabelProps) {
  const {width, height, left, top} = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}
