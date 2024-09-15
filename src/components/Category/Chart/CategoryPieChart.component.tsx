import {type TTransaction} from '@budgetbuddyde/types';
import {Box, Button, Stack, ToggleButton, ToggleButtonGroup} from '@mui/material';
import {PieChart} from '@mui/x-charts/PieChart';
import {isSameMonth, isSameYear} from 'date-fns';
import React from 'react';
import {Link} from 'react-router-dom';

import {Card, NoResults, TPieChartData} from '@/components/Base';
import {PieCenterLabel} from '@/routes/Charts.route';
import {Formatter} from '@/services/Formatter.service';

export type TCategoryPieChartTimeframe = 'MONTH' | 'YTD' | 'ALL_TIME';

export type TCategoryPieChartTransactionType = 'INCOME' | 'EXPENSE';

export const CATEGORY_PIE_CHART_TIMEFRAMES: readonly {type: TCategoryPieChartTimeframe; text: string}[] = [
  {
    type: 'MONTH',
    text: 'Month',
  },
  {
    type: 'YTD',
    text: 'YTD',
  },
  {
    type: 'ALL_TIME',
    text: 'All Time',
  },
];

export type TCategoryPieChartProps = {
  title: string;
  subtitle?: string;
  defaultTimeframe?: TCategoryPieChartTimeframe;
  transactionsType: TCategoryPieChartTransactionType;
  transactions: TTransaction[];
  withViewMore?: boolean;
};

/**
 * Renders a pie chart component for displaying category data.
 *
 * @component
 * @example
 * ```tsx
 * <CategoryPieChart
 *   title="Category Chart"
 *   subtitle="Monthly Expenses"
 *   defaultTimeframe="MONTH"
 *   transactionsType="EXPENSE"
 *   transactions={transactionData}
 * />
 * ```
 *
 * @returns {React.FC<TCategoryPieChartProps>} The rendered CategoryPieChart component.
 */
export const CategoryPieChart: React.FC<TCategoryPieChartProps> = ({
  title,
  subtitle,
  defaultTimeframe = 'MONTH',
  transactionsType,
  transactions,
  withViewMore = false,
}) => {
  const [currentTimeframe, setCurrentTimeframe] = React.useState<TCategoryPieChartTimeframe>(defaultTimeframe);

  const currentChartData: TPieChartData[] = React.useMemo(() => {
    const now = new Date();
    const sumByCategory = new Map<string, number>();

    const isValidTransaction = ({transfer_amount, processed_at}: TTransaction) => {
      const isCorrectType = transactionsType === 'INCOME' ? transfer_amount > 0 : transfer_amount < 0;
      const isInTimeframe = (() => {
        switch (currentTimeframe) {
          case 'MONTH':
            return isSameMonth(processed_at, now);
          case 'YTD':
            return isSameYear(processed_at, now);
          case 'ALL_TIME':
            return true;
          default:
            return false;
        }
      })();

      return isCorrectType && isInTimeframe;
    };

    const filteredTransactions = transactions.filter(isValidTransaction);

    for (const {
      expand: {
        category: {name},
      },
      transfer_amount,
    } of filteredTransactions) {
      const currAmount = sumByCategory.get(name);
      if (currAmount) {
        sumByCategory.set(name, currAmount + Math.abs(transfer_amount));
      } else sumByCategory.set(name, Math.abs(transfer_amount));
    }

    return Array.from(sumByCategory.entries()).map(
      ([category, amount]) =>
        ({
          label: category,
          value: amount,
        }) as TPieChartData,
    );
  }, [transactions, transactionsType, currentTimeframe]);

  const onChangeCurrentTimeframe = React.useCallback((event: React.BaseSyntheticEvent) => {
    setCurrentTimeframe(event.target.value);
  }, []);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>{title}</Card.Title>
          {subtitle !== undefined && Boolean(subtitle) && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        </Box>
        <Card.HeaderActions sx={{display: 'flex', flexDirection: 'row'}}>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={currentTimeframe}
            onChange={onChangeCurrentTimeframe}
            exclusive>
            {CATEGORY_PIE_CHART_TIMEFRAMES.map(button => (
              <ToggleButton key={button.type} value={button.type}>
                {button.text}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body>
        {currentChartData.length > 0 ? (
          <PieChart
            series={[
              {
                data: currentChartData,
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
              primaryText={Formatter.formatBalance(currentChartData.reduceRight((prev, curr) => prev + curr.value, 0))}
              secondaryText="Total"
            />
          </PieChart>
        ) : (
          <NoResults text={getNoResultsMessage(currentTimeframe)} sx={{m: 2}} />
        )}
      </Card.Body>
      {withViewMore && (
        <Card.Footer sx={{mt: 2}}>
          <Stack direction="row" justifyContent={'flex-end'}>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/*@ts-expect-error*/}
            <Button LinkComponent={Link} to="/transactions">
              View more...
            </Button>
          </Stack>
        </Card.Footer>
      )}
    </Card>
  );
};

/**
 * Returns the appropriate "no results" message based on the given timeframe.
 *
 * @param timeframe - The timeframe for which the message is generated.
 * @returns The "no results" message.
 */
export function getNoResultsMessage(timeframe: TCategoryPieChartTimeframe): string {
  switch (timeframe) {
    case 'MONTH':
      return 'There are no transactions for this month!';
    case 'YTD':
      return 'There are no transactions for this year!';
    case 'ALL_TIME':
      return 'There are no transactions for all time!';
  }
}
