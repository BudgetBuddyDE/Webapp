import {CircularProgress} from '@/components/Loading';
import {useTransactionStore} from '@/components/Transaction';

import {CategoryPieChart} from './CategoryPieChart.component';

/**
 * Renders a pie chart displaying the income per category.
 *
 * @returns The CategoryExpenseChart component.
 */
export const CategoryExpenseChart = () => {
  const {isLoading, data: transactions} = useTransactionStore();
  if (isLoading) return <CircularProgress />;
  return (
    <CategoryPieChart
      title="Category Expenses"
      subtitle="Expenses per category"
      transactionsType="EXPENSE"
      transactions={transactions ?? []}
    />
  );
};
