import { Transaction } from '@/models';
import type { CategorySpendingsState } from '@/reducer/CategorySpendings.reducer';

type RequestedData = CategorySpendingsState['month'] | CategorySpendingsState['allTime'];

export function addTransactionToExpenses(
    transaction: Transaction,
    currentData: RequestedData,
    updateExpenses: (updated: CategorySpendingsState['month'] | CategorySpendingsState['allTime']) => void
) {
    if (transaction.amount > 0) return;

    const index = currentData.findIndex((entry) => entry.label === transaction.categories.name);
    if (index !== -1) {
        const outdated = currentData[index];
        currentData[index] = {
            ...outdated,
            value: outdated.value + Math.abs(transaction.amount),
        };
        updateExpenses(currentData);
    } else {
        updateExpenses([...currentData, { label: transaction.categories.name, value: Math.abs(transaction.amount) }]);
    }
}
