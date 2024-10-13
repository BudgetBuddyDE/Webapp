import React from 'react';

import {CircularProgress} from '@/components/Loading';
import {useTransactions} from '@/features/Transaction';

import {CategoryPieChart, type TCategoryPieChartProps} from '../CategoryPieChart';

export type TCategoryIncomeChartProps = Pick<TCategoryPieChartProps, 'withViewMore'>;

/**
 * Renders a pie chart displaying the income per category.
 *
 * @returns The CategoryIncomeChart component.
 */
export const CategoryIncomeChart: React.FC<TCategoryIncomeChartProps> = ({withViewMore = false}) => {
  const {isLoading, data: transactions} = useTransactions();
  if (isLoading) return <CircularProgress />;
  return (
    <CategoryPieChart
      title={'Category Income'}
      subtitle={'Income per category'}
      transactionsType={'INCOME'}
      transactions={transactions ?? []}
      withViewMore={withViewMore}
    />
  );
};
