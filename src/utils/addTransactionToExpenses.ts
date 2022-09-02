import { IExpense, ITransaction } from '../types/transaction.interface';

export function addTransactionToExpenses(
  transaction: ITransaction,
  expenses: IExpense[],
  updateExpenses: (updatedExpenses: IExpense[]) => void
) {
  if (transaction.amount > 0) return;

  const index = expenses.findIndex((expense) => expense.category.id === transaction.categories.id);
  if (index > 0) {
    const outdated = expenses[index];
    expenses[index] = {
      ...outdated,
      sum: Math.abs(outdated.sum) + Math.abs(transaction.amount),
    };

    updateExpenses(expenses);
  } else
    updateExpenses([
      ...expenses,
      {
        sum: transaction.amount,
        category: {
          id: transaction.categories.id,
          name: transaction.categories.name,
          description: transaction.categories.description,
        },
        created_by: transaction.created_by,
      } as IExpense,
    ]);
}
