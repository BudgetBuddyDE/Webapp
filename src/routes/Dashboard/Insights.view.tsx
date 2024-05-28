import {type TCategory, type TTransaction} from '@budgetbuddyde/types';
import {CloudDownloadRounded} from '@mui/icons-material';
import {Autocomplete, Box, Button, CircularProgress, TextField, Typography, useTheme} from '@mui/material';
import {format, subMonths} from 'date-fns';
import React from 'react';
import Chart from 'react-apexcharts';
import {useNavigate} from 'react-router-dom';

import {
  ActionPaper,
  DateRange,
  FullScreenDialog,
  StyledAutocompleteOption,
  type TDateRange,
  type TFullScreenDialogProps,
} from '@/components/Base';
import {useFetchCategories} from '@/components/Category';
import {useFetchTransactions} from '@/components/Transaction';
import {useKeyPress} from '@/hooks/useKeyPress.hook.ts';
import {Formatter} from '@/services';
import {downloadAsJson} from '@/utils';

export type TInsightsViewProps =
  | {navigateOnClose: true; navigateTo: string}
  | ({navigateOnClose: false} & Pick<TFullScreenDialogProps, 'onClose'>);

export const InsightsView: React.FC<TInsightsViewProps> = props => {
  const theme = useTheme();
  const navigate = useNavigate();
  const autocompleteRef = React.useRef<HTMLInputElement | null>(null);
  const {loading: loadingCategories, categories} = useFetchCategories();
  const {loading: loadingTransactions, transactions} = useFetchTransactions();
  const [dateRange, setDateRange] = React.useState<TDateRange>({
    startDate: subMonths(new Date(), 12),
    endDate: new Date(),
  });
  const [selectedCategories, setSelectedCategories] = React.useState<{label: string; value: TCategory['id']}[]>([]);
  useKeyPress(
    ['k'],
    e => {
      e.preventDefault();
      if (autocompleteRef.current) {
        // FIXME: This is not working
        // if (document.activeElement === autocompleteRef.current) {
        //   document.activeElement.blur();
        // }

        autocompleteRef.current.focus();
      }
    },
    null,
    true,
  );

  const filterOptions = React.useMemo(() => {
    return categories.map(({id, name}) => ({label: name, value: id}));
  }, [categories]);

  const dateRangeLabels: string[] = React.useMemo(() => {
    const labels: string[] = [];
    let tempDate = new Date(dateRange.startDate);
    while (tempDate <= dateRange.endDate) {
      labels.push(format(tempDate, 'yyyy-MM'));
      tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1);
    }
    return labels;
  }, [dateRange]);

  const chartData: {name: string; data: number[]}[] = React.useMemo(() => {
    const relevantTransactions: TTransaction[] = transactions
      // currently only interested in expenses
      .filter(({transfer_amount}) => transfer_amount < 0)
      // determine if transaction is within date range
      .filter(({processed_at}) => processed_at >= dateRange.startDate && processed_at <= dateRange.endDate)
      // determine if transaction is within selected categories
      .filter(
        ({
          expand: {
            category: {id},
          },
        }) => selectedCategories.some(({value}) => value === id),
      );

    const stats: Map<TCategory['id'], {name: string; data: Map<string, number>}> = new Map();
    for (const {
      processed_at,
      expand: {
        category: {id: categoryId, name: categoryName},
      },
      transfer_amount,
    } of relevantTransactions) {
      const dateKey = format(processed_at, 'yyyy-MM');
      if (stats.has(categoryId)) {
        const {data} = stats.get(categoryId)!;

        if (data.has(dateKey)) {
          const sum = data.get(dateKey)!;
          data.set(dateKey, sum + Math.abs(transfer_amount));
        } else {
          data.set(dateKey, Math.abs(transfer_amount));
        }
      } else {
        stats.set(categoryId, {name: categoryName, data: new Map([[dateKey, Math.abs(transfer_amount)]])});
      }
    }

    // Ensure every month has a value for each category
    for (const [, {data}] of stats) {
      for (const label of dateRangeLabels) {
        if (!data.has(label)) {
          data.set(label, 0);
        }
      }
    }

    // Now transform map to chart data
    return Array.from(stats).map(([, {name, data}]) => ({
      name,
      data: dateRangeLabels.map(label => data.get(label) ?? 0),
    }));
  }, [categories, transactions, dateRange, dateRangeLabels, selectedCategories]);

  const handleClose = () => {
    if (props.navigateOnClose) {
      navigate(props.navigateTo);
    } else props.onClose();
  };

  return (
    <FullScreenDialog
      title={'Insights'}
      open={true}
      onClose={handleClose}
      boxProps={{sx: {display: 'flex', flexDirection: 'column', flex: 1}}}>
      {loadingCategories || loadingTransactions ? (
        <Box sx={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <CircularProgress />
        </Box>
      ) : (
        <React.Fragment>
          <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
            <Box sx={{display: 'flex', flexDirection: 'row', flex: 1}}>
              <Autocomplete
                sx={{width: {xs: '100%', sm: '30%'}, maxWidth: {xs: 'unset', sm: '500px'}, mb: {xs: 2, sm: 0}}}
                renderInput={params => (
                  <TextField
                    {...params}
                    inputRef={input => {
                      autocompleteRef.current = input;
                    }}
                    label="Categories"
                    placeholder={'Select categories'}
                  />
                )}
                onChange={(_event, value) => setSelectedCategories(value)}
                value={selectedCategories}
                options={filterOptions}
                renderOption={(props, option, {selected}) => (
                  <StyledAutocompleteOption {...props} selected={selected}>
                    {option.label}
                  </StyledAutocompleteOption>
                )}
                disableCloseOnSelect
                multiple
              />

              {chartData.length > 0 && (
                <Button
                  sx={{ml: 2, px: 2}}
                  startIcon={<CloudDownloadRounded />}
                  onClick={() => {
                    downloadAsJson(chartData, `bb_category_analytics_${format(new Date(), 'yyyy_mm_dd')}`);
                  }}>
                  Export
                </Button>
              )}
            </Box>

            <Box>
              <DateRange
                defaultStartDate={dateRange.startDate}
                defaultEndDate={dateRange.endDate}
                onDateChange={setDateRange}
              />
            </Box>
          </Box>

          <Box sx={{flex: 1, mt: 2}}>
            {selectedCategories.length > 0 && chartData.length > 0 ? (
              <Chart
                type={'bar'}
                with={'100%'}
                height={'99.99%'}
                series={chartData}
                options={{
                  chart: {
                    type: 'bar',
                    toolbar: {
                      show: false,
                    },
                  },
                  xaxis: {
                    labels: {
                      style: {
                        colors: theme.palette.text.primary,
                      },
                    },
                    categories: dateRangeLabels.map(dateStr => {
                      const date = new Date(dateStr);
                      return `${Formatter.formatDate().shortMonthName(date)} ${date.getFullYear()}`;
                    }),
                  },
                  dataLabels: {
                    enabled: false,
                  },
                  grid: {
                    borderColor: theme.palette.action.disabled,
                    strokeDashArray: 5,
                  },
                  yaxis: {
                    forceNiceScale: true,
                    opposite: true,
                    labels: {
                      style: {
                        colors: theme.palette.text.primary,
                      },
                      formatter(val: number) {
                        return Formatter.formatBalance(val);
                      },
                    },
                  },
                  legend: {
                    position: 'bottom',
                    horizontalAlign: 'left',
                    labels: {
                      colors: 'white',
                    },
                  },
                  tooltip: {
                    theme: 'dark',
                    y: {
                      formatter(val: number) {
                        return Formatter.formatBalance(val);
                      },
                    },
                  },
                }}
              />
            ) : (
              <ActionPaper
                sx={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  p: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Typography variant={'h1'} textAlign={'center'}>
                  {selectedCategories.length === 0 ? 'No categories selected' : 'No data available'}
                </Typography>
              </ActionPaper>
            )}
          </Box>
        </React.Fragment>
      )}
    </FullScreenDialog>
  );
};

export default InsightsView;
