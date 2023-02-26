import { Transaction } from '../../models';
import { CategorySpendingsState } from '../../routes/dashboard.route';

type RequestedData = CategorySpendingsState['month'] | CategorySpendingsState['allTime'];

export function addTransactionToExpenses(
  transaction: Transaction,
  currentData: RequestedData,
  updateExpenses: (updated: CategorySpendingsState['month'] | CategorySpendingsState['allTime']) => void
) {
  if (transaction.amount > 0) return;

  const index = currentData.findIndex((entry) => entry.label === transaction.categories.name);
  if (index > 0) {
    const outdated = currentData[index];
    currentData[index] = {
      ...outdated,
      value: Math.abs(outdated.value + transaction.amount),
    };
    updateExpenses(currentData);
  } else {
    updateExpenses([...currentData, { label: transaction.categories.name, value: Math.abs(transaction.amount) }]);
  }
}
