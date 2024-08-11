import React from 'react';

import {CircularProgress} from '@/components/Loading';
import {useTransactionStore} from '@/components/Transaction';

import {CategoryPieChart, type TCategoryPieChartProps} from './CategoryPieChart.component';

export type TCategoryExpenseChartProps = Pick<TCategoryPieChartProps, 'withViewMore'>;

/**
 * Renders a pie chart displaying the income per category.
 *
 * @returns The CategoryExpenseChart component.
 */
export const CategoryExpenseChart: React.FC<TCategoryExpenseChartProps> = ({withViewMore = false}) => {
  const {isLoading, data: transactions} = useTransactionStore();
  if (isLoading) return <CircularProgress />;
  return (
    <CategoryPieChart
      title={'Category Expenses'}
      subtitle={'Expenses per category'}
      transactionsType={'EXPENSE'}
      transactions={transactions ?? []}
      withViewMore={withViewMore}
    />
  );
};
