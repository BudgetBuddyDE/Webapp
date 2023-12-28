import React from 'react';
import { ActionPaper, Card, NoResults } from '@/components/Base';
import { Box, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { format, isSameDay, subDays } from 'date-fns';
import { EDailyTransactionType, TDailyTransaction } from '@budgetbuddyde/types';
import { DATE_RANGE_INPUT_FORMAT } from '@/routes/Budget.route';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useScreenSize } from '@/hooks';
import { ParentSize } from '@visx/responsive';
import { BarChart, TBarChartData } from '@/components/Base/Charts/BarChart.component';
import { useAuthContext } from '@/core/Auth';
import { useDailyTransactionStore } from '../DailyTransaction.store';
import { TransactionService } from '../Transaction.service';
import { CircularProgress } from '@/components/Loading';
import { formatBalance } from '@/utils';

export interface IDailyTransactionChartHandler {
  onStartDateChange: (startDate: Date | null) => void;
  onEndDateChange: (endDate: Date | null) => void;
  onHoverAboveDailyTransaction: (bar: TBarChartData | null) => void;
}

export type TDailyTransactionChart = {};

export const DailyTransactionChart: React.FC<TDailyTransactionChart> = () => {
  const screenSize = useScreenSize();
  const { session, authOptions } = useAuthContext();
  const { INCOME, SPENDINGS, setFetchedData } = useDailyTransactionStore();
  const [loading, setLoading] = React.useState(true);
  const [chartContent, setChartContent] = React.useState<EDailyTransactionType>(
    EDailyTransactionType.SPENDINGS
  );
  const [dateRange, setDateRange] = React.useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [selectedTransaction, setSelectedTransaction] = React.useState<TDailyTransaction | null>(
    null
  );

  const selectedData: TDailyTransaction[] = React.useMemo(() => {
    if (chartContent === EDailyTransactionType.INCOME) {
      return INCOME;
    } else if (chartContent === EDailyTransactionType.SPENDINGS) {
      return SPENDINGS;
    }

    return [];
  }, [chartContent, INCOME, SPENDINGS]);

  const handler: IDailyTransactionChartHandler = {
    onStartDateChange(startDate) {
      if (!startDate) return;
      setDateRange((prev) => ({ ...prev, startDate: startDate }));
    },
    onEndDateChange(endDate) {
      if (!endDate) return;
      setDateRange((prev) => ({ ...prev, endDate: endDate }));
    },
    onHoverAboveDailyTransaction(dailyTransaction) {
      if (!dailyTransaction) {
        setSelectedTransaction(
          selectedData[selectedData.length - 1] || { date: new Date(), amount: 0 }
        );
        return;
      }

      setSelectedTransaction({
        date: new Date(dailyTransaction.label),
        amount: dailyTransaction.value,
      });
    },
  };

  React.useEffect(() => {
    if (!session) return;
    setLoading(true);
    TransactionService.getDailyTransactions(
      dateRange.startDate,
      dateRange.endDate,
      chartContent,
      authOptions
    )
      .then(([dailyTransactions, error]) => {
        if (error || !dailyTransactions) return;
        setFetchedData(chartContent, dailyTransactions, session.uuid);
        if (dailyTransactions.length > 0) {
          const row = dailyTransactions[dailyTransactions.length - 1];
          handler.onHoverAboveDailyTransaction({ label: row!.date.toString(), value: row!.amount });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange, chartContent]);

  return (
    <Card>
      <Card.Header sx={{ mb: 2 }}>
        <Box>
          <Card.Title>Transactions</Card.Title>
          <Card.Subtitle>Your category statistics</Card.Subtitle>
        </Box>

        <Card.HeaderActions>
          <ActionPaper>
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={chartContent}
              onChange={(event: React.BaseSyntheticEvent) => setChartContent(event.target.value)}
              exclusive
            >
              <ToggleButton value={EDailyTransactionType.SPENDINGS}>Spendings</ToggleButton>
              <ToggleButton value={EDailyTransactionType.INCOME}>Income</ToggleButton>
            </ToggleButtonGroup>
          </ActionPaper>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Header>
        <Box>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {screenSize === 'small' ? (
              <MobileDatePicker
                label="From"
                inputFormat={DATE_RANGE_INPUT_FORMAT}
                value={dateRange.startDate}
                onChange={handler.onStartDateChange}
                renderInput={(params) => (
                  <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                )}
              />
            ) : (
              <DesktopDatePicker
                label="From"
                inputFormat={DATE_RANGE_INPUT_FORMAT}
                value={dateRange.startDate}
                onChange={handler.onStartDateChange}
                renderInput={(params) => (
                  <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                )}
              />
            )}

            {screenSize === 'small' ? (
              <MobileDatePicker
                label="To"
                inputFormat={DATE_RANGE_INPUT_FORMAT}
                value={dateRange.endDate}
                onChange={handler.onEndDateChange}
                renderInput={(params) => (
                  <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                )}
              />
            ) : (
              <DesktopDatePicker
                label="To"
                inputFormat={DATE_RANGE_INPUT_FORMAT}
                value={dateRange.endDate}
                onChange={handler.onEndDateChange}
                renderInput={(params) => (
                  <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                )}
              />
            )}
          </LocalizationProvider>
        </Box>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <CircularProgress />
        ) : selectedData.length > 0 ? (
          <Paper elevation={0} sx={{ mt: '1rem' }}>
            {selectedTransaction && (
              <Box sx={{ ml: 2, mt: 1 }}>
                <Typography variant="caption">
                  {isSameDay(selectedTransaction.date, new Date())
                    ? 'Today'
                    : format(selectedTransaction.date, 'dd.MM.yy')}
                </Typography>
                <Typography variant="subtitle1">
                  {formatBalance(Math.abs(selectedTransaction.amount))}
                </Typography>
              </Box>
            )}
            <ParentSize>
              {({ width }) => (
                <BarChart
                  width={width}
                  height={width * 0.6}
                  data={selectedData.map(({ amount, date }) => ({
                    label: date.toString(),
                    value: Math.abs(amount),
                  }))}
                  onEvent={handler.onHoverAboveDailyTransaction}
                  events
                />
              )}
            </ParentSize>
          </Paper>
        ) : (
          <NoResults sx={{ mt: 2 }} text="Nothing was returned" />
        )}
      </Card.Body>
    </Card>
  );
};
