import {type TCategory, type TTransaction} from '@budgetbuddyde/types';
import {CloudDownloadRounded} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {format, subMonths} from 'date-fns';
import React from 'react';
import Chart from 'react-apexcharts';
import {useNavigate} from 'react-router-dom';

import {AppConfig} from '@/app.config';
import {
  ActionPaper,
  Card,
  DateRange,
  FullScreenDialog,
  StyledAutocompleteOption,
  type TDateRange,
  type TFullScreenDialogProps,
} from '@/components/Base';
import {useCategories} from '@/components/Category';
import {DesktopFeatureOnly} from '@/components/DesktopFeatureOnly';
import {useTransactions} from '@/components/Transaction';
import {useDocumentTitle, useFullscreen, useScreenSize} from '@/hooks';
import {useKeyPress} from '@/hooks/useKeyPress.hook.ts';
import {Formatter} from '@/services';
import {downloadAsJson} from '@/utils';

export type TInsightsViewProps =
  | {navigateOnClose: true; navigateTo?: string}
  | ({navigateOnClose: false} & Pick<TFullScreenDialogProps, 'onClose'>);

export const InsightsView: React.FC<TInsightsViewProps> = props => {
  useDocumentTitle(`${AppConfig.appName} - Insights`, true);
  const theme = useTheme();
  const navigate = useNavigate();
  const screenSize = useScreenSize();
  const {toggle: toggleFullscreen, fullscreen: isFullscreen} = useFullscreen();
  const autocompleteRef = React.useRef<HTMLInputElement | null>(null);
  const {isLoading: isLoadingCategories, data: categories} = useCategories();
  const {isLoading: isLoadingTransactions, data: transactions} = useTransactions();
  const [options, setOptions] = React.useState<{view: 'INCOME' | 'SPENDINGS'; showStats: boolean}>({
    view: 'SPENDINGS',
    showStats: false,
  });
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
    if (!categories) return [];
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
    const relevantTransactions: TTransaction[] = (transactions ?? [])
      // currently only interested in expenses
      .filter(({transfer_amount}) => (options.view === 'SPENDINGS' ? transfer_amount < 0 : transfer_amount > 0))
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
  }, [options.view, categories, transactions, dateRange, dateRangeLabels, selectedCategories]);

  const stats = React.useMemo(() => {
    if (!options.showStats) return [];
    return chartData.map(({name, data}) => {
      const total = data.reduce((acc, val) => acc + val, 0);
      return {
        name,
        total,
        average: total / data.length,
      };
    });
  }, [chartData, options.showStats]);

  const handleClose = () => {
    if (props.navigateOnClose) {
      props.navigateTo ? navigate(props.navigateTo) : navigate(-1);
    } else props.onClose();
  };

  React.useEffect(() => {
    if (!isFullscreen) toggleFullscreen();

    return () => {
      if (isFullscreen) toggleFullscreen();
    };
  }, [isFullscreen]);

  return (
    <FullScreenDialog
      title={'Insights'}
      open={true}
      onClose={handleClose}
      boxProps={{sx: {display: 'flex', flexDirection: 'column', flex: 1}}}>
      {/* // TODO: Add tests that check that the chart is only displayed on larger devices */}
      {screenSize !== 'small' ? (
        isLoadingCategories || isLoadingTransactions ? (
          <Box sx={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <CircularProgress />
          </Box>
        ) : (
          <React.Fragment>
            <Stack>
              <Stack flexDirection={'row'} flexWrap={'wrap'}>
                <Stack flex={1} flexDirection={'row'}>
                  <Autocomplete
                    sx={{width: {xs: '100%', sm: '50%'}, maxWidth: {xs: 'unset', sm: '500px'}, mb: {xs: 2, sm: 0}}}
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
                </Stack>

                <Box>
                  <DateRange
                    defaultStartDate={dateRange.startDate}
                    defaultEndDate={dateRange.endDate}
                    onDateChange={setDateRange}
                  />
                </Box>
              </Stack>

              <Stack columnGap={AppConfig.baseSpacing} sx={{flex: 1, flexDirection: 'row', mt: 2}}>
                <ActionPaper sx={{width: 'min-content'}}>
                  <ToggleButtonGroup
                    size="small"
                    color="primary"
                    value={options.view}
                    onChange={(_, value) => setOptions(prev => ({...prev, view: value}))}
                    exclusive>
                    {[
                      {name: 'Insome', value: 'INCOME'},
                      {name: 'Spendings', value: 'SPENDINGS'},
                    ].map(({name, value}) => (
                      <ToggleButton key={name.toLowerCase()} value={value}>
                        {name}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </ActionPaper>

                {chartData.length > 0 && (
                  <Button
                    sx={{px: 2}}
                    startIcon={<CloudDownloadRounded />}
                    onClick={() => {
                      downloadAsJson(chartData, `bb_category_analytics_${format(new Date(), 'yyyy_mm_dd')}`);
                    }}>
                    Export
                  </Button>
                )}

                <FormControlLabel
                  control={<Checkbox />}
                  onChange={(_, checked) => setOptions(prev => ({...prev, showStats: checked}))}
                  label="Show stats"
                />
              </Stack>
            </Stack>

            <Box sx={{flex: 1, mt: 2}}>
              {selectedCategories.length > 0 && chartData.length > 0 ? (
                <Grid container spacing={AppConfig.baseSpacing} sx={{height: '100%'}}>
                  <Grid item md={options.showStats ? 10 : 12} sx={{height: 'inherit'}}>
                    <Chart
                      type={'line'}
                      width={'100%'}
                      height={'99.99%'}
                      series={chartData.flatMap(({name, data}) => ({name, data, type: 'bar'}))}
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
                  </Grid>

                  <Grid item md={options.showStats ? 2 : 0} sx={{display: options.showStats ? 'unset' : 'none'}}>
                    <Card sx={{p: 0}}>
                      <Card.Header sx={{px: 2, pt: 2}}>
                        <Card.Title>Stats</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <List dense>
                          {selectedCategories.length > 1 && (
                            <React.Fragment>
                              <ListItem
                                secondaryAction={
                                  <Stack textAlign={'right'}>
                                    <Tooltip placement={'left'} title={'Average'}>
                                      <Typography variant="caption">
                                        {Formatter.formatBalance(stats.reduce((acc, curr) => acc + curr.average, 0))}
                                      </Typography>
                                    </Tooltip>
                                    <Tooltip placement={'left'} title={'Total'}>
                                      <Typography variant="caption">
                                        {Formatter.formatBalance(stats.reduce((acc, curr) => acc + curr.total, 0))}
                                      </Typography>
                                    </Tooltip>
                                  </Stack>
                                }>
                                <ListItemText primary={'Combined'} />
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          )}
                          {stats.map(({name, total, average}, idx, arr) => (
                            <React.Fragment key={name.toLowerCase()}>
                              <ListItem
                                secondaryAction={
                                  <Stack textAlign={'right'}>
                                    <Tooltip placement={'left'} title={'Average'}>
                                      <Typography variant="caption">{Formatter.formatBalance(average)}</Typography>
                                    </Tooltip>
                                    <Tooltip placement={'left'} title={'Total'}>
                                      <Typography variant="caption">{Formatter.formatBalance(total)}</Typography>
                                    </Tooltip>
                                  </Stack>
                                }>
                                <ListItemText primary={name} />
                              </ListItem>
                              {idx !== arr.length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      </Card.Body>
                    </Card>
                  </Grid>
                </Grid>
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
        )
      ) : (
        <DesktopFeatureOnly
          sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        />
      )}
    </FullScreenDialog>
  );
};

export default InsightsView;
