import {type TCategory} from '@budgetbuddyde/types';
import {ArrowRightRounded} from '@mui/icons-material';
import {Autocomplete, Box, Button, Paper, Skeleton, TextField, Typography} from '@mui/material';
import {ParentSize} from '@visx/responsive';
import {format, isBefore, isSameMonth, isSameYear} from 'date-fns';
import {debounce} from 'lodash';
import React from 'react';

import {BarChart, Card, StyledAutocompleteOption, type TBarChartData} from '@/components/Base';
import {useCategories} from '@/components/Category';
import {useSnackbarContext} from '@/components/Snackbar';
import {useTransactions} from '@/components/Transaction';
import {DateService, Formatter} from '@/services';

const MONTH_BACKLOG = 8;

export type TCategoryAnalytics = {
  monthBacklog?: number;
  onClickMoreDetails?: (selecetdCategory: TCategory) => void;
};

export const CategoryAnalytics: React.FC<TCategoryAnalytics> = ({monthBacklog = MONTH_BACKLOG, onClickMoreDetails}) => {
  const {showSnackbar} = useSnackbarContext();
  const {isLoading: isLoadingCategories, data: categories} = useCategories();
  const {isLoading: isLoadingTransactions, data: transactions} = useTransactions();
  const [selectedCategory, setSelectedCategory] = React.useState<TCategory['id'] | null>(null);
  const [activeBar, setActiveBar] = React.useState<TBarChartData | null>(null);

  const filterOptions = React.useMemo(() => {
    if (!categories) return [];
    return categories.map(({id, name}) => ({label: name, value: id}));
  }, [categories]);

  React.useEffect(() => {
    if (isLoadingCategories || !categories) return;
    setSelectedCategory(categories.length > 0 ? categories[0].id : null);
  }, [categories]);

  /**
   * FIXME: Add tests
   */
  const chartData = React.useMemo(() => {
    if (!transactions || !selectedCategory) return [];

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - (monthBacklog - 1), 1);
    /**
     * @key: date in format yyyy-MM
     * @value: total sum of transactions (expenses) in that month
     */
    const monthsBetween: Map<string, number> = new Map();

    let tempDate = startDate;
    while (tempDate <= today) {
      monthsBetween.set(format(tempDate, 'yyyy-MM'), 0);
      tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1);
    }

    for (const {
      processed_at,
      transfer_amount,
      expand: {
        category: {id: categoryId},
      },
    } of transactions) {
      if (categoryId !== selectedCategory) continue; // only-current-category
      if (transfer_amount >= 0) continue; // only-expenses
      const mapKey = format(processed_at, 'yyyy-MM');
      if (!monthsBetween.has(mapKey)) continue;

      const curVal = monthsBetween.get(mapKey) || 0;
      monthsBetween.set(mapKey, curVal + Math.abs(transfer_amount));
      if (isBefore(processed_at, startDate) && !isSameMonth(processed_at, new Date(mapKey))) break;
    }

    return Array.from(monthsBetween.entries()).map(([month, value]) => {
      return {
        date: new Date(month).toString(),
        value: value,
      };
    });
  }, [transactions, selectedCategory]);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Backlog</Card.Title>
          <Card.Subtitle>
            {!isLoadingCategories && !isLoadingTransactions && selectedCategory !== null
              ? `Average: ${Formatter.formatBalance(chartData.reduce((prev, cur) => prev + cur.value, 0) / monthBacklog)}`
              : 'Expenses per month'}
          </Card.Subtitle>
        </Box>

        {isLoadingCategories ? (
          <Skeleton variant="rounded" width={200} />
        ) : (
          <Autocomplete
            sx={{width: 200}}
            size="small"
            renderInput={params => <TextField {...params} label="Category" />}
            onChange={debounce((_event, newValue) => setSelectedCategory(newValue?.value || null))}
            value={filterOptions.find(({value}) => value === selectedCategory) || null}
            options={filterOptions}
            renderOption={(props, option, {selected}) => (
              <StyledAutocompleteOption {...props} selected={selected}>
                {option.label}
              </StyledAutocompleteOption>
            )}
          />
        )}
      </Card.Header>
      <Card.Body sx={{width: '100%', aspectRatio: '4/3', mt: 2}}>
        <Paper elevation={0} sx={{position: 'relative', width: '100%', height: '100%'}}>
          {!isLoadingCategories && !isLoadingTransactions && (chartData.length > 0 || activeBar) && (
            <Box
              sx={{
                position: 'absolute',
                top: theme => theme.spacing(1),
                left: theme => theme.spacing(1.5),
              }}>
              <Typography variant="caption">
                {DateService.getMonthFromDate(
                  new Date(activeBar ? activeBar.label : chartData[chartData.length - 1].date),
                )}
              </Typography>
              <Typography variant="subtitle1">
                {Formatter.formatBalance(activeBar ? activeBar.value : chartData[chartData.length - 1].value)}
              </Typography>
            </Box>
          )}

          <ParentSize>
            {({width, height}) =>
              isLoadingCategories || isLoadingTransactions || chartData.length === 0 ? (
                <Skeleton variant="rounded" width={width} height={height} />
              ) : (
                <BarChart
                  width={width}
                  height={height}
                  data={chartData.map(({date, value}) => ({label: date, value}))}
                  formatDate={dateString => {
                    const date = new Date(dateString);
                    return isSameYear(date, new Date())
                      ? DateService.shortMonthName(date)
                      : `${DateService.shortMonthName(date)} ${format(date, 'yy')}`;
                  }}
                  onSelectBar={debounce(bar => setActiveBar(bar), 150)}
                />
              )
            }
          </ParentSize>
        </Paper>
      </Card.Body>
      {onClickMoreDetails && (
        <Card.Footer sx={{display: 'flex', mt: 2}}>
          <Button
            onClick={() => {
              if (!categories) return;
              if (!selectedCategory) {
                showSnackbar({message: 'Please select an category first'});
              }
              // Can be forced because otherwise selectedCategory would be null

              onClickMoreDetails(categories.find(({id}) => id === selectedCategory)!);
            }}
            sx={{ml: 'auto'}}
            endIcon={<ArrowRightRounded />}>
            More details
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};
