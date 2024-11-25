import {ExpandMoreRounded} from '@mui/icons-material';
import {Accordion, AccordionDetails, AccordionSummary, Box, Tab, Tabs, Typography} from '@mui/material';
import React from 'react';

import {BarChart, type TBarChartProps} from '@/components/Base/Charts';
import {StockService} from '@/features/Stocks/StockService';
import {Formatter} from '@/services/Formatter';

import {EFinancialStatementTimeframe} from '../FinancialStatementAccordion.component';

export type TFinancialStatementProps = {
  barChartProps?: Partial<TBarChartProps>;
  stockDetails: Awaited<ReturnType<typeof StockService.getAssetDetails>>[0];
  seriesFormatter: (value: number | null) => string;
};

export const FinancialStatement: React.FC<TFinancialStatementProps> = ({
  barChartProps,
  stockDetails,
  seriesFormatter,
}) => {
  const [timeframe, setTimeframe] = React.useState(EFinancialStatementTimeframe.Yearly);

  const currency = React.useMemo(() => stockDetails?.details.securityDetails?.currency, [stockDetails]);
  const chartData = React.useMemo(() => {
    return (
      stockDetails?.details.securityDetails?.[
        timeframe === EFinancialStatementTimeframe.Yearly ? 'annualFinancials' : 'quarterlyFinancials'
      ].reverse() || []
    );
  }, [stockDetails, timeframe]);

  if (chartData.length === 0) return null;
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreRounded />}>
        <Typography variant="subtitle1" fontWeight={'bold'}>
          Financial Statements
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{px: 0}}>
        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
          <Tabs value={timeframe} onChange={(_, value) => setTimeframe(value)} sx={{mx: 2}}>
            <Tab label="Yearly" value={EFinancialStatementTimeframe.Yearly} />
            <Tab label="Quarterly" value={EFinancialStatementTimeframe.Quarterly} />
          </Tabs>
        </Box>
        <Box>
          <BarChart
            {...barChartProps}
            xAxis={[
              {
                scaleType: 'band',
                data: chartData.map(({date}) =>
                  timeframe === EFinancialStatementTimeframe.Yearly
                    ? date.getFullYear()
                    : `${Formatter.formatDate().shortMonthName(date)} ${date.getFullYear()}`,
                ),
                valueFormatter: value => value.toString(),
              },
            ]}
            series={[
              {
                label: `Revenue (${currency})`,
                data: chartData.map(({revenue}) => revenue),
                valueFormatter: seriesFormatter,
              },
              {
                label: `Gross Profit (${currency})`,
                data: chartData.map(({grossProfit}) => grossProfit),
                valueFormatter: seriesFormatter,
              },
              {
                label: `EBITDA (${currency})`,
                data: chartData.map(({ebitda}) => ebitda),
                valueFormatter: seriesFormatter,
              },
              {
                label: `Net Profit (${currency})`,
                data: chartData.map(({netIncome}) => netIncome),
                valueFormatter: seriesFormatter,
              },
            ]}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
