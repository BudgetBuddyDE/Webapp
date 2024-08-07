import {CircularProgress} from '@/components/Loading';
import {useFetchTransactions} from '@/components/Transaction';

import {CategoryPieChart} from './CategoryPieChart.component';

/**
 * Renders a pie chart displaying the income per category.
 *
 * @returns The CategoryExpenseChart component.
 */
export const CategoryExpenseChart = () => {
  const {loading: isLoading, transactions} = useFetchTransactions();
  if (isLoading) return <CircularProgress />;
  return (
    <CategoryPieChart
      title="Category Expenses"
      subtitle="Expenses per category"
      transactionsType="EXPENSE"
      transactions={transactions}
    />
  );
};
