import {CircularProgress} from '@/components/Loading';
import {useFetchTransactions} from '@/components/Transaction';

import {CategoryPieChart} from './CategoryPieChart.component';

/**
 * Renders a pie chart displaying the income per category.
 *
 * @returns The CategoryIncomeChart component.
 */
export const CategoryIncomeChart = () => {
  const {loading: isLoading, transactions} = useFetchTransactions();
  if (isLoading) return <CircularProgress />;
  return (
    <CategoryPieChart
      title="Category Income"
      subtitle="Income per category"
      transactionsType="INCOME"
      transactions={transactions}
    />
  );
};
